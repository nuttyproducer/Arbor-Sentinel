// src/pages/admin/LoginPage.tsx
// Admin login page — email/password authentication.
// Redirects authenticated users to admin dashboard.
// Handles return-to URL after successful login.

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn } from '../../lib/auth/client';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn({ email: email.trim(), password });

      if (!result.success) {
        setError(result.error ?? 'Sign in failed. Check your credentials.');
        setIsSubmitting(false);
        return;
      }

      // If 2FA is needed, redirect to 2FA verification
      if (result.needs2FA) {
        navigate(`/admin/2fa/verify?return=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }

      // Otherwise, go to the return destination
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-charcoal/10 rounded-lg p-8">
          <h1 className="font-serif text-2xl font-semibold text-ink text-center mb-2">
            Admin Sign In
          </h1>
          <p className="font-mono text-xs text-charcoal/50 text-center mb-6">
            Accountability Atlas
          </p>

          {error && (
            <div
              className="bg-clay/5 border border-clay/20 rounded p-3 mb-4"
              role="alert"
            >
              <p className="font-mono text-xs text-clay">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block font-mono text-xs text-charcoal/70 mb-1"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
                  focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
                  disabled:bg-bone disabled:text-charcoal/40"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="login-password"
                className="block font-mono text-xs text-charcoal/70 mb-1"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
                  focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
                  disabled:bg-bone disabled:text-charcoal/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-charcoal text-white font-mono text-sm rounded
                hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-charcoal/40
                disabled:bg-charcoal/30 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="font-mono text-xs text-charcoal/40 text-center mt-4">
            2FA is required for all non-public roles.
          </p>
        </div>
      </div>
    </div>
  );
}
