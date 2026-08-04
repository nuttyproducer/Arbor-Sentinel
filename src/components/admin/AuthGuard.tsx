// src/components/admin/AuthGuard.tsx
// Route guard component — checks authentication state and role.
// Redirects unauthenticated users to login.
// Shows loading state while checking auth.

import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthState, type AuthState } from '../../lib/auth/client';
import type { Role } from '../../lib/auth/roles';
import { meetsMinimumRole } from '../../lib/auth/roles';

export interface AuthGuardProps {
  children: ReactNode;
  /** Minimum role required to access the guarded content. Default: 'contributor'. */
  requiredRole?: Role;
  /** Where to redirect unauthenticated users. Default: '/admin/login'. */
  loginPath?: string;
}

export function AuthGuard({
  children,
  requiredRole = 'contributor',
  loginPath = '/admin/login',
}: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    email: null,
    role: null,
    is2FAVerified: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const state = await getAuthState();
      if (cancelled) return;
      setAuthState(state);
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone" aria-busy="true">
        <div className="font-mono text-sm text-charcoal/40">
          Verifying access…
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!authState.isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    navigate(`${loginPath}?return=${returnTo}`, { replace: true });
    return null;
  }

  // Role check — insufficient permissions
  if (authState.role && !meetsMinimumRole(authState.role, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone" role="alert">
        <div className="text-center max-w-md p-8 bg-white border border-charcoal/10 rounded-lg">
          <h1 className="font-serif text-xl font-semibold text-ink mb-2">
            Access Denied
          </h1>
          <p className="font-mono text-sm text-charcoal/60 mb-4">
            Your current role ({authState.role}) does not have permission to access this page.
            Required role: {requiredRole}.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-mono text-sm text-charcoal underline hover:text-ink"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
