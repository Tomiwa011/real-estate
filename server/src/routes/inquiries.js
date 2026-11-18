import { Router } from "express";
import pool from "../db.js";

const router = Router();

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/inquiries  { propertyId, name, email, phone?, message }
router.post("/", async (req, res) => {
  const propertyId = Number(req.body?.propertyId);
  const name = clean(req.body?.name);
  const email = clean(req.body?.email);
  const phone = clean(req.body?.phone);
  const message = clean(req.body?.message);

  // Return the first problem found, in plain language the form can show as-is
  let problem = "";
  if (!Number.isInteger(propertyId) || propertyId < 1) {
    problem = "Invalid property";
  } else if (name.length < 2 || name.length > 100) {
    problem = "Enter your name (2 to 100 characters)";
  } else if (!EMAIL_PATTERN.test(email) || email.length > 200) {
    problem = "Enter a valid email address";
  } else if (phone.length > 30) {
    problem = "That phone number is too long";
  } else if (message.length < 10 || message.length > 2000) {
    problem = "Write a message between 10 and 2000 characters";
  }

  if (problem) return res.status(400).json({ message: problem });

  try {
    await pool.query(
      `INSERT INTO inquiries (property_id, name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [propertyId, name, email, phone || null, message]
    );
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    // 23503 = foreign key violation, meaning the property doesn't exist
    if (err.code === "23503") {
      return res.status(404).json({ message: "Property not found" });
    }
    throw err;
  }
});

export default router;