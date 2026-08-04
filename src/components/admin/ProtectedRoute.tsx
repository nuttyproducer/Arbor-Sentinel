// src/components/admin/ProtectedRoute.tsx
// Protected route wrapper — combines AuthGuard with React Router route.
// Use as a layout wrapper for admin route groups.

import { Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import type { Role } from '../../lib/auth/roles';

export interface ProtectedRouteProps {
  /** Minimum role required. Default: 'contributor'. */
  requiredRole?: Role;
  /** Login redirect path. Default: '/admin/login'. */
  loginPath?: string;
}

/**
 * Layout wrapper that protects all child routes behind authentication.
 *
 * Usage in router config:
 * ```tsx
 * <Route element={<ProtectedRoute requiredRole="admin" />}>
 *   <Route path="/admin/dashboard" element={<Dashboard />} />
 *   <Route path="/admin/users" element={<Users />} />
 * </Route>
 * ```
 */
export function ProtectedRoute({
  requiredRole = 'contributor',
  loginPath = '/admin/login',
}: ProtectedRouteProps) {
  return (
    <AuthGuard requiredRole={requiredRole} loginPath={loginPath}>
      <Outlet />
    </AuthGuard>
  );
}
