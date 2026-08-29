import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../services/api";
import { authApi } from "../services/endpoints";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, string>) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const data = await authApi.login(email, password);
        setTokens(data.access, data.refresh);
        setUser(data.user);
        return data.user;
      },
      register: async (payload) => {
        const data = await authApi.register(payload);
        setTokens(data.access, data.refresh);
        setUser(data.user);
        return data.user;
      },
      logout: async () => {
        const refresh = getRefreshToken();
        try {
          if (refresh) await authApi.logout(refresh);
        } catch {
          /* client-side logout still proceeds */
        }
        clearTokens();
        setUser(null);
      },
      refreshUser: async () => {
        const me = await authApi.me();
        setUser(me);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function dashboardPath(role?: Role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "employer") return "/employer/dashboard";
  return "/seeker/dashboard";
}

// Backwards-compat alias used by older routes/tests
export const getDashboardPath = dashboardPath;
