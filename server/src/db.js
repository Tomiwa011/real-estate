import pg from "pg";

// Postgres returns BIGINT as a string by default. Our prices (naira)
// fit safely inside a JS number, so convert them.
pg.types.setTypeParser(20, (value) => Number(value));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted databases usually require SSL. Turn it on with DB_SSL=true
  ...(process.env.DB_SSL === "true"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export default pool;
