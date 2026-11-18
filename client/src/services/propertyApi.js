import { properties } from "../data/properties";

// true = use the local mock data, false = call your Express API
const USE_MOCK = false;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Turns a failed response into an Error that carries the HTTP status
async function toError(res, fallback) {
  let message = fallback;
  try {
    const body = await res.json();
    if (body && body.message) message = body.message;
  } catch {
    // response had no JSON body, keep the fallback message
  }
  const err = new Error(message);
  err.status = res.status;
  return err;
}

// ---------- Mock helpers (only used when USE_MOCK is true) ----------

function filterLocally(filters) {
  const { q, city, type, status, minPrice, maxPrice, beds, sort } = filters;
  const term = q.trim().toLowerCase();

  let result = properties.filter((p) => {
    if (term) {
      const haystack = `${p.title} ${p.area} ${p.city}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (city && p.city !== city) return false;
    if (type && p.type !== type) return false;
    if (status && p.status !== status) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (beds && p.beds < Number(beds)) return false;
    return true;
  });

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return result;
}

// The mock list has no description or extra photos, so we make some up
function withDetails(p) {
  return {
    ...p,
    description: `${p.title} is a ${p.type.toLowerCase()} in ${p.area}, ${p.city}. Contact the agent to arrange a viewing.`,
    images: [
      p.image,
      `https://picsum.photos/seed/prop${p.id}b/800/560`,
      `https://picsum.photos/seed/prop${p.id}c/800/560`,
      `https://picsum.photos/seed/prop${p.id}d/800/560`,
    ],
  };
}

// ---------- Public functions ----------

export async function getProperties(filters) {
  if (USE_MOCK) {
    await wait(400); // fake network delay so you can see the loading state
    return filterLocally(filters);
  }

  // Drop empty values so the URL stays clean
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const res = await fetch(`${API_URL}/properties?${params.toString()}`);
  if (!res.ok) throw await toError(res, "Could not load properties");
  return res.json();
}

export async function getPropertyById(id) {
  if (USE_MOCK) {
    await wait(400);
    const found = properties.find((p) => p.id === Number(id));
    if (!found) {
      const err = new Error("Property not found");
      err.status = 404;
      throw err;
    }
    return withDetails(found);
  }

  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(id)}`);
  if (!res.ok) throw await toError(res, "Could not load this property");
  return res.json();
}

export async function sendInquiry(propertyId, form) {
  if (USE_MOCK) {
    await wait(600);
    return { message: "Message sent" };
  }

  const res = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId, ...form }),
  });
  if (!res.ok) throw await toError(res, "Could not send your message");
  return res.json();
}

export const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ado-Ekiti"];
export const TYPES = ["House", "Apartment", "Land"];