CREATE TABLE IF NOT EXISTS properties (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  city        TEXT NOT NULL,
  area        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('House', 'Apartment', 'Land')),
  status      TEXT NOT NULL CHECK (status IN ('sale', 'rent')),
  price       BIGINT NOT NULL CHECK (price >= 0),
  beds        INTEGER NOT NULL DEFAULT 0,
  baths       INTEGER NOT NULL DEFAULT 0,
  sqm         INTEGER NOT NULL DEFAULT 0,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Added for the details page. Safe to run on a table that already exists.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_properties_city   ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price  ON properties (price);

-- Messages from the "contact agent" form
CREATE TABLE IF NOT EXISTS inquiries (
  id          SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries (property_id);

-- Agents who can sign in to the dashboard
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'agent',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);