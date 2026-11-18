import { Router } from "express";
import pool from "../db.js";

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

// Query params can arrive as arrays/objects (?city=a&city=b), so only accept plain strings
const asString = (value) => (typeof value === "string" ? value.trim() : "");

const asNumber = (value) => {
  const text = asString(value);
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// Stop users from sneaking % or _ wildcards into the search
const escapeLike = (text) => text.replace(/[\\%_]/g, "\\$&");

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

// GET /api/properties/:id  (used by the details page)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid property id" });
  }

  const { rows } = await pool.query(
    `SELECT ${DETAIL_COLUMNS} FROM properties WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(rows[0]);
});

export default router;