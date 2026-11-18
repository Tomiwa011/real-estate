import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getMe,
  getToken,
  login as loginRequest,
  setToken,
} from "../services/adminApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check a saved token with the server on first load
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch((err) => {
        // Only forget the token if the server said it's invalid.
        // If the server was just unreachable, keep it for next time.
        if (err.status === 401) clearToken();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking,
      async login(email, password) {
        const result = await loginRequest(email, password);
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout() {
        clearToken();
        setUser(null);
      },
    }),
    [user, checking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}