import { describe, it, expect } from "vitest";
import {
  getRouteMeta,
  DEFAULT_ROBOTS,
  DEFAULT_OG_IMAGE,
} from "../routeMetadata";

/**
 * Locks in the M7-06 indexing posture: public content routes are crawlable
 * (inherit DEFAULT_ROBOTS = "index,follow") while admin, beta, and error
 * routes stay noindex. See docs/indexing-configuration.md.
 */

const PUBLIC_PATHS = [
  "/",
  "/methodology",
  "/evidence",
  "/legal-tracker",
  "/countries",
  "/countries/belgium",
  "/institutions",
  "/organizations",
  "/take-action",
  "/map",
  "/gaza-dossier",
  "/sources",
  "/dossiers",
  "/search",
  "/press",
  "/privacy",
  "/evidence/example",
  "/sources/example",
];

const ADMIN_PATHS = [
  "/admin/monitoring",
  "/admin/pipeline",
  "/admin/review-metrics",
  "/admin/data-quality",
];

const BETA_PATHS = [
  "/beta/welcome",
  "/beta/quick-start",
  "/beta/feedback",
  "/beta/bug-report",
];

describe("route metadata indexing posture", () => {
  it("defaults public routes to index,follow", () => {
    expect(DEFAULT_ROBOTS).toBe("index,follow");
    for (const path of PUBLIC_PATHS) {
      expect(getRouteMeta(path).robots, `${path} should inherit the default`).toBeUndefined();
    }
  });

  it("keeps admin routes noindex", () => {
    for (const path of ADMIN_PATHS) {
      expect(getRouteMeta(path).robots).toBe("noindex,nofollow");
    }
  });

  it("keeps beta routes noindex", () => {
    for (const path of BETA_PATHS) {
      expect(getRouteMeta(path).robots).toBe("noindex,nofollow");
    }
  });

  it("keeps the 404 route noindex", () => {
    expect(getRouteMeta("/404").robots).toBe("noindex,nofollow");
    expect(getRouteMeta("/does-not-exist").robots).toBe("noindex,nofollow");
  });

  it("uses the PNG social preview as the default OG image", () => {
    expect(DEFAULT_OG_IMAGE).toBe("/social-preview.png");
    expect(getRouteMeta("/").ogImage).toBeUndefined();
  });
});
