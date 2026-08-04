// src/lib/auth/index.ts
// Barrel export for the auth module.

export { signIn, signUp, getAuthState, sendPasswordResetEmail, updatePassword } from './client';
export type { SignInParams, SignInResult, SignUpParams, AuthState } from './client';

export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  roleLevel,
  meetsMinimumRole,
  requires2FA,
  canManageRoles,
  canViewAudit,
  ROLES,
} from './roles';
export type { Role, Permission } from './roles';

export {
  getCurrentSession,
  getCurrentUser,
  isSessionValid,
  refreshSession,
  signOut,
  onAuthStateChange,
  needsReauthentication,
  sessionTimeRemaining,
  configureSession,
} from './session';
export type { SessionConfig } from './session';

export {
  generateSecret,
  verifyTOTP,
  verifyTOTPWithRateLimit,
} from './2fa';
export type { TOTPSecret, TOTPVerificationResult } from './2fa';
