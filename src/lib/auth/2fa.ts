// src/lib/auth/2fa.ts
// TOTP-based 2FA enrollment and verification.
// Uses the Web Crypto API for TOTP generation.
// Rate-limited: max 5 failed attempts per 15 minutes.

import { supabase } from '../db/client';

// ── TOTP Configuration ────────────────────────────────────────────────────────

const TOTP_PERIOD = 30;        // seconds
const TOTP_DIGITS = 6;         // code length
const TOTP_ALGORITHM = 'SHA-1'; // HMAC algorithm
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TOTPSecret {
  secret: string;         // base32-encoded secret
  uri: string;            // otpauth:// URI for QR code
  qrCodeUrl: string;      // data URL for QR code rendering
}

export interface TOTPVerificationResult {
  success: boolean;
  remainingAttempts: number;
  lockedOut: boolean;
  lockoutRemainingMinutes: number;
}

// ── Base32 encoding/decoding (client-side, no external deps) ─────────────────

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBytes(base32: string): Uint8Array {
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const bits: number[] = [];

  for (const char of cleaned) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) throw new Error(`Invalid base32 character: ${char}`);
    bits.push(...val.toString(2).padStart(5, '0').split('').map(Number));
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i * 8 + j];
    }
    bytes[i] = byte;
  }
  return bytes;
}

function bytesToBase32(bytes: Uint8Array): string {
  const bits: number[] = [];
  for (const byte of bytes) {
    bits.push(...byte.toString(2).padStart(8, '0').split('').map(Number));
  }

  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5);
    while (chunk.length < 5) chunk.push(0);
    const val = parseInt(chunk.join(''), 2);
    base32 += BASE32_ALPHABET[val];
  }

  // Pad to multiple of 8
  while (base32.length % 8 !== 0) base32 += '=';
  return base32;
}

// ── Secure random generation ──────────────────────────────────────────────────

function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// ── TOTP Generation (RFC 6238) ────────────────────────────────────────────────

async function generateTOTP(secretBytes: Uint8Array, timestamp?: number): Promise<string> {
  const time = timestamp ?? Math.floor(Date.now() / 1000);
  let counter = Math.floor(time / TOTP_PERIOD);

  // Create counter buffer (8 bytes, big-endian)
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter >>= 8;
  }

  // Import HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: TOTP_ALGORITHM },
    false,
    ['sign'],
  );

  // Sign counter
  const signature = await crypto.subtle.sign('HMAC', key, counterBytes);
  const sigBytes = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = sigBytes[sigBytes.length - 1] & 0x0f;
  const truncated =
    ((sigBytes[offset] & 0x7f) << 24) |
    ((sigBytes[offset + 1] & 0xff) << 16) |
    ((sigBytes[offset + 2] & 0xff) << 8) |
    (sigBytes[offset + 3] & 0xff);

  const code = truncated % Math.pow(10, TOTP_DIGITS);
  return code.toString().padStart(TOTP_DIGITS, '0');
}

// ── Enrollment ────────────────────────────────────────────────────────────────

/**
 * Generate a new TOTP secret for 2FA enrollment.
 * The secret is NOT stored server-side by this function —
 * that happens after successful verification.
 */
export function generateSecret(): TOTPSecret {
  const secretBytes = generateRandomBytes(20); // 160 bits
  const secret = bytesToBase32(secretBytes);

  const issuer = encodeURIComponent('Arbor Sentinel');
  const account = 'admin';
  const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

  // Generate QR code data URL via Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(uri)}`;

  return { secret, uri, qrCodeUrl };
}

/**
 * Verify a TOTP code against a secret.
 */
export async function verifyTOTP(secret: string, code: string): Promise<boolean> {
  try {
    const secretBytes = base32ToBytes(secret);
    const expectedCode = await generateTOTP(secretBytes);
    return code === expectedCode;
  } catch {
    return false;
  }
}

// ── Rate-limited verification ─────────────────────────────────────────────────

/**
 * Verify a TOTP code with rate limiting.
 * Tracks failed attempts and enforces lockout.
 */
export async function verifyTOTPWithRateLimit(
  userId: string,
  secret: string,
  code: string,
): Promise<TOTPVerificationResult> {
  // Check recent failed attempts
  const { data: attempts, error: attemptsError } = await supabase
    .rpc('recent_failed_2fa_attempts', { check_user_id: userId });

  const failedCount = attemptsError ? 0 : (attempts as number);

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    // Calculate lockout remaining time from the earliest failed attempt
    const { data: earliestAttempt } = await supabase
      .from('two_factor_attempts')
      .select('attempt_at')
      .eq('user_id', userId)
      .eq('success', false)
      .order('attempt_at', { ascending: false })
      .limit(1)
      .single();

    if (earliestAttempt) {
      const lockoutUntil = new Date(earliestAttempt.attempt_at).getTime() + LOCKOUT_MINUTES * 60 * 1000;
      const remainingMs = Math.max(0, lockoutUntil - Date.now());
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      if (remainingMinutes > 0) {
        return {
          success: false,
          remainingAttempts: 0,
          lockedOut: true,
          lockoutRemainingMinutes: remainingMinutes,
        };
      }
    }
  }

  // Verify the code
  const isValid = await verifyTOTP(secret, code);

  // Record the attempt
  await supabase.from('two_factor_attempts').insert({
    user_id: userId,
    success: isValid,
  });

  if (isValid) {
    return {
      success: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      lockedOut: false,
      lockoutRemainingMinutes: 0,
    };
  }

  const remaining = MAX_FAILED_ATTEMPTS - failedCount - 1;
  return {
    success: false,
    remainingAttempts: Math.max(0, remaining),
    lockedOut: remaining <= 0,
    lockoutRemainingMinutes: remaining <= 0 ? LOCKOUT_MINUTES : 0,
  };
}
