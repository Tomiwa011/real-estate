import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const fieldClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

function Login() {
  const { user, checking, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Where to go after signing in (the page they were trying to open, or the dashboard)
  const destination = location.state?.from || "/admin";

  if (!checking && user) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 font-sans text-ink">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
        <h1 className="mb-1 text-2xl font-bold">Agent sign in</h1>
        <p className="mb-6 text-sm text-steel">
          Sign in to add and manage property listings.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className={fieldClass}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-1 block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 inline-block text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Back to the site
        </Link>
      </div>
    </main>
  );
}

export default Login;