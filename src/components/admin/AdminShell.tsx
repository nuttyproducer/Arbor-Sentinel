// src/components/admin/AdminShell.tsx
// Admin layout shell — sidebar + header + content area.
// Wraps all admin pages with consistent layout and auth protection.

import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AuthGuard } from './AuthGuard';

export function AdminShell() {
  return (
    <AuthGuard requiredRole="contributor">
      <div className="min-h-screen bg-bone flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
