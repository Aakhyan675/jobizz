import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { Spinner } from "./States";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: Role;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, role, allowedRoles }: { children: ReactNode; role?: Role; allowedRoles?: Role[] }) {
  return <RoleGuard allowedRoles={allowedRoles ?? (role ? [role] : undefined)}>{children}</RoleGuard>;
}

export function RoleGuard({ children, allowedRoles }: { children: ReactNode; allowedRoles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && allowedRoles.length > 0) {
    // Support is_staff admin fallback: if user is_staff and allowedRoles includes admin, allow
    const isAdmin = user.role === "admin" || (user as unknown as { is_staff?: boolean }).is_staff;
    const hasRole = allowedRoles.includes(user.role) || (isAdmin && allowedRoles.includes("admin"));
    if (!hasRole) {
      // Wrong role → redirect to home or show 403; spec says redirect to home or 403
      return <Navigate to="/" replace />;
    }
  }
  return children;
}

// 403 component for disallowed role (alternative to redirect)
export function Forbidden() {
  return (
    <div className="container-page py-16 text-center">
      <h1 className="text-3xl font-bold">403 — Forbidden</h1>
      <p className="mt-2 text-slate-500">You don&apos;t have permission to access this page.</p>
    </div>
  );
}
