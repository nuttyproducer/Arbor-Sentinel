// src/lib/auth/__tests__/roles.test.ts
// Tests for role definitions and permission checks.

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  roleLevel,
  meetsMinimumRole,
  requires2FA,
  canManageRoles,
  canViewAudit,
  ROLES,
  type Role,
} from '../roles';

describe('Role definitions', () => {
  it('defines all 8 roles', () => {
    const expectedRoles: Role[] = [
      'public',
      'contributor',
      'researcher',
      'moderator',
      'partner_org',
      'legal_reviewer',
      'security_admin',
      'admin',
    ];
    expect(Object.keys(ROLES)).toEqual(expect.arrayContaining(expectedRoles));
    expect(Object.keys(ROLES)).toHaveLength(8);
  });

  it('has unique role levels for each role', () => {
    const levels = Object.keys(ROLES).map((r) => roleLevel(r as Role));
    expect(new Set(levels).size).toBe(8); // all unique
  });

  it('admin role has the highest level', () => {
    expect(roleLevel('admin')).toBeGreaterThan(roleLevel('moderator'));
    expect(roleLevel('admin')).toBeGreaterThan(roleLevel('security_admin'));
  });

  it('public role has the lowest level', () => {
    expect(roleLevel('public')).toBe(0);
  });
});

describe('permission checks', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'content:read')).toBe(true);
    expect(hasPermission('admin', 'content:delete')).toBe(true);
    expect(hasPermission('admin', 'system:configure')).toBe(true);
    expect(hasPermission('admin', 'audit:export')).toBe(true);
  });

  it('public can read content but not create', () => {
    expect(hasPermission('public', 'content:read')).toBe(true);
    expect(hasPermission('public', 'content:create')).toBe(false);
    expect(hasPermission('public', 'content:delete')).toBe(false);
  });

  it('public can submit corrections', () => {
    expect(hasPermission('public', 'corrections:submit')).toBe(true);
  });

  it('researcher can create drafts but not publish', () => {
    expect(hasPermission('researcher', 'content:create')).toBe(true);
    expect(hasPermission('researcher', 'content:publish')).toBe(false);
  });

  it('moderator can publish but not configure system', () => {
    expect(hasPermission('moderator', 'content:publish')).toBe(true);
    expect(hasPermission('moderator', 'system:configure')).toBe(false);
    expect(hasPermission('moderator', 'roles:assign')).toBe(false);
  });

  it('security_admin can manage roles but not delete content', () => {
    expect(hasPermission('security_admin', 'roles:assign')).toBe(true);
    expect(hasPermission('security_admin', 'users:manage')).toBe(true);
    expect(hasPermission('security_admin', 'content:delete')).toBe(false);
  });

  it('hasAllPermissions checks all required permissions', () => {
    expect(hasAllPermissions('admin', ['content:read', 'content:create'])).toBe(true);
    expect(hasAllPermissions('public', ['content:read', 'content:create'])).toBe(false);
  });

  it('hasAnyPermission checks any permission', () => {
    expect(hasAnyPermission('public', ['content:read', 'content:delete'])).toBe(true);
    expect(hasAnyPermission('public', ['content:create', 'content:delete'])).toBe(false);
  });
});

describe('role level comparison', () => {
  it('admin meets all role requirements', () => {
    expect(meetsMinimumRole('admin', 'public')).toBe(true);
    expect(meetsMinimumRole('admin', 'admin')).toBe(true);
    expect(meetsMinimumRole('admin', 'security_admin')).toBe(true);
  });

  it('public does not meet contributor requirement', () => {
    expect(meetsMinimumRole('public', 'contributor')).toBe(false);
  });

  it('moderator meets researcher requirement but not admin', () => {
    expect(meetsMinimumRole('moderator', 'researcher')).toBe(true);
    expect(meetsMinimumRole('moderator', 'admin')).toBe(false);
  });
});

describe('2FA requirements', () => {
  it('public does not require 2FA', () => {
    expect(requires2FA('public')).toBe(false);
  });

  it('all non-public roles require 2FA', () => {
    const nonPublicRoles: Role[] = [
      'contributor',
      'researcher',
      'moderator',
      'partner_org',
      'legal_reviewer',
      'security_admin',
      'admin',
    ];
    for (const role of nonPublicRoles) {
      expect(requires2FA(role)).toBe(true);
    }
  });
});

describe('role management helpers', () => {
  it('only admin and security_admin can manage roles', () => {
    expect(canManageRoles('admin')).toBe(true);
    expect(canManageRoles('security_admin')).toBe(true);
    expect(canManageRoles('moderator')).toBe(false);
    expect(canManageRoles('public')).toBe(false);
  });

  it('admin and security_admin can view audit logs', () => {
    expect(canViewAudit('admin')).toBe(true);
    expect(canViewAudit('security_admin')).toBe(true);
    expect(canViewAudit('contributor')).toBe(false);
  });
});
