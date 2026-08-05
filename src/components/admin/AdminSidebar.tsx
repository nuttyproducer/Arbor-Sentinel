// src/components/admin/AdminSidebar.tsx
// Admin sidebar navigation — links to all content types, review queue, dashboards.

import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  badge?: number;
}

const CONTENT_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Evidence Items', path: '/admin/evidence' },
  { label: 'Sources', path: '/admin/sources' },
  { label: 'Countries', path: '/admin/countries' },
  { label: 'Organizations', path: '/admin/organizations' },
  { label: 'Legal Cases', path: '/admin/legal-cases' },
  { label: 'Actions', path: '/admin/actions' },
  { label: 'Dossiers', path: '/admin/dossiers' },
];

const COLLECTOR_ITEMS: NavItem[] = [
  { label: 'Intelligence', path: '/admin/intelligence' },
  { label: 'Feed Manager', path: '/admin/feeds' },
  { label: 'Incidents', path: '/admin/incidents' },
];

const WORKFLOW_ITEMS: NavItem[] = [
  { label: 'Review Queue', path: '/admin/review-queue' },
  { label: 'Correction Queue', path: '/admin/corrections' },
];

const DASHBOARD_ITEMS: NavItem[] = [
  { label: 'Pipeline', path: '/admin/pipeline' },
  { label: 'Data Quality', path: '/admin/data-quality' },
  { label: 'Review Metrics', path: '/admin/review-metrics' },
  { label: 'Editorial Analytics', path: '/admin/editorial-analytics' },
  { label: 'Monitoring', path: '/admin/monitoring' },
];

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Media Library', path: '/admin/media' },
  { label: 'Role Management', path: '/admin/roles' },
  { label: 'Audit Log', path: '/admin/audit-log' },
  { label: 'Settings', path: '/admin/settings' },
];

function SidebarSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mb-4">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/40 px-3 mb-2">
        {title}
      </h3>
      <nav aria-label={title}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                isActive
                  ? 'bg-charcoal/10 text-ink font-semibold'
                  : 'text-charcoal/60 hover:bg-bone hover:text-ink'
              }`
            }
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-clay/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside
      className="w-60 min-h-screen bg-white border-r border-charcoal/10 pt-4 pb-8 flex-shrink-0 hidden lg:block"
      aria-label="Admin navigation"
    >
      <div className="px-3 mb-6">
        <NavLink to="/admin" className="font-serif text-lg font-semibold text-ink hover:text-charcoal/80">
          Arbor Sentinel
        </NavLink>
        <p className="font-mono text-[10px] text-charcoal/40 mt-0.5">Admin</p>
      </div>

      <SidebarSection title="Content" items={CONTENT_ITEMS} />
      <SidebarSection title="Intelligence" items={COLLECTOR_ITEMS} />
      <SidebarSection title="Workflow" items={WORKFLOW_ITEMS} />
      <SidebarSection title="Dashboards" items={DASHBOARD_ITEMS} />
      <SidebarSection title="System" items={SYSTEM_ITEMS} />

      <div className="px-3 mt-auto pt-6 border-t border-charcoal/10 mx-3">
        <NavLink
          to="/"
          className="font-mono text-xs text-charcoal/40 hover:text-ink transition-colors"
        >
          ← Back to public site
        </NavLink>
      </div>
    </aside>
  );
}
