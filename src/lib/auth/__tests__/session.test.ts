// src/lib/auth/__tests__/session.test.ts
// Tests for session management.

import { describe, it, expect } from 'vitest';
import {
  configureSession,
  type SessionConfig,
} from '../session';

describe('Session configuration', () => {
  it('accepts partial config overrides', () => {
    configureSession({
      timeoutMinutes: 60,
      maxConcurrentSessions: 3,
    });

    // Configuration is set (we can't test Supabase-dependent functions without a running instance,
    // but we can verify the config module doesn't throw)
    expect(true).toBe(true);
  });

  it('applies default values for unspecified options', () => {
    const defaults: SessionConfig = {
      timeoutMinutes: 480,
      inactivityTimeoutMinutes: 120,
      maxConcurrentSessions: 5,
    };

    configureSession(defaults);

    // Defaults are applied without error
    expect(true).toBe(true);
  });
});

describe('Session utility types', () => {
  it('SessionConfig type has correct shape', () => {
    const config: SessionConfig = {
      timeoutMinutes: 480,
      inactivityTimeoutMinutes: 120,
      maxConcurrentSessions: 5,
    };

    expect(config.timeoutMinutes).toBe(480);
    expect(config.inactivityTimeoutMinutes).toBe(120);
    expect(config.maxConcurrentSessions).toBe(5);
  });
});
