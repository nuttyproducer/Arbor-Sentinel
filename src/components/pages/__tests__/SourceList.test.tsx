import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SourceList } from "../SourceList";
import type { SourceRecord } from "../../../types/content";

const sampleSources: SourceRecord[] = [
  {
    id: "icj-2024-01-26",
    slug: "icj-order-jan-2024",
    title: "ICJ Order of 26 January 2024",
    publisher: "International Court of Justice",
    sourceType: "court",
    url: "https://www.icj-cij.org/case/192",
    publicationDate: "2024-01-26",
    accessedAt: "2026-07-10",
    language: "en",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "ocha-report",
    slug: "ocha-gaza-snapshot-june-2025",
    title: "Gaza Humanitarian Snapshot — June 2025",
    publisher: "UN OCHA",
    sourceType: "un",
    url: "https://www.ochaopt.org/",
    publicationDate: "2025-06-15",
    accessedAt: "2026-07-12",
    language: "en",
    archiveUrl: "https://archive.org/ocha-report",
    notes: "Monthly situation update.",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("SourceList", () => {
  it("renders default empty message when sources array is empty", () => {
    render(<SourceList sources={[]} />);
    expect(screen.getByText("No sources available.")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(<SourceList sources={[]} emptyMessage="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("renders source titles and publishers", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText(/ICJ Order/)).toBeInTheDocument();
    expect(screen.getByText("International Court of Justice")).toBeInTheDocument();
    expect(screen.getByText(/Gaza Humanitarian Snapshot/)).toBeInTheDocument();
    expect(screen.getByText("UN OCHA")).toBeInTheDocument();
  });

  it("renders source type badges", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText("Court / legal record")).toBeInTheDocument();
    expect(screen.getByText("UN / international body")).toBeInTheDocument();
  });

  it("renders publication and access dates", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText(/Published: 2024-01-26/)).toBeInTheDocument();
    expect(screen.getByText(/Accessed: 2026-07-10/)).toBeInTheDocument();
  });

  it("renders archive link when provided", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText("Archived version")).toBeInTheDocument();
  });

  it("renders notes when provided", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText("Monthly situation update.")).toBeInTheDocument();
  });

  it("uses default title 'Sources'", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    expect(screen.getByText("Sources")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    renderWithRouter(
      <SourceList sources={sampleSources} title="References" />,
    );
    expect(screen.getByText("References")).toBeInTheDocument();
  });

  it("renders language badge", () => {
    renderWithRouter(<SourceList sources={sampleSources} />);
    const enBadges = screen.getAllByText("en");
    expect(enBadges.length).toBeGreaterThanOrEqual(2);
  });
});
