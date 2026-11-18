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

const PROPERTY_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
];

export const getPropertyImage = (property, index = 0, useFallback = false) => {
  const propertyImages = Array.isArray(property?.images) ? property.images : [];
  const image = propertyImages[index] || (index === 0 ? property?.image : "");

  if (!useFallback && typeof image === "string" && image.trim()) {
    return image;
  }

  const propertyId = Number(property?.id);
  const imageOffset =
    Number.isSafeInteger(propertyId) && propertyId > 0 ? propertyId - 1 : 0;
  return PROPERTY_IMAGE_FALLBACKS[
    (imageOffset + index) % PROPERTY_IMAGE_FALLBACKS.length
  ];
};

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