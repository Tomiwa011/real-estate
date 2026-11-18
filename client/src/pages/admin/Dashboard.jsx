import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProperties } from "../../services/propertyApi";
import { deleteProperty } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

const ALL = {
  q: "",
  city: "",
  type: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  sort: "newest",
};

const actionLink =
  "text-sm font-medium text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

function Dashboard() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // "Listing saved" style message passed from the form after a successful save
  const [notice, setNotice] = useState(location.state?.notice || "");

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getProperties(ALL)
      .then((data) => {
        if (!cancelled) setProperties(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load listings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const handleDelete = async (property) => {
    const sure = window.confirm(
      `Delete "${property.title}"?\n\nThis also deletes the messages sent about it. You can't undo this.`
    );
    if (!sure) return;

    setDeletingId(property.id);
    setNotice("");
    setError("");

    try {
      await deleteProperty(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setNotice("Listing deleted");
    } catch (err) {
      if (err.status === 401) {
        logout(); // session expired, RequireAuth sends you to the login page
        return;
      }
      setError(err.message || "Could not delete that listing");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          <p className="text-sm text-steel">
            {loading
              ? "Loading..."
              : `${properties.length} ${properties.length === 1 ? "listing" : "listings"}`}
          </p>
        </div>

        <Link
          to="/admin/properties/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Add listing
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900"
        >
          {notice}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-lg bg-white motion-safe:animate-pulse" />
      ) : properties.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-line bg-white px-4 py-16 text-center">
          <h2 className="mb-1 text-lg font-semibold">No listings yet</h2>
          <p className="mb-4 text-steel">Add your first property to get started.</p>
          <Link
            to="/admin/properties/new"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-steel"
          >
            Add listing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist text-steel">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Property</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link
                      to={`/properties/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="text-xs text-steel">
                      {p.area}, {p.city}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold text-white ${
                        p.status === "sale" ? "bg-sale" : "bg-rent"
                      }`}
                    >
                      {p.status === "sale" ? "For sale" : "For rent"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(p.price)}
                    {p.status === "rent" && (
                      <span className="text-steel"> / year</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link to={`/admin/properties/${p.id}/edit`} className={actionLink}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="text-sm font-medium text-red-700 underline hover:text-red-900 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Dashboard;