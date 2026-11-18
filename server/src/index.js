import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRouter from "./routes/auth.js";
import propertiesRouter from "./routes/properties.js";
import inquiriesRouter from "./routes/inquiries.js";

// Refuse to start without a proper signing secret, so logins are never unsigned or guessable
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error(
    "JWT_SECRET is missing or too short. Add a long random string to server/.env (see .env.example)."
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Render (and most hosts) put a proxy in front of the app. Without this, req.ip
// would be the proxy's address for everyone, which breaks the login attempt limiter.
app.set("trust proxy", 1);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

// Cheap check for the host's health monitor. It doesn't touch the database,
// so it won't keep a sleeping Neon database awake.
app.get("/healthz", (req, res) => {
  res.send("ok");
});

// Quick way to check the server and database are both up
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "database unreachable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/inquiries", inquiriesRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Catches any error thrown in a route (Express 5 forwards async errors here)
app.use((err, req, res, next) => {
  // Bad JSON bodies and similar client mistakes carry a 4xx status
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: "Invalid request" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});