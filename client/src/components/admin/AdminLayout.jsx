import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-mist font-sans text-ink">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/admin"
            className="font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Listings admin
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="underline hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View site
            </Link>
            <span className="hidden text-[#b9c7cc] sm:inline">{user.name}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-white/30 px-3 py-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;