import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CITIES, getPropertyById } from "../../services/propertyApi";
import { createProperty, updateProperty } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  title: "",
  city: "",
  area: "",
  type: "House",
  status: "sale",
  price: "",
  beds: "3",
  baths: "3",
  sqm: "",
  description: "",
  images: "", // one link per line
};

const fieldClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:bg-mist disabled:text-steel";

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
    </div>
  );
}

function PropertyForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loadState, setLoadState] = useState({ id: null, error: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const loading = isEditing && loadState.id !== id;
  const loadError = loadState.id === id ? loadState.error : "";

  // When editing, load the property and fill the form
  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    getPropertyById(id)
      .then((p) => {
        if (cancelled) return;
        const photos = p.images && p.images.length ? p.images : p.image ? [p.image] : [];
        setForm({
          title: p.title,
          city: p.city,
          area: p.area,
          type: p.type,
          status: p.status,
          price: String(p.price),
          beds: String(p.beds),
          baths: String(p.baths),
          sqm: String(p.sqm),
          description: p.description || "",
          images: photos.join("\n"),
        });
        setLoadState({ id, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadState({
            id,
            error:
              err.status === 404
                ? "That listing no longer exists."
                : err.message || "Could not load the listing.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      city: form.city,
      area: form.area,
      type: form.type,
      status: form.status,
      price: form.price === "" ? null : Number(form.price),
      beds: form.beds === "" ? 0 : Number(form.beds),
      baths: form.baths === "" ? 0 : Number(form.baths),
      sqm: form.sqm === "" ? 0 : Number(form.sqm),
      description: form.description,
      images: form.images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }
      navigate("/admin", {
        state: { notice: isEditing ? "Listing updated" : "Listing added" },
      });
    } catch (err) {
      if (err.status === 401) {
        logout(); // session expired, RequireAuth sends you to the login page
        return;
      }
      setError(err.message || "Could not save the listing");
      setSaving(false);
    }
  };

  const isLand = form.type === "Land";

  if (loading) {
    return <div className="h-96 rounded-lg bg-white motion-safe:animate-pulse" />;
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-line bg-white p-6">
        <p className="mb-4 text-red-800">{loadError}</p>
        <Link to="/admin" className="text-sm text-steel underline hover:text-ink">
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        to="/admin"
        className="mb-4 inline-block text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Back to listings
      </Link>

      <h1 className="mb-6 text-2xl font-bold">
        {isEditing ? "Edit listing" : "Add listing"}
      </h1>

      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-6">
        <Field label="Title" htmlFor="title">
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={150}
            placeholder="4-Bedroom Duplex, Lekki Phase 1"
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city">
            <input
              id="city"
              name="city"
              type="text"
              list="city-options"
              value={form.city}
              onChange={handleChange}
              required
              maxLength={80}
              className={fieldClass}
            />
            <datalist id="city-options">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Area or neighbourhood" htmlFor="area">
            <input
              id="area"
              name="area"
              type="text"
              value={form.area}
              onChange={handleChange}
              required
              maxLength={120}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property type" htmlFor="type">
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Land">Land</option>
            </select>
          </Field>

          <Field label="For sale or rent" htmlFor="status">
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
          </Field>
        </div>

        <Field
          label="Price (₦)"
          htmlFor="price"
          hint={
            form.status === "rent"
              ? "Rent per year, whole naira with no commas."
              : "Whole naira with no commas."
          }
        >
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bedrooms" htmlFor="beds" hint={isLand ? "Not used for land." : "0 means studio."}>
            <input
              id="beds"
              name="beds"
              type="number"
              min="0"
              max="50"
              step="1"
              value={isLand ? "0" : form.beds}
              onChange={handleChange}
              disabled={isLand}
              className={fieldClass}
            />
          </Field>

          <Field label="Bathrooms" htmlFor="baths">
            <input
              id="baths"
              name="baths"
              type="number"
              min="0"
              max="50"
              step="1"
              value={isLand ? "0" : form.baths}
              onChange={handleChange}
              disabled={isLand}
              className={fieldClass}
            />
          </Field>

          <Field label="Size (m²)" htmlFor="sqm">
            <input
              id="sqm"
              name="sqm"
              type="number"
              min="0"
              step="1"
              value={form.sqm}
              onChange={handleChange}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={5000}
            value={form.description}
            onChange={handleChange}
            className={fieldClass}
          />
        </Field>

        <Field
          label="Photos"
          htmlFor="images"
          hint="One link per line, up to 12. The first one is the cover photo. Links start with https://, or use a file from your site like /images/properties/1-1.jpg."
        >
          <textarea
            id="images"
            name="images"
            rows={5}
            value={form.images}
            onChange={handleChange}
            className={`${fieldClass} font-mono`}
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {saving ? "Saving..." : isEditing ? "Save changes" : "Add listing"}
          </button>
          <Link
            to="/admin"
            className="text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export default PropertyForm;