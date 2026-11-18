import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pool from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const name = (process.env.ADMIN_NAME || "Admin").trim();
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

async function createAdmin() {
  if (!email || password.length < 8) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters in server/.env"
    );
  }

  // Make sure the users table exists (safe to run repeatedly)
  const schema = fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8");
  await pool.query(schema);

  const passwordHash = await bcrypt.hash(password, 12);

  // Running this again with the same email resets that agent's password.
  // That's your "forgot password" fix while there's no reset page.
  await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
    [name, email, passwordHash]
  );

  console.log(`Agent login ready for ${email}`);
}

createAdmin()
  .catch((err) => {
    console.error("Could not create the admin:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());