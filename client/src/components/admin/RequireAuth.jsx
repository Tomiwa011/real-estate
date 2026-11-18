import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Wrap any page that needs a signed-in agent. Everyone else is sent to the login page.
function RequireAuth({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center bg-mist font-sans text-steel"
      >
        Checking your session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAuth;