/**
 * Centralized attribution records for images and media used across the site.
 *
 * Every image used on the platform must be listed here with its source,
 * license, modification history, and review status.
 *
 * Status vocabulary:
 *   complete       — all fields verified, attribution is ready for public use
 *   review_pending — one or more fields are unknown or unconfirmed
 *   disputed       — an attribution concern has been raised and is under review
 *   removed        — the asset has been removed from the site
 */

export type AttributionStatus =
  | "complete"
  | "review_pending"
  | "disputed"
  | "removed";

export interface AttributionRecord {
  id: string;
  title: string;
  author: string;
  sourceName: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  whereUsed: string;
  filePath: string;
  modifications: string;
  dateAdded: string;
  accessedAt: string;
  status: AttributionStatus;
  /** Free-text notes on why a record is review_pending, disputed, etc. */
  statusNote?: string;
}

export const attributionRecords: AttributionRecord[] = [
  {
    id: "hero-gaza-displacement",
    title:
      "Forced Displacement of Gaza Strip Residents During the Gaza-Israel War 23-25",
    author: "Jaber Jehad Badwan",
    sourceName: "Wikimedia Commons",
    sourceUrl: "",
    licenseName: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    whereUsed: "Hero section background image on the landing page",
    filePath: "src/assets/images/hero-gaza-displacement.jpg",
    modifications:
      "Cropped, compressed, converted to WebP, dark overlay applied via CSS for text readability",
    dateAdded: "2026-07-07",
    accessedAt: "2026-07-07",
    status: "review_pending",
    statusNote:
      "The exact Wikimedia Commons file URL has not yet been confirmed. The author, license, and title are recorded in docs/attributions.md from the original file metadata.",
  },
  {
    id: "destruction-of-gaza-1",
    title: "Destruction of Gaza 1",
    author: "gloucester2gaza",
    sourceName: "Flickr / Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Destruction_of_Gaza_1.jpg",
    licenseName: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    whereUsed: "Starting Focus section on the landing page",
    filePath: "src/assets/images/Destruction_of_Gaza_1.jpg",
    modifications:
      "Cropped, compressed, dark overlay applied in UI for text readability",
    dateAdded: "2026-07-08",
    accessedAt: "2026-07-08",
    status: "complete",
  },
];

/** Convenience lookup by record id. */
export function getAttributionById(
  id: string,
): AttributionRecord | undefined {
  return attributionRecords.find((r) => r.id === id);
}

/** Records grouped by status. */
export function getAttributionsByStatus(): Record<
  AttributionStatus,
  AttributionRecord[]
> {
  const grouped: Record<AttributionStatus, AttributionRecord[]> = {
    complete: [],
    review_pending: [],
    disputed: [],
    removed: [],
  };
  for (const record of attributionRecords) {
    grouped[record.status].push(record);
  }
  return grouped;
}
