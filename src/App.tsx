import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { DocumentHead } from "./components/ui/DocumentHead";
import { RouteLoadingFallback } from "./components/ui/RouteLoadingFallback";
import { getRouteMeta } from "./data/routeMetadata";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { DisplayPreferenceProvider } from "./contexts/DisplayPreference";
// Import i18n config to ensure initialization before first render
import "./i18n/config";

// ── Eager-loaded pages (critical for first paint / error handling) ──────────
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

// ── Lazy-loaded routes — split at the page level ────────────────────────────
// Pages with default exports: import directly.
// Pages with named exports: wrap via .then(m => ({ default: m.Name })).

const MethodologyPage = lazy(() => import("./pages/MethodologyPage").then(m => ({ default: m.MethodologyPage })));
const ContributePage = lazy(() => import("./pages/ContributePage").then(m => ({ default: m.ContributePage })));
const ChangelogPage = lazy(() => import("./pages/ChangelogPage").then(m => ({ default: m.ChangelogPage })));
const AttributionsPage = lazy(() => import("./pages/AttributionsPage").then(m => ({ default: m.AttributionsPage })));
const CorrectionsPage = lazy(() => import("./pages/CorrectionsPage").then(m => ({ default: m.CorrectionsPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage").then(m => ({ default: m.AccessibilityPage })));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage").then(m => ({ default: m.DisclaimerPage })));
const GazaDossierPage = lazy(() => import("./pages/GazaDossierPage"));
const LegalTrackerPage = lazy(() => import("./pages/LegalTrackerPage"));
const LegalCaseDetailPage = lazy(() => import("./pages/LegalCaseDetailPage"));
const CountriesIndexPage = lazy(() => import("./pages/CountriesIndexPage"));
const BelgiumPage = lazy(() => import("./pages/BelgiumPage"));
const InstitutionsIndexPage = lazy(() => import("./pages/InstitutionsIndexPage"));
const EuropeanUnionPage = lazy(() => import("./pages/EuropeanUnionPage"));
const OrganizationsPage = lazy(() => import("./pages/OrganizationsPage"));
const OrganizationDetailPage = lazy(() => import("./pages/OrganizationDetailPage"));
const ActionHubPage = lazy(() => import("./pages/ActionHubPage"));
const ActionDetailPage = lazy(() => import("./pages/ActionDetailPage"));
const EvidenceLibraryPage = lazy(() => import("./pages/EvidenceLibraryPage"));
const EvidenceDetailPage = lazy(() => import("./pages/EvidenceDetailPage"));
const PressPage = lazy(() => import("./pages/PressPage"));
const SourceRegistryPage = lazy(() => import("./pages/SourceRegistryPage"));
const SourceDetailPage = lazy(() => import("./pages/SourceDetailPage"));
const DossiersPage = lazy(() => import("./pages/DossiersPage"));
const DossierDetailPage = lazy(() => import("./pages/DossierDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const MonitoringDashboard = lazy(() => import("./pages/admin/MonitoringDashboard"));
const PipelineDashboard = lazy(() => import("./pages/admin/PipelineDashboard"));
const ReviewMetricsDashboard = lazy(() => import("./pages/admin/ReviewMetricsDashboard"));

function RouteMeta() {
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);

  return (
    <DocumentHead
      title={meta.title}
      description={meta.description}
      canonicalPath={meta.canonicalPath}
      ogImage={meta.ogImage}
      robots={meta.robots}
      ogType={meta.ogType}
    />
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <DisplayPreferenceProvider>
    <LocaleProvider>
      <BrowserRouter>
        <RouteMeta />
        <ScrollToTop />
        <PageShell>
        <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/attributions" element={<AttributionsPage />} />
          <Route path="/corrections" element={<CorrectionsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/gaza-dossier" element={<GazaDossierPage />} />
          <Route path="/legal-tracker" element={<LegalTrackerPage />} />
          <Route path="/legal-tracker/:slug" element={<LegalCaseDetailPage />} />
          <Route path="/countries" element={<CountriesIndexPage />} />
          <Route path="/countries/belgium" element={<BelgiumPage />} />
          <Route path="/institutions" element={<InstitutionsIndexPage />} />
          <Route path="/institutions/european-union" element={<EuropeanUnionPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/:slug" element={<OrganizationDetailPage />} />
          <Route path="/take-action" element={<ActionHubPage />} />
          <Route path="/take-action/:slug" element={<ActionDetailPage />} />
          <Route path="/evidence" element={<EvidenceLibraryPage />} />
          <Route path="/evidence/:slug" element={<EvidenceDetailPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/sources" element={<SourceRegistryPage />} />
          <Route path="/sources/:sourceId" element={<SourceDetailPage />} />
          <Route path="/dossiers" element={<DossiersPage />} />
          <Route path="/dossiers/:slug" element={<DossierDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin/monitoring" element={<MonitoringDashboard />} />
          <Route path="/admin/pipeline" element={<PipelineDashboard />} />
          <Route path="/admin/review-metrics" element={<ReviewMetricsDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </PageShell>
    </BrowserRouter>
    </LocaleProvider>
    </DisplayPreferenceProvider>
  );
}
