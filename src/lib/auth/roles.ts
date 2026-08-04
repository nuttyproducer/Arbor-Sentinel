// src/lib/auth/roles.ts
// Role definitions and permission checks for the Accountability Atlas.
// Roles: public, contributor, researcher, moderator, partner_org,
//         legal_reviewer, security_admin, admin

// ── Role type ─────────────────────────────────────────────────────────────────

export type Role =
  | 'public'
  | 'contributor'
  | 'researcher'
  | 'moderator'
  | 'partner_org'
  | 'legal_reviewer'
  | 'security_admin'
  | 'admin';

// ── Role metadata ─────────────────────────────────────────────────────────────

export interface RoleDefinition {
  role: Role;
  label: string;
  description: string;
  requires2FA: boolean;
  permissions: Permission[];
}

export type Permission =
  | 'content:read'
  | 'content:read_draft'
  | 'content:create'
  | 'content:update'
  | 'content:delete'
  | 'content:publish'
  | 'review:view'
  | 'review:assign'
  | 'review:approve'
  | 'review:reject'
  | 'corrections:submit'
  | 'corrections:moderate'
  | 'users:view'
  | 'users:manage'
  | 'roles:assign'
  | 'audit:view'
  | 'audit:export'
  | 'system:configure';

// ── Role definitions ──────────────────────────────────────────────────────────

export const ROLES: Record<Role, RoleDefinition> = {
  public: {
    role: 'public',
    label: 'Public',
    description: 'Unauthenticated visitor — read access to published content only',
    requires2FA: false,
    permissions: ['content:read', 'corrections:submit'],
  },
  contributor: {
    role: 'contributor',
    label: 'Contributor',
    description: 'Can submit corrections and view published content',
    requires2FA: true,
    permissions: ['content:read', 'corrections:submit'],
  },
  researcher: {
    role: 'researcher',
    label: 'Researcher',
    description: 'Can create draft content and view unpublished content',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'content:create',
      'review:view',
      'corrections:submit',
    ],
  },
  moderator: {
    role: 'moderator',
    label: 'Moderator',
    description: 'Can review and moderate content, manage review queue',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'content:create',
      'content:update',
      'content:publish',
      'review:view',
      'review:assign',
      'review:approve',
      'review:reject',
      'corrections:submit',
      'corrections:moderate',
    ],
  },
  partner_org: {
    role: 'partner_org',
    label: 'Partner Organization',
    description: 'Partner organization with limited content management access',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'content:create',
      'review:view',
      'corrections:submit',
    ],
  },
  legal_reviewer: {
    role: 'legal_reviewer',
    label: 'Legal Reviewer',
    description: 'Reviews legal content for accuracy and appropriate language',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'content:update',
      'review:view',
      'review:approve',
      'review:reject',
      'corrections:submit',
    ],
  },
  security_admin: {
    role: 'security_admin',
    label: 'Security Admin',
    description: 'Manages security configurations, audit logs, and user roles',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'audit:view',
      'audit:export',
      'users:view',
      'users:manage',
      'roles:assign',
      'corrections:submit',
    ],
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    description: 'Full system access — all permissions',
    requires2FA: true,
    permissions: [
      'content:read',
      'content:read_draft',
      'content:create',
      'content:update',
      'content:delete',
      'content:publish',
      'review:view',
      'review:assign',
      'review:approve',
      'review:reject',
      'corrections:submit',
      'corrections:moderate',
      'users:view',
      'users:manage',
      'roles:assign',
      'audit:view',
      'audit:export',
      'system:configure',
    ],
  },
};

// ── Permission helpers ────────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const roleDef = ROLES[role];
  return roleDef?.permissions.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions.
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions.
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get the numeric access level for comparison.
 * Higher number = more access.
 */
export function roleLevel(role: Role): number {
  const levels: Record<Role, number> = {
    public: 0,
    contributor: 1,
    partner_org: 2,
    researcher: 3,
    legal_reviewer: 4,
    moderator: 5,
    security_admin: 6,
    admin: 7,
  };
  return levels[role];
}

/**
 * Check if a role meets or exceeds a required minimum role.
 */
export function meetsMinimumRole(role: Role, minimum: Role): boolean {
  return roleLevel(role) >= roleLevel(minimum);
}

/**
 * Roles that require 2FA (all non-public roles).
 */
export function requires2FA(role: Role): boolean {
  return ROLES[role]?.requires2FA ?? false;
}

/**
 * Roles that can manage other users' roles.
 */
export function canManageRoles(role: Role): boolean {
  return role === 'admin' || role === 'security_admin';
}

/**
 * Roles that can view audit logs.
 */
export function canViewAudit(role: Role): boolean {
  return hasPermission(role, 'audit:view');
}
