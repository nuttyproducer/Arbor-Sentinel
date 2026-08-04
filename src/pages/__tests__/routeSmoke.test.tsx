import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../HomePage";
import { MethodologyPage } from "../MethodologyPage";
import { ContributePage } from "../ContributePage";
import { CorrectionsPage } from "../CorrectionsPage";
import { PrivacyPage } from "../PrivacyPage";
import { AccessibilityPage } from "../AccessibilityPage";
import { DisclaimerPage } from "../DisclaimerPage";
import { AttributionsPage } from "../AttributionsPage";
import { ChangelogPage } from "../ChangelogPage";
import { NotFoundPage } from "../NotFoundPage";
import PressPage from "../PressPage";
import SourceRegistryPage from "../SourceRegistryPage";
import EvidenceDetailPage from "../EvidenceDetailPage";
import ActionDetailPage from "../ActionDetailPage";
import CountriesIndexPage from "../CountriesIndexPage";
import InstitutionsIndexPage from "../InstitutionsIndexPage";
import DossiersPage from "../DossiersPage";
import DossierDetailPage from "../DossierDetailPage";
import SearchPage from "../SearchPage";
import MapPage from "../MapPage";
import { GraphExplorerPage } from "../explore/GraphExplorerPage";
import { EntityDetailPage } from "../explore/EntityDetailPage";
import { graphNodes, graphEdges } from "../../data/graphData";

// Mock framer-motion — jsdom doesn't support animation APIs.
// Components using Reveal will render children without animation.
vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    section: "section",
    span: "span",
    p: "p",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    ul: "ul",
    a: "a",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true,
}));

// Mock cytoscape — jsdom has no canvas/DOM layout. Used by GraphExplorer,
// which renders inside GraphExplorerPage and EntityDetailPage.
vi.mock("cytoscape", () => {
  const mockCy = {
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    layout: vi.fn(() => ({ run: vi.fn() })),
    elements: vi.fn(() => ({ style: vi.fn().mockReturnThis() })),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      filter: vi.fn(() => ({ removeClass: vi.fn(), addClass: vi.fn() })),
      style: vi.fn().mockReturnThis(),
    })),
    edges: vi.fn(() => ({
      forEach: vi.fn(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      filter: vi.fn(() => ({ removeClass: vi.fn(), addClass: vi.fn() })),
    })),
    getElementById: vi.fn(() => ({ length: 0, emit: vi.fn() })),
    fit: vi.fn(),
    center: vi.fn(),
    zoom: vi.fn(() => 1),
    style: vi.fn(),
  };
  return {
    default: vi.fn(() => mockCy),
    __esModule: true,
  };
});

// Mock maplibre-gl — jsdom has no WebGL/canvas context. The Map mock fires the
// "load" event synchronously so MapContainer exposes a map instance, and the
// mock implements the API surface used by MapLayer, MapControls, MapPopup, and
// MapSearch (addLayer/addSource, queryRenderedFeatures, panTo, etc.).
vi.mock("maplibre-gl", () => {
  const mockMap = {
    on: vi.fn((event: string, callback?: () => void) => {
      if (event === "load") callback?.();
      return mockMap;
    }),
    off: vi.fn(),
    remove: vi.fn(),
    resize: vi.fn(),
    getCanvas: vi.fn(() => document.createElement("canvas")),
    getContainer: vi.fn(() => document.createElement("div")),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    getLayer: vi.fn(() => undefined),
    getSource: vi.fn(() => undefined),
    setLayoutProperty: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    flyTo: vi.fn(),
    panTo: vi.fn(),
  };
  const MapMock = vi.fn(function () {
    return mockMap;
  });
  return {
    default: { Map: MapMock },
    Map: MapMock,
  };
});

/**
 * Route rendering smoke tests.
 *
 * Each test verifies that a page renders without throwing and
 * displays its primary heading or identifying content. These are
 * not integration tests — they don't exercise the full router.
 */

function renderPage(Page: React.ComponentType) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
}

describe("Route rendering smoke tests", () => {
  it("renders HomePage", () => {
    renderPage(HomePage);
    expect(
      screen.getByText("Arbor Sentinel"),
    ).toBeInTheDocument();
  });

  it("renders MethodologyPage", () => {
    renderPage(MethodologyPage);
    expect(
      screen.getByText(/How Arbor Sentinel works with evidence/),
    ).toBeInTheDocument();
  });

  it("renders ContributePage", () => {
    renderPage(ContributePage);
    expect(
      screen.getByText("Help Build the Platform"),
    ).toBeInTheDocument();
  });

  it("renders CorrectionsPage", () => {
    renderPage(CorrectionsPage);
    expect(
      screen.getByText(/Corrections are part of the trust model/),
    ).toBeInTheDocument();
  });

  it("renders PrivacyPage", () => {
    renderPage(PrivacyPage);
    expect(
      screen.getByText(/Privacy in the public static beta/),
    ).toBeInTheDocument();
  });

  it("renders AccessibilityPage", () => {
    renderPage(AccessibilityPage);
    expect(
      screen.getByText("Accessibility commitment."),
    ).toBeInTheDocument();
  });

  it("renders DisclaimerPage", () => {
    renderPage(DisclaimerPage);
    expect(
      screen.getByText("Public disclaimer."),
    ).toBeInTheDocument();
  });

  it("renders AttributionsPage", () => {
    renderPage(AttributionsPage);
    expect(
      screen.getByText("Attributions and image credits."),
    ).toBeInTheDocument();
  });

  it("renders ChangelogPage", () => {
    renderPage(ChangelogPage);
    expect(screen.getByText("What's New")).toBeInTheDocument();
  });

  it("renders PressPage", () => {
    renderPage(PressPage);
    expect(
      screen.getByText("Press and Resources"),
    ).toBeInTheDocument();
  });

  it("renders SourceRegistryPage", () => {
    renderPage(SourceRegistryPage);
    expect(
      screen.getByText("Public Source Registry"),
    ).toBeInTheDocument();
  });

  it("renders EvidenceDetailPage for a known slug", () => {
    render(
      <MemoryRouter initialEntries={["/evidence/icj-provisional-measures-jan-2024"]}>
        <Routes>
          <Route path="/evidence/:slug" element={<EvidenceDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Print header adds a hidden h1 with the same name; use getAllByRole
    const headings = screen.getAllByRole("heading", { name: /ICJ provisional measures order/ });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders EvidenceDetailPage not-found state for unknown slug", () => {
    render(
      <MemoryRouter initialEntries={["/evidence/nonexistent-slug"]}>
        <Routes>
          <Route path="/evidence/:slug" element={<EvidenceDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Evidence record not found"),
    ).toBeInTheDocument();
  });

  it("renders NotFoundPage", () => {
    renderPage(NotFoundPage);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders CountriesIndexPage", () => {
    renderPage(CountriesIndexPage);
    expect(
      screen.getByRole("heading", { name: "Countries" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Country accountability pages track/),
    ).toBeInTheDocument();
  });

  it("renders InstitutionsIndexPage", () => {
    renderPage(InstitutionsIndexPage);
    expect(
      screen.getByRole("heading", { name: "Institutions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Institution accountability pages track/),
    ).toBeInTheDocument();
  });

  it("renders ActionDetailPage for a known slug", () => {
    render(
      <MemoryRouter initialEntries={["/take-action/contact-representative"]}>
        <Routes>
          <Route path="/take-action/:slug" element={<ActionDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Contact your representative" }),
    ).toBeInTheDocument();
  });

  it("renders ActionDetailPage not-found state for unknown slug", () => {
    render(
      <MemoryRouter initialEntries={["/take-action/nonexistent-action"]}>
        <Routes>
          <Route path="/take-action/:slug" element={<ActionDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Action template not found"),
    ).toBeInTheDocument();
  });

  it("renders DossiersPage", () => {
    renderPage(DossiersPage);
    expect(
      screen.getByRole("heading", { name: "Dossier Library" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/One static example is available now/),
    ).toBeInTheDocument();
  });

  it("renders DossierDetailPage for a known slug", () => {
    render(
      <MemoryRouter initialEntries={["/dossiers/gaza-accountability-one-page"]}>
        <Routes>
          <Route path="/dossiers/:slug" element={<DossierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const headings = screen.getAllByRole("heading", { name: /Gaza Accountability — One-Page/ });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders DossierDetailPage not-found state for unknown slug", () => {
    render(
      <MemoryRouter initialEntries={["/dossiers/nonexistent-dossier"]}>
        <Routes>
          <Route path="/dossiers/:slug" element={<DossierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Dossier not found"),
    ).toBeInTheDocument();
  });

  it("renders SearchPage", () => {
    renderPage(SearchPage);
    expect(
      screen.getByRole("heading", { name: "Search Platform Records" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("search"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Search records"),
    ).toBeInTheDocument();
  });

  it("renders MapPage", () => {
    renderPage(MapPage);
    expect(
      screen.getByRole("heading", { name: "Interactive Map" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Search features"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Map filters"),
    ).toBeInTheDocument();
  });

  it("renders GraphExplorerPage with seeded graph data", () => {
    render(
      <MemoryRouter initialEntries={["/explore/graph"]}>
        <Routes>
          <Route path="/explore/graph" element={<GraphExplorerPage nodes={graphNodes} edges={graphEdges} />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Knowledge Graph Explorer" }),
    ).toBeInTheDocument();
  });

  it("renders EntityDetailPage for a known entity", () => {
    const firstNode = graphNodes[0];
    render(
      <MemoryRouter initialEntries={[`/explore/entity/${encodeURIComponent(firstNode.id)}`]}>
        <Routes>
          <Route path="/explore/entity/:entityId" element={<EntityDetailPage nodes={graphNodes} edges={graphEdges} />} />
        </Routes>
      </MemoryRouter>,
    );
    // The entity page renders the entity label as its primary heading.
    expect(
      screen.getByRole("heading", { name: firstNode.label }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Entity Not Found")).not.toBeInTheDocument();
  });

  it("renders EntityDetailPage not-found state for an unknown entity", () => {
    render(
      <MemoryRouter initialEntries={["/explore/entity/nonexistent"]}>
        <Routes>
          <Route path="/explore/entity/:entityId" element={<EntityDetailPage nodes={graphNodes} edges={graphEdges} />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Entity Not Found"),
    ).toBeInTheDocument();
  });
});
