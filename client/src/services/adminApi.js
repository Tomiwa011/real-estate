// Everything the dashboard sends to the server. These calls always use the real API
// (there is no mock mode for the admin side).

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "re_admin_token";

// The login token lives in localStorage so you stay signed in after a refresh.
// try/catch because storage can be blocked in some browsers.
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore: you'll just need to sign in again after a refresh
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error("Can't reach the server. Is it running?");
    err.status = 0;
    throw err;
  }

  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const data = await res.json();
      if (data && data.message) message = data.message;
    } catch {
      // no JSON body, keep the default message
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const getMe = () => request("/auth/me");

export const createProperty = (data) =>
  request("/properties", { method: "POST", body: data });

export const updateProperty = (id, data) =>
  request(`/properties/${encodeURIComponent(id)}`, { method: "PUT", body: data });

export const deleteProperty = (id) =>
  request(`/properties/${encodeURIComponent(id)}`, { method: "DELETE" });