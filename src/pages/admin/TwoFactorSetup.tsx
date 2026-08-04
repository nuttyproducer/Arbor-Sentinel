// src/pages/admin/TwoFactorSetup.tsx
// 2FA enrollment page — displays QR code and verifies setup code.

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSecret, verifyTOTP, type TOTPSecret } from '../../lib/auth/2fa';
import { supabase } from '../../lib/db/client';

export function TwoFactorSetup() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState<TOTPSecret | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Generate a new secret on mount
    const newSecret = generateSecret();
    setSecret(newSecret);
  }, []);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!secret || code.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyTOTP(secret.secret, code);

      if (!isValid) {
        setError('Invalid code. Check your authenticator app and try again.');
        setIsVerifying(false);
        return;
      }

      // Store the encrypted secret in the database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('Session expired. Please sign in again.');
        setIsVerifying(false);
        return;
      }

      // In production, encrypt the secret before storing
      const { error: upsertError } = await supabase
        .from('two_factor_setups')
        .upsert({
          user_id: userData.user.id,
          secret_encrypted: secret.secret, // TODO: encrypt at rest in production
          is_enrolled: true,
          enrolled_at: new Date().toISOString(),
        });

      if (upsertError) {
        setError('Failed to save 2FA setup. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Redirect to admin
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
      setIsVerifying(false);
    }
  }

  if (!secret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone" aria-busy="true">
        <p className="font-mono text-sm text-charcoal/40">Generating 2FA secret…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-charcoal/10 rounded-lg p-8">
          <h1 className="font-serif text-2xl font-semibold text-ink text-center mb-2">
            Set Up Two-Factor Authentication
          </h1>
          <p className="font-mono text-xs text-charcoal/50 text-center mb-6">
            2FA is required for all non-public roles.
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <img
              src={secret.qrCodeUrl}
              alt="QR code for 2FA setup"
              className="w-48 h-48 border border-charcoal/10 rounded"
            />
          </div>

          {/* Manual setup key */}
          <div className="bg-bone rounded p-3 mb-6">
            <p className="font-mono text-xs text-charcoal/50 mb-1">Manual setup key:</p>
            <code className="font-mono text-sm text-ink break-all select-all">
              {secret.secret}
            </code>
          </div>

          {error && (
            <div className="bg-clay/5 border border-clay/20 rounded p-3 mb-4" role="alert">
              <p className="font-mono text-xs text-clay">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} noValidate>
            <div className="mb-6">
              <label
                htmlFor="totp-code"
                className="block font-mono text-xs text-charcoal/70 mb-1"
              >
                Verification Code
              </label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoComplete="one-time-code"
                required
                disabled={isVerifying}
                placeholder="000000"
                className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-lg text-center
                  tracking-widest text-ink focus:outline-none focus:border-charcoal/50
                  focus:ring-1 focus:ring-charcoal/20 disabled:bg-bone disabled:text-charcoal/40"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="w-full py-2 bg-charcoal text-white font-mono text-sm rounded
                hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-charcoal/40
                disabled:bg-charcoal/30 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Verifying…' : 'Verify and Activate 2FA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
