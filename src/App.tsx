import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { DocumentHead } from "./components/ui/DocumentHead";
import { RouteLoadingFallback } from "./components/ui/RouteLoadingFallback";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { getRouteMeta } from "./data/routeMetadata";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { DisplayPreferenceProvider } from "./contexts/DisplayPreference";
// Import i18n config to ensure initialization before first render
import "./i18n/config";

// ── Eager-loaded pages (critical for first paint) ───────────────────────────
import { HomePage } from "./pages/HomePage";
// Static data used as props by lazy routes — small, safe to keep in the entry
import { graphNodes, graphEdges } from "./data/graphData";
import { CONTENT_TYPES } from "./pages/admin/contentConfig";

// ── Lazy-loaded routes — split at the page level ────────────────────────────
// Pages with default exports: import directly.
// Pages with named exports: wrap via .then(m => ({ default: m.Name })).

const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const AdminShell = lazy(() => import("./components/admin/AdminShell").then(m => ({ default: m.AdminShell })));
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
const DataQualityDashboard = lazy(() => import("./pages/admin/DataQualityDashboard"));
const MapPage = lazy(() => import("./pages/MapPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ContentList = lazy(() => import("./pages/admin/ContentList").then(m => ({ default: m.ContentList })));
const ContentEditor = lazy(() => import("./pages/admin/ContentEditor").then(m => ({ default: m.ContentEditor })));
const CorrectionQueuePage = lazy(() => import("./pages/admin/CorrectionQueuePage").then(m => ({ default: m.CorrectionQueuePage })));
const ReviewQueuePage = lazy(() => import("./pages/admin/ReviewQueuePage").then(m => ({ default: m.ReviewQueuePage })));
const EditorialAnalyticsPage = lazy(() => import("./pages/admin/EditorialAnalyticsPage").then(m => ({ default: m.EditorialAnalyticsPage })));
const LoginPage = lazy(() => import("./pages/admin/LoginPage").then(m => ({ default: m.LoginPage })));
const TwoFactorSetup = lazy(() => import("./pages/admin/TwoFactorSetup").then(m => ({ default: m.TwoFactorSetup })));
const TwoFactorVerify = lazy(() => import("./pages/admin/TwoFactorVerify").then(m => ({ default: m.TwoFactorVerify })));
const GraphExplorerPage = lazy(() => import("./pages/explore/GraphExplorerPage").then(m => ({ default: m.GraphExplorerPage })));
const EntityDetailPage = lazy(() => import("./pages/explore/EntityDetailPage").then(m => ({ default: m.EntityDetailPage })));
const CountryReviewPage = lazy(() => import("./pages/review/CountryReviewPage"));
const EditorialReviewPage = lazy(() => import("./pages/review/EditorialReviewPage"));
const InstitutionReviewPage = lazy(() => import("./pages/review/InstitutionReviewPage"));
const LegalReviewPage = lazy(() => import("./pages/review/LegalReviewPage"));
const TranslationReviewPage = lazy(() => import("./pages/review/TranslationReviewPage"));
const CorrectionReviewPage = lazy(() => import("./pages/review/CorrectionReviewPage"));
const BetaWelcome = lazy(() => import("./pages/beta/BetaWelcome").then(m => ({ default: m.BetaWelcome })));
const BetaQuickStart = lazy(() => import("./pages/beta/BetaQuickStart").then(m => ({ default: m.BetaQuickStart })));
const BetaFeedbackPage = lazy(() => import("./pages/beta/BetaFeedbackPage").then(m => ({ default: m.BetaFeedbackPage })));
const BetaBugReportPage = lazy(() => import("./pages/beta/BetaBugReportPage").then(m => ({ default: m.BetaBugReportPage })));

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
      <HashRouter>
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
          <Route path="/map" element={<MapPage />} />
          <Route path="/explore/graph" element={<GraphExplorerPage nodes={graphNodes} edges={graphEdges} />} />
          <Route path="/explore/entity/:entityId" element={<EntityDetailPage nodes={graphNodes} edges={graphEdges} />} />

          {/* Admin auth entry points — outside AdminShell so the AuthGuard
              redirect does not loop back through the guarded layout. */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/2fa/setup" element={<TwoFactorSetup />} />
          <Route path="/admin/2fa/verify" element={<TwoFactorVerify />} />

          {/* Beta onboarding & feedback — requires an authenticated beta user. */}
          <Route element={<ProtectedRoute requiredRole="contributor" />}>
            <Route path="/beta/welcome" element={<BetaWelcome />} />
            <Route path="/beta/quick-start" element={<BetaQuickStart />} />
            <Route path="/beta/feedback" element={<BetaFeedbackPage />} />
            <Route path="/beta/bug-report" element={<BetaBugReportPage />} />
          </Route>

          {/* Admin layout — protected by AuthGuard via AdminShell. */}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="monitoring" element={<MonitoringDashboard />} />
            <Route path="pipeline" element={<PipelineDashboard />} />
            <Route path="review-metrics" element={<ReviewMetricsDashboard />} />
            <Route path="data-quality" element={<DataQualityDashboard />} />
            <Route path="editorial-analytics" element={<EditorialAnalyticsPage />} />
            <Route path="corrections" element={<CorrectionQueuePage />} />
            <Route path="review-queue" element={<ReviewQueuePage />} />
            <Route path="review/country/:id" element={<CountryReviewPage />} />
            <Route path="review/editorial/:id" element={<EditorialReviewPage />} />
            <Route path="review/institution/:id" element={<InstitutionReviewPage />} />
            <Route path="review/legal/:id" element={<LegalReviewPage />} />
            <Route path="review/translation/:id" element={<TranslationReviewPage />} />
            <Route path="review/correction/:id" element={<CorrectionReviewPage />} />

            {CONTENT_TYPES.map((config) => (
              <Route key={config.contentType} path={config.listPath.replace("/admin/", "")}>
                <Route index element={
                  <ContentList
                    contentType={config.contentType as never}
                    title={config.title}
                    newItemPath={`${config.listPath}/new`}
                    columns={config.columns as never}
                    statusFilter={config.statusFilter}
                  />
                } />
                <Route path="new" element={
                  <ContentEditor
                    contentType={config.contentType as never}
                    title={config.title}
                    listPath={config.listPath}
                    fields={config.fields}
                  />
                } />
                <Route path=":id" element={
                  <ContentEditor
                    contentType={config.contentType as never}
                    title={config.title}
                    listPath={config.listPath}
                    fields={config.fields}
                  />
                } />
              </Route>
            ))}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </PageShell>
    </BrowserRouter>
    </LocaleProvider>
    </DisplayPreferenceProvider>
  );
}
