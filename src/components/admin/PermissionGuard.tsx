// src/components/admin/PermissionGuard.tsx
// Permission check component — hides or disables UI based on user permissions.

import { type ReactNode } from 'react';
import type { Permission, Role } from '../../lib/auth/roles';
import { hasPermission } from '../../lib/auth/roles';

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
  role: Role | null;
  /** Hide the element entirely (default) vs. disable it. */
  mode?: 'hide' | 'disable';
  /** Fallback content when hidden. */
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  role,
  mode = 'hide',
  fallback = null,
}: PermissionGuardProps) {
  const allowed = role ? hasPermission(role, permission) : false;

  if (!allowed && mode === 'hide') {
    return <>{fallback}</>;
  }

  if (!allowed && mode === 'disable') {
    return (
      <div className="opacity-40 pointer-events-none cursor-not-allowed" aria-disabled="true">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Check if a user has a specific permission. Returns boolean.
 * Use for conditional rendering in components.
 */
export function checkPermission(role: Role | null, permission: Permission): boolean {
  return role ? hasPermission(role, permission) : false;
}
