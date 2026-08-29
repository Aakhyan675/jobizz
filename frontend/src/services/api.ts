import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * JWT storage: access + refresh tokens live in localStorage for this portfolio MVP.
 * Trade-off: convenient across reloads, but vulnerable to XSS. Prefer httpOnly cookies
 * in a production hardening pass.
 */
const ACCESS_KEY = "jobizz_access";
const REFRESH_KEY = "jobizz_refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh });
    setTokens(data.access, data.refresh);
    return data.access as string;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccess();
      const access = await refreshing;
      refreshing = null;
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export function getApiError(err: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (!data) return err.message || fallback;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.non_field_errors !== "undefined") {
      const v = data.non_field_errors as unknown;
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }
    // Collect all field errors: {email: [...], password: [...]}
    const messages: string[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val) && typeof val[0] === "string") messages.push(`${key}: ${val[0]}`);
      else if (typeof val === "string") messages.push(`${key}: ${val}`);
      else if (val && typeof val === "object") {
        const inner = Object.values(val as Record<string, unknown>)[0];
        if (Array.isArray(inner) && typeof inner[0] === "string") messages.push(inner[0]);
      }
    }
    if (messages.length) return messages.join(" • ");
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}
