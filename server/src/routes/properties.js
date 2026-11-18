import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// created_at is aliased to createdAt because that's what the React app expects
const LIST_COLUMNS = `id, title, city, area, type, status, price, beds, baths, sqm, image, created_at AS "createdAt"`;

// The details page also needs the description and the full photo set
const DETAIL_COLUMNS = `${LIST_COLUMNS}, description, images`;

// Only these ORDER BY clauses are allowed. User input never goes into the SQL itself.
const SORTS = {
  newest: "created_at DESC, id DESC",
  "price-asc": "price ASC, id ASC",
  "price-desc": "price DESC, id DESC",
};

const TYPES = ["House", "Apartment", "Land"];
const STATUSES = ["sale", "rent"];

// A photo must be an http(s) link or a path on this site like /images/x.jpg.
// This blocks things like javascript: links and protocol-relative //evil.com URLs.
const IMAGE_PATTERN = /^(https?:\/\/|\/(?!\/))\S+$/;

// Query params can arrive as arrays/objects (?city=a&city=b), so only accept plain strings
const asString = (value) => (typeof value === "string" ? value.trim() : "");

const asNumber = (value) => {
  const text = asString(value);
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// Whole numbers only. Returns null for blanks, decimals and anything that isn't a number.
const toInt = (value) => {
  const usable =
    typeof value === "number" || (typeof value === "string" && value.trim() !== "");
  if (!usable) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

// Stop users from sneaking % or _ wildcards into the search
const escapeLike = (text) => text.replace(/[\\%_]/g, "\\$&");

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
};

// Checks the body of a create/update request.
// Returns { error } with a message the form can show, or { data } ready for the database.
function parsePropertyBody(body) {
  const title = asString(body.title);
  const city = asString(body.city);
  const area = asString(body.area);
  const type = asString(body.type);
  const status = asString(body.status);
  const description = asString(body.description);
  const price = toInt(body.price);
  const sqm = toInt(body.sqm ?? 0);
  let beds = toInt(body.beds ?? 0);
  let baths = toInt(body.baths ?? 0);
  const images = Array.isArray(body.images)
    ? body.images.map(asString).filter(Boolean)
    : [];

  if (title.length < 3 || title.length > 150) {
    return { error: "Title must be 3 to 150 characters" };
  }
  if (!city || city.length > 80) return { error: "Enter the city" };
  if (!area || area.length > 120) return { error: "Enter the area or neighbourhood" };
  if (!TYPES.includes(type)) return { error: "Choose a property type" };
  if (!STATUSES.includes(status)) return { error: "Choose for sale or for rent" };
  if (price === null || price < 0 || price > 100_000_000_000) {
    return { error: "Enter a valid price in naira (whole number, no commas)" };
  }
  if (beds === null || baths === null || beds < 0 || baths < 0 || beds > 50 || baths > 50) {
    return { error: "Bedrooms and bathrooms must be between 0 and 50" };
  }
  if (sqm === null || sqm < 0 || sqm > 1_000_000) {
    return { error: "Enter a valid size in square metres" };
  }
  if (description.length > 5000) {
    return { error: "Keep the description under 5000 characters" };
  }
  if (images.length > 12) return { error: "Add up to 12 photos" };
  if (images.some((img) => img.length > 500 || !IMAGE_PATTERN.test(img))) {
    return {
      error:
        "Each photo must be a link starting with http:// or https://, or a path starting with /",
    };
  }

  // Land has no rooms
  if (type === "Land") {
    beds = 0;
    baths = 0;
  }

  return {
    data: {
      title,
      city,
      area,
      type,
      status,
      price,
      beds,
      baths,
      sqm,
      description,
      images,
      image: images[0] ?? null, // the first photo is the cover
    },
  };
}

// GET /api/properties?q=&city=&type=&status=&minPrice=&maxPrice=&beds=&sort=
router.get("/", async (req, res) => {
  const q = asString(req.query.q);
  const city = asString(req.query.city);
  const type = asString(req.query.type);
  const status = asString(req.query.status);
  const minPrice = asNumber(req.query.minPrice);
  const maxPrice = asNumber(req.query.maxPrice);
  const beds = asNumber(req.query.beds);
  const sort = asString(req.query.sort);

  const conditions = [];
  const values = [];

  // Pushes the value and returns its placeholder ($1, $2, ...)
  const param = (value) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (q) {
    const p = param(`%${escapeLike(q)}%`);
    conditions.push(`(title ILIKE ${p} OR area ILIKE ${p} OR city ILIKE ${p})`);
  }
  if (city) conditions.push(`city = ${param(city)}`);
  if (type) conditions.push(`type = ${param(type)}`);
  if (status) conditions.push(`status = ${param(status)}`);
  if (minPrice !== null) conditions.push(`price >= ${param(minPrice)}`);
  if (maxPrice !== null) conditions.push(`price <= ${param(maxPrice)}`);
  if (beds !== null && beds > 0) conditions.push(`beds >= ${param(beds)}`);

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderSql = Object.hasOwn(SORTS, sort) ? SORTS[sort] : SORTS.newest;

  // LIMIT is a safety cap for now. Add proper pagination when the data grows.
  const { rows } = await pool.query(
    `SELECT ${LIST_COLUMNS} FROM properties ${whereSql} ORDER BY ${orderSql} LIMIT 100`,
    values
  );

  res.json(rows);
});

// GET /api/properties/:id  (used by the details page and the edit form)
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const { rows } = await pool.query(
    `SELECT ${DETAIL_COLUMNS} FROM properties WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(rows[0]);
});

// POST /api/properties  (agents only)
router.post("/", requireAuth, async (req, res) => {
  const { error, data } = parsePropertyBody(req.body ?? {});
  if (error) return res.status(400).json({ message: error });

  const { rows } = await pool.query(
    `INSERT INTO properties
      (title, city, area, type, status, price, beds, baths, sqm, image, description, images)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING ${DETAIL_COLUMNS}`,
    [
      data.title, data.city, data.area, data.type, data.status, data.price,
      data.beds, data.baths, data.sqm, data.image, data.description, data.images,
    ]
  );

  res.status(201).json(rows[0]);
});

// PUT /api/properties/:id  (agents only)
router.put("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const { error, data } = parsePropertyBody(req.body ?? {});
  if (error) return res.status(400).json({ message: error });

  const { rows } = await pool.query(
    `UPDATE properties SET
       title = $1, city = $2, area = $3, type = $4, status = $5, price = $6,
       beds = $7, baths = $8, sqm = $9, image = $10, description = $11, images = $12
     WHERE id = $13
     RETURNING ${DETAIL_COLUMNS}`,
    [
      data.title, data.city, data.area, data.type, data.status, data.price,
      data.beds, data.baths, data.sqm, data.image, data.description, data.images,
      id,
    ]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(rows[0]);
});

// DELETE /api/properties/:id  (agents only). Its contact messages are deleted with it.
router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const result = await pool.query("DELETE FROM properties WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.status(204).end();
});

export default router;