import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// Compared against when the email doesn't exist, so a wrong email and a
// wrong password take about the same time to answer
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

// Very small in-memory brute-force guard: 10 failed tries per 15 minutes
// for each IP + email pair. It resets if the server restarts.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map();

function isBlocked(key) {
  if (failures.size > 5000) failures.clear(); // keep memory bounded
  const entry = failures.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key) {
  const entry = failures.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  const email = clean(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Enter your email and password" });
  }

  const key = `${req.ip}:${email}`;
  if (isBlocked(key)) {
    return res
      .status(429)
      .json({ message: "Too many attempts. Try again in a few minutes." });
  }

  const { rows } = await pool.query(
    "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];

  const passwordOk = await bcrypt.compare(
    password,
    user ? user.password_hash : DUMMY_HASH
  );

  if (!user || !passwordOk) {
    recordFailure(key);
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  failures.delete(key);

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me  (the React app calls this on page load to check the saved token)
router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;