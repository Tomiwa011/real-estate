import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Four placeholder photos per property (the first one is the cover image)
const photos = (n) => [
  `https://picsum.photos/seed/prop${n}/800/560`,
  `https://picsum.photos/seed/prop${n}b/800/560`,
  `https://picsum.photos/seed/prop${n}c/800/560`,
  `https://picsum.photos/seed/prop${n}d/800/560`,
];

// title, city, area, type, status, price, beds, baths, sqm, description, created_at
const properties = [
  ["4-Bedroom Duplex, Lekki Phase 1", "Lagos", "Lekki Phase 1", "House", "sale", 185000000, 4, 5, 320,
    "A bright four-bedroom duplex in a gated estate with 24-hour security and steady power. The ground floor has an open living and dining area, a fitted kitchen and a guest toilet. Upstairs, every bedroom has its own bathroom, and there is a boys' quarters at the back.",
    "2026-11-10"],
  ["2-Bedroom Apartment, Maitama", "Abuja", "Maitama", "Apartment", "rent", 6500000, 2, 2, 120,
    "A quiet two-bedroom apartment on the second floor of a small block, close to restaurants and embassies. Both bedrooms are en suite, the kitchen has fitted cabinets, and there is covered parking for two cars. Rent is paid yearly.",
    "2026-11-12"],
  ["3-Bedroom Bungalow, GRA Phase 2", "Port Harcourt", "GRA Phase 2", "House", "sale", 95000000, 3, 3, 210,
    "A well-kept three-bedroom bungalow on a large compound with room for a garden and four cars. It has a wide living room, a separate dining area and a store room. The street is tarred and the neighbourhood is calm.",
    "2026-11-02"],
  ["Mini Flat near ABUAD Campus", "Ado-Ekiti", "Afe Babalola Way", "Apartment", "rent", 450000, 1, 1, 45,
    "A neat one-bedroom mini flat a short walk from the campus gate. It has a tiled floor, a small kitchen, a shower room and a prepaid meter. Good for a student or a young professional. Rent is paid yearly.",
    "2026-11-14"],
  ["Commercial Plot, Ajah Corridor", "Lagos", "Ajah", "Land", "sale", 60000000, 0, 0, 600,
    "A dry, fenced 600 sqm plot on a busy road, suited to shops, offices or a small estate. The land is not in a flood area, and it comes with a survey plan and a registered title.",
    "2026-10-28"],
  ["5-Bedroom Detached, Asokoro", "Abuja", "Asokoro", "House", "sale", 420000000, 5, 6, 550,
    "A large five-bedroom detached house on a landscaped compound in one of Abuja's most secure districts. It has two living rooms, a home office, a swimming pool, a generator house and a two-room boys' quarters.",
    "2026-11-05"],
  ["3-Bedroom Flat, Old GRA", "Port Harcourt", "Old GRA", "Apartment", "rent", 3800000, 3, 3, 160,
    "A spacious three-bedroom flat in a gated block with a borehole, a standby generator and ample parking. All rooms are en suite and the kitchen is fitted. Rent is paid yearly.",
    "2026-11-16"],
  ["Serviced Studio, Victoria Island", "Lagos", "Victoria Island", "Apartment", "rent", 5200000, 0, 1, 55,
    "A fully serviced studio close to the business district. It comes furnished, with air conditioning, fast internet and cleaning included. Good for someone who wants to move in with only a suitcase. Rent is paid yearly.",
    "2026-11-09"],
];

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8");
  await pool.query(schema);

  // Wipe and reinsert so you can run this as many times as you like.
  // CASCADE also clears the inquiries table, which is fine while developing.
  await pool.query("TRUNCATE properties RESTART IDENTITY CASCADE");

  for (let i = 0; i < properties.length; i++) {
    const [title, city, area, type, status, price, beds, baths, sqm, description, createdAt] =
      properties[i];
    const images = photos(i + 1);

    await pool.query(
      `INSERT INTO properties
        (title, city, area, type, status, price, beds, baths, sqm, image, description, images, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [title, city, area, type, status, price, beds, baths, sqm, images[0], description, images, createdAt]
    );
  }

  console.log(`Seeded ${properties.length} properties`);
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());