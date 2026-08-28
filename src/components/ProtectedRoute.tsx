import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "../stores/sessionStore";

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Route guard requiring active authentication.
 *
 * - Authenticated user: renders child route/outlet.
 * - First-time user (!hasSeenOnboarding): redirects to /splash.
 * - Returning logged-out user (hasSeenOnboarding): redirects to /sign-in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useSessionStore((s) => s.hasSeenOnboarding);
  const location = useLocation();

  if (!isAuthenticated) {
    if (!hasSeenOnboarding) {
      return <Navigate to="/splash" replace state={{ from: location }} />;
    }
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
