import jwt from "jsonwebtoken";
import pool from "../db.js";

// Put this in front of any route that only signed-in agents may use.
// The browser sends:  Authorization: Bearer <token>
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please sign in" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }

  // Look the user up every time, so removing someone from the table cuts off their access
  const { rows } = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [payload.sub]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Please sign in" });
  }

  req.user = rows[0];
  next();
}