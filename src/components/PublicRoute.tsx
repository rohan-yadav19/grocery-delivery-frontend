import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "../stores/sessionStore";

interface PublicRouteProps {
  children?: ReactNode;
}

/**
 * Route guard for public auth entry screens.
 *
 * Prevents authenticated users from accessing login, signup, welcome, splash.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
