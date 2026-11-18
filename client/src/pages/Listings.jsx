import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { getProperties, CITIES, TYPES } from "../services/propertyApi";
import "./Home.css";

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

  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((element) => element.classList.add("reveal-ready"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

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
    <main className="home min-h-screen bg-white font-sans text-ink">
      <nav className="home-nav" aria-label="Main navigation">
        <div className="home-nav__inner">
          <a className="home-brand" href="#home" aria-label="Terra Homes home">
            <span className="home-brand__mark" aria-hidden="true">
              T
            </span>
            <span>
              terra<span className="home-brand__light">homes</span>
            </span>
          </a>
          <div className="home-nav__links">
            <a href="#home">Home</a>
            <a href="#properties">Find a home</a>
            <a href="#about">Our approach</a>
          </div>
          <a className="home-nav__cta" href="#properties">
            Explore homes <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>

      <section className="home-hero" id="home">
        <div className="home-hero__image" aria-hidden="true" />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="home-eyebrow">A better place to begin</p>
          <h1>
            Find a place
            <br />
            to call <em>yours.</em>
          </h1>
          <p className="home-hero__intro">
            Thoughtful homes. Trusted listings. A simpler way to find your next
            chapter in Nigeria.
          </p>
          <div className="home-hero__actions">
            <a className="home-button" href="#properties">
              Explore properties <span aria-hidden="true">→</span>
            </a>
            <span className="home-hero__note">Homes for sale and rent</span>
          </div>
          <div className="home-search">
            <span className="home-search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              name="q"
              value={filters.q}
              onChange={handleChange}
              placeholder="Try Lekki, Abuja, or a home style"
              aria-label="Search properties by area, city or title"
            />
            <a href="#properties" aria-label="View property search results">
              Search
            </a>
          </div>
        </div>
        <a className="home-scroll" href="#properties">
          <span aria-hidden="true">↓</span> Scroll to discover
        </a>
        <div className="home-hero__index" aria-hidden="true">
          01 <span />
        </div>
      </section>

      <section className="home-proof" aria-label="Why choose Terra Homes">
        <div className="home-proof__item">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=320&q=75"
            alt="Warm, modern living room"
            loading="lazy"
          />
          <div>
            <strong>Find your fit</strong>
            <span>Homes for every kind of next</span>
          </div>
        </div>
        <div className="home-proof__item">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=320&q=75"
            alt="Contemporary home surrounded by greenery"
            loading="lazy"
          />
          <div>
            <strong>Explore with ease</strong>
            <span>Search by city, type, and budget</span>
          </div>
        </div>
        <div className="home-proof__item">
          <img
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=320&q=75"
            alt="Bright home interior with natural finishes"
            loading="lazy"
          />
          <div>
            <strong>Move with confidence</strong>
            <span>Clear details to help you decide</span>
          </div>
        </div>
      </section>

      <section className="home-discover scroll-reveal" id="about">
        <div className="home-discover__copy">
          <p className="home-eyebrow home-eyebrow--dark">More than a listing</p>
          <h2>A good move starts with feeling at home.</h2>
          <p>
            The right home is about more than an address. Explore places across
            Nigeria and find the one that feels right for the way you want to
            live.
          </p>
          <a className="home-text-link" href="#properties">
            Find your next home <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="home-discover__visual">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85"
            alt="Modern home with an inviting outdoor living space"
            loading="lazy"
          />
          <span>Room to make it your own</span>
        </div>
      </section>

      <section className="home-listings" id="properties">
        <div className="home-listings__heading scroll-reveal">
          <div>
            <p className="home-eyebrow home-eyebrow--dark">The collection</p>
            <h2>Places worth coming home to</h2>
          </div>
          <p>Explore homes and land for sale or rent across Nigeria.</p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 pt-6 lg:grid-cols-[260px_1fr]">
          <aside
            aria-label="Filters"
            className="home-filter self-start rounded-lg bg-mist p-5 lg:sticky lg:top-24"
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

          <div className="scroll-reveal" aria-live="polite">
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
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <a className="home-brand home-brand--footer" href="#home">
            <span className="home-brand__mark" aria-hidden="true">
              T
            </span>
            <span>
              terra<span className="home-brand__light">homes</span>
            </span>
          </a>
          <p>Find a place to call yours.</p>
          <a className="home-text-link home-text-link--light" href="#home">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </footer>
    </main>
  );
}

export default Listings;