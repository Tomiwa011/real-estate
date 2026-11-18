export const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Inline fallback so a dead image URL never leaves an empty box
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560">
       <rect width="100%" height="100%" fill="#eef2f3"/>
       <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
             font-family="sans-serif" font-size="28" fill="#2f4a56">No photo yet</text>
     </svg>`
  );