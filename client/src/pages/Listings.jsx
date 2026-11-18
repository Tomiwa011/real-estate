import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { getProperties, CITIES, TYPES } from "../services/propertyApi";

const EMPTY_FILTERS = {
  q: "",
  city: "",
  type: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  sort: "newest",
};

// Shared look for every input/select so they stay consistent
const fieldClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const labelClass = "mb-1 block text-sm font-semibold text-ink";

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div className="mb-4">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={fieldClass}
      >
        {children}
      </select>
    </div>
  );
}

function Listings() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => setFilters(EMPTY_FILTERS);

  // Re-fetch whenever filters change. The short timeout stops us from
  // hitting the API on every single keystroke in the search box.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const data = await getProperties(filters);
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      {/* Hero */}
      <header className="bg-ink px-4 pb-12 pt-14 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Find a place that fits
          </h1>
          <p className="mb-6 max-w-[48ch] text-[#b9c7cc]">
            Search homes and land for sale or rent across Nigeria.
          </p>

          <input
            type="search"
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Search by area, city or title"
            aria-label="Search properties"
            className="w-full max-w-xl rounded-md bg-white px-4 py-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside
          aria-label="Filters"
          className="self-start rounded-lg bg-mist p-5 lg:sticky lg:top-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Filters</h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Clear all
            </button>
          </div>

          <SelectField
            id="status"
            label="Buy or rent"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </SelectField>

          <SelectField
            id="city"
            label="City"
            value={filters.city}
            onChange={handleChange}
          >
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="type"
            label="Property type"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="beds"
            label="Bedrooms"
            value={filters.beds}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </SelectField>

          <p className={labelClass}>Price (₦)</p>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="Min"
              min="0"
              aria-label="Minimum price"
              className={fieldClass}
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="Max"
              min="0"
              aria-label="Maximum price"
              className={fieldClass}
            />
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p>
              {loading
                ? "Loading properties..."
                : `${results.length} ${
                    results.length === 1 ? "property" : "properties"
                  } found`}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm">
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleChange}
                className={`${fieldClass} !w-auto`}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800"
            >
              {error}. Check your connection and try again.
            </div>
          )}

          {loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-[340px] rounded-lg bg-mist motion-safe:animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="rounded-lg border border-dashed border-line px-4 py-16 text-center">
              <h3 className="mb-1 text-lg font-semibold">
                No properties match those filters
              </h3>
              <p className="mb-4 text-steel">
                Try widening your price range or clearing a filter.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Listings;