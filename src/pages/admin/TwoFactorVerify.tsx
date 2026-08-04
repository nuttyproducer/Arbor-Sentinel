// src/pages/admin/TwoFactorVerify.tsx
// 2FA verification page — shown after email/password login.
// User must enter TOTP code to complete authentication.

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/db/client';
import { verifyTOTPWithRateLimit } from '../../lib/auth/2fa';

export function TwoFactorVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/admin';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setIsVerifying(true);

    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('Session expired. Please sign in again.');
        setIsVerifying(false);
        return;
      }

      // Get the user's 2FA secret
      const { data: twoFactorData, error: twoFactorError } = await supabase
        .from('two_factor_setups')
        .select('secret_encrypted')
        .eq('user_id', userData.user.id)
        .single();

      if (twoFactorError || !twoFactorData?.secret_encrypted) {
        // No 2FA setup — redirect to setup
        navigate('/admin/2fa/setup', { replace: true });
        return;
      }

      // Verify with rate limiting
      const result = await verifyTOTPWithRateLimit(
        userData.user.id,
        twoFactorData.secret_encrypted,
        code,
      );

      if (result.lockedOut) {
        setError(
          `Too many failed attempts. Please wait ${result.lockoutRemainingMinutes} minute(s) before trying again.`,
        );
        setIsVerifying(false);
        return;
      }

      if (!result.success) {
        setRemainingAttempts(result.remainingAttempts);
        setError(
          `Invalid code. ${result.remainingAttempts} attempt(s) remaining.`,
        );
        setIsVerifying(false);
        return;
      }

      // Success — navigate to return destination
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-charcoal/10 rounded-lg p-8">
          <h1 className="font-serif text-2xl font-semibold text-ink text-center mb-2">
            Two-Factor Authentication
          </h1>
          <p className="font-mono text-xs text-charcoal/50 text-center mb-6">
            Enter the 6-digit code from your authenticator app.
          </p>

          {error && (
            <div
              className={`rounded p-3 mb-4 ${remainingAttempts !== null && remainingAttempts <= 2 ? 'bg-clay/10 border border-clay/30' : 'bg-clay/5 border border-clay/20'}`}
              role="alert"
            >
              <p className="font-mono text-xs text-clay">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} noValidate>
            <div className="mb-6">
              <label
                htmlFor="totp-code"
                className="block font-mono text-xs text-charcoal/70 mb-1"
              >
                Authentication Code
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
              {isVerifying ? 'Verifying…' : 'Verify'}
            </button>
          </form>

          <p className="font-mono text-xs text-charcoal/40 text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/login', { replace: true })}
              className="underline hover:text-ink"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
