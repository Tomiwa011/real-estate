import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import propertiesRouter from "./routes/properties.js";
import inquiriesRouter from "./routes/inquiries.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

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