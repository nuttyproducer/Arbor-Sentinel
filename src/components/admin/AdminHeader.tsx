// src/components/admin/AdminHeader.tsx
// Admin header — user info, role badge, logout button.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthState, signOut, type AuthState } from '../../lib/auth/client';
import type { Role } from '../../lib/auth/roles';
import { ROLES } from '../../lib/auth/roles';

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    admin: 'bg-charcoal text-white',
    security_admin: 'bg-clay/20 text-clay',
    moderator: 'bg-clay/10 text-clay',
    legal_reviewer: 'bg-bone text-charcoal/70',
    researcher: 'bg-bone text-charcoal/50',
    partner_org: 'bg-bone text-charcoal/50',
    contributor: 'bg-bone text-charcoal/50',
    public: 'bg-bone text-charcoal/40',
  };

  return (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${colors[role] ?? colors.public}`}>
      {ROLES[role]?.label ?? role}
    </span>
  );
}

export function AdminHeader() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState | null>(null);

  useEffect(() => {
    getAuthState().then(setAuthState);
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <header className="h-14 bg-white border-b border-charcoal/10 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden font-mono text-sm text-charcoal/60 hover:text-ink"
        aria-label="Toggle sidebar"
      >
        ☰ Menu
      </button>

      <div className="flex-1" />

      {/* User section */}
      <div className="flex items-center gap-3">
        {authState && (
          <>
            <div className="text-right hidden sm:block">
              <p className="font-mono text-xs text-ink leading-tight">
                {authState.email}
              </p>
              {authState.role && <RoleBadge role={authState.role} />}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="font-mono text-xs text-charcoal/50 hover:text-clay transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
