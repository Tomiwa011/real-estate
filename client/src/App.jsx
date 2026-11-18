import { Link, Route, Routes } from "react-router-dom";
import Listings from "./pages/Listings";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import PropertyForm from "./pages/admin/PropertyForm";
import RequireAuth from "./components/admin/RequireAuth";
import AdminLayout from "./components/admin/AdminLayout";

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-sans text-ink">
      <h1 className="mb-2 text-3xl font-bold">Page not found</h1>
      <p className="mb-6 text-steel">That address doesn't lead anywhere.</p>
      <Link
        to="/"
        className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-steel"
      >
        Back to listings
      </Link>
    </main>
  );
}

function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Listings />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />

      {/* Agent dashboard */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="properties/new" element={<PropertyForm />} />
        <Route path="properties/:id/edit" element={<PropertyForm />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;