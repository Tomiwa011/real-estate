import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PropertyGallery from "../components/PropertyGallery";
import InquiryForm from "../components/InquiryForm";
import { getPropertyById } from "../services/propertyApi";
import { formatDate, formatPrice } from "../utils/format";

const backLinkClass =
  "inline-block text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProperty(null);

    getPropertyById(id)
      .then((data) => {
        if (!cancelled) setProperty(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  useEffect(() => {
    if (property) document.title = property.title;
  }, [property]);

  // Loading skeleton
  if (loading) {
    return (
      <main className="min-h-screen bg-white font-sans text-ink">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 h-5 w-32 rounded bg-mist motion-safe:animate-pulse" />
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="aspect-[10/7] rounded-lg bg-mist motion-safe:animate-pulse" />
            <div className="h-96 rounded-lg bg-mist motion-safe:animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // Not found, or the server failed
  if (error || !property) {
    const notFound = error && error.status === 404;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-sans text-ink">
        <h1 className="mb-2 text-2xl font-bold">
          {notFound ? "We couldn't find that property" : "Something went wrong"}
        </h1>
        <p className="mb-6 max-w-md text-steel">
          {notFound
            ? "It may have been sold, rented out or removed."
            : "We couldn't load this property. Check your connection and try again."}
        </p>
        <div className="flex items-center gap-4">
          {!notFound && (
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Try again
            </button>
          )}
          <Link to="/" className={backLinkClass}>
            Back to listings
          </Link>
        </div>
      </main>
    );
  }

  const { title, area, city, type, status, price, beds, baths, sqm, description, images, createdAt } =
    property;

  const isSale = status === "sale";
  const isLand = type === "Land";
  const isStudio = !isLand && beds === 0;

  // Only show the facts that make sense for this kind of property
  const facts = [];
  if (!isLand) {
    facts.push({ label: "Bedrooms", value: isStudio ? "Studio" : beds });
    if (baths > 0) facts.push({ label: "Bathrooms", value: baths });
  }
  if (sqm) facts.push({ label: "Size", value: `${sqm} m²` });
  facts.push({ label: "Type", value: type });

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link to="/" className={backLinkClass}>
          Back to listings
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4">
              <span
                className={`mb-2 inline-block rounded px-2.5 py-1 text-xs font-semibold text-white ${
                  isSale ? "bg-sale" : "bg-rent"
                }`}
              >
                {isSale ? "For sale" : "For rent"}
              </span>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-steel">
                {area}, {city}
              </p>
            </div>

            {/* key makes the gallery start from photo 1 for each property */}
            <PropertyGallery
              key={property.id}
              images={images}
              title={title}
              property={property}
            />

            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-lg bg-mist p-5 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-steel">{fact.label}</dt>
                  <dd className="text-lg font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <section className="mt-8">
              <h2 className="mb-2 text-xl font-semibold">About this property</h2>
              <p className="max-w-[70ch] leading-relaxed text-ink">
                {description || "The agent hasn't added a description yet."}
              </p>
              {createdAt && (
                <p className="mt-4 text-sm text-steel">
                  Listed on {formatDate(createdAt)}
                </p>
              )}
            </section>
          </div>

          <aside className="self-start rounded-lg border border-line p-5 lg:sticky lg:top-4">
            <p className="mb-5 border-b border-line pb-5 text-3xl font-bold">
              {formatPrice(price)}
              {!isSale && (
                <span className="ml-1 text-base font-medium text-steel">/ year</span>
              )}
            </p>

            {/* key resets the form when you move to a different property */}
            <InquiryForm
              key={property.id}
              propertyId={property.id}
              propertyTitle={title}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PropertyDetails;