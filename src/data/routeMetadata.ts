/**
 * Central route metadata configuration.
 *
 * Every active route has a unique document title, meta description,
 * canonical path, Open Graph metadata, Twitter card, and robots directive.
 *
 * CANONICAL BASE URL
 * ------------------
 * Set CANONICAL_BASE to the production domain when one is selected.
 * During preview, it falls back to window.location.origin so canonical
 * URLs resolve correctly in every deployment environment.
 *
 *   import { setCanonicalBase } from "../data/routeMetadata";
 *   setCanonicalBase("https://accountabilityatlas.org");
 *
 * INDEXING
 * --------
 * During the public static beta, every route defaults to "noindex,nofollow".
 * To enable indexing for production, change the DEFAULT_ROBOTS constant
 * below and update public/robots.txt. See docs/indexing-configuration.md.
 */

let canonicalBase: string =
  typeof window !== "undefined" ? window.location.origin : "";

export function setCanonicalBase(base: string): void {
  canonicalBase = base.replace(/\/+$/, "");
}

export function getCanonicalBase(): string {
  return canonicalBase;
}

/** Change this to "index,follow" when the platform is ready for production indexing. */
export const DEFAULT_ROBOTS = "noindex,nofollow";

export interface RouteMeta {
  /** Unique document title. Appended to base title. */
  title: string;
  /** Meta description — 150–160 characters recommended. */
  description: string;
  /** Canonical path, e.g. "/methodology". Leading slash required. */
  canonicalPath: string;
  /** Override the default OG image. */
  ogImage?: string;
  /** Override the default robots directive. 404 always uses noindex. */
  robots?: string;
  /** OG type — "website" for most pages, "article" for content pages. */
  ogType?: "website" | "article";
}

const BASE_TITLE = "Accountability Atlas";

function fullTitle(pageTitle: string): string {
  return pageTitle === BASE_TITLE
    ? `${BASE_TITLE} — Building public infrastructure against genocide and mass atrocities.`
    : `${pageTitle} — Accountability Atlas`;
}

const meta: Record<string, RouteMeta> = {
  "/": {
    title: fullTitle(BASE_TITLE),
    description:
      "An open-source platform for organizing verified public evidence, tracking legal and political responsibility, and helping people take lawful action — starting with Gaza and the wider regional crisis.",
    canonicalPath: "/",
    ogType: "website",
  },

  // ── Product routes ──────────────────────────────────────────────────
  "/gaza-dossier": {
    title: fullTitle("Gaza Dossier"),
    description:
      "A structured framework for understanding the humanitarian context, legal proceedings, documented harm categories, and policy priorities in the Gaza regional crisis — built from verified public sources.",
    canonicalPath: "/gaza-dossier",
    ogType: "article",
  },
  "/legal-tracker": {
    title: fullTitle("Legal Tracker"),
    description:
      "Track court proceedings, investigations, warrants, UN findings, and procedural milestones with consistent legal status labels — separated from editorial review status.",
    canonicalPath: "/legal-tracker",
    ogType: "article",
  },
  "/countries": {
    title: fullTitle("Countries — Accountability Index"),
    description:
      "Country accountability index — what country pages track and why. Structured documentation of publicly verifiable positions, votes, and actions. Limited coverage during static beta; no scores or rankings.",
    canonicalPath: "/countries",
    ogType: "website",
  },
  "/countries/belgium": {
    title: fullTitle("Belgium — Country Accountability"),
    description:
      "Belgium country accountability page: federal positions, UN voting, arms-transfer review, humanitarian aid, and ICC/ICJ cooperation — tracked with clear competency boundaries.",
    canonicalPath: "/countries/belgium",
    ogType: "article",
  },
  "/institutions": {
    title: fullTitle("Institutions — Accountability Index"),
    description:
      "Institution accountability index — what supranational bodies are legally competent to decide. Separate from country pages. European Union coverage during static beta; no scores or rankings.",
    canonicalPath: "/institutions",
    ogType: "website",
  },
  "/institutions/european-union": {
    title: fullTitle("European Union — Institution Accountability"),
    description:
      "EU institution accountability tracking: Commission, Council, Parliament, EEAS roles and competencies — separated from member-state responsibilities.",
    canonicalPath: "/institutions/european-union",
    ogType: "article",
  },
  "/organizations": {
    title: fullTitle("Organization Directory"),
    description:
      "A directory of humanitarian, legal, documentation, medical, research, and press-freedom organisations listed as public resources — without implying partnership or endorsement.",
    canonicalPath: "/organizations",
    ogType: "website",
  },
  "/take-action": {
    title: fullTitle("Action Hub"),
    description:
      "Structured guidance for calm, lawful civic actions: contact representatives, support humanitarian access, share public documentation, and volunteer — manual copy-only during the static beta.",
    canonicalPath: "/take-action",
    ogType: "website",
  },
  "/evidence": {
    title: fullTitle("Evidence Library"),
    description:
      "A structured evidence library preview: court records, UN documents, humanitarian updates, and verified investigations — with source-quality levels and editorial status labels.",
    canonicalPath: "/evidence",
    ogType: "website",
  },

  // ── Trust / methodology ─────────────────────────────────────────────
  "/methodology": {
    title: fullTitle("Methodology"),
    description:
      "How Accountability Atlas separates sources, leads, allegations, legal findings, and reviewed public evidence — with verification levels, legal status labels, and publication workflow.",
    canonicalPath: "/methodology",
    ogType: "article",
  },
  "/corrections": {
    title: fullTitle("Corrections"),
    description:
      "Corrections are part of the trust model. Submit corrections for factual errors, outdated sources, unsafe information, mistranslations, or misrepresentation — via GitHub Issues during the static beta.",
    canonicalPath: "/corrections",
    ogType: "website",
  },

  // ── Contribution ────────────────────────────────────────────────────
  "/contribute": {
    title: fullTitle("Contribute"),
    description:
      "Help build Accountability Atlas: developers, designers, researchers, reviewers, writers, and translators — open-source contribution with safety review.",
    canonicalPath: "/contribute",
    ogType: "website",
  },

  // ── Press ───────────────────────────────────────────────────────────
  "/press": {
    title: fullTitle("Press & Resources"),
    description:
      "How to understand, describe, cite, and represent Accountability Atlas responsibly. For journalists, researchers, contributors, and civic-tech reviewers.",
    canonicalPath: "/press",
    ogType: "website",
  },

  // ── Legal / policy ──────────────────────────────────────────────────
  "/privacy": {
    title: fullTitle("Privacy"),
    description:
      "Privacy in the public static beta: no user accounts, no tracking scripts, no witness submissions, no evidence uploads. Static site by design.",
    canonicalPath: "/privacy",
    ogType: "website",
  },
  "/accessibility": {
    title: fullTitle("Accessibility"),
    description:
      "Accessibility commitment: WCAG 2.2 AA target, keyboard navigation, visible focus states, reduced motion support, mobile responsiveness, and readable typography.",
    canonicalPath: "/accessibility",
    ogType: "website",
  },
  "/disclaimer": {
    title: fullTitle("Public Disclaimer"),
    description:
      "Accountability Atlas is an independent open-source civic accountability project — not a court, NGO, charity, or official authority. Public static beta. Corrections welcome.",
    canonicalPath: "/disclaimer",
    ogType: "website",
  },
  "/attributions": {
    title: fullTitle("Attributions"),
    description:
      "Image credits, licences, modifications, and attribution records for every image used on Accountability Atlas — open-licensed or permission-cleared only.",
    canonicalPath: "/attributions",
    ogType: "website",
  },

  // ── Source Registry ──────────────────────────────────────────────────
  "/sources": {
    title: fullTitle("Source Registry"),
    description:
      "Public source registry — every source referenced on Accountability Atlas, with publisher, type, trust level, health status, automation config, access dates, URL status, and links to original documents.",
    canonicalPath: "/sources",
    ogType: "website",
  },

  // ── Dossier Library ──────────────────────────────────────────────────
  "/dossiers": {
    title: fullTitle("Dossier Library"),
    description:
      "Structured, source-linked evidence briefs for policymakers, journalists, researchers, and citizens. One static preview dossier available during the beta. Automated generation from reviewed records planned for a later phase.",
    canonicalPath: "/dossiers",
    ogType: "website",
  },

  // ── Search ───────────────────────────────────────────────────────────
  "/search": {
    title: fullTitle("Search"),
    description:
      "Search across all public platform records — sources, evidence, legal cases, organizations, actions, countries, institutions, dossiers, and trust pages. Client-side only. No queries are logged or stored.",
    canonicalPath: "/search",
    ogType: "website",
  },

  // ── Meta ────────────────────────────────────────────────────────────
  "/changelog": {
    title: fullTitle("Changelog"),
    description:
      "A record of features, improvements, and fixes on the Accountability Atlas platform — maintained by contributors during the public static beta.",
    canonicalPath: "/changelog",
    ogType: "website",
  },

  // ── Error ───────────────────────────────────────────────────────────
  "/404": {
    title: fullTitle("Page not found"),
    description:
      "This page may not exist yet, or it may have moved as the public static beta is being built. Return home or explore the platform.",
    canonicalPath: "/404",
    robots: "noindex,nofollow",
    ogType: "website",
  },
};

/** Resolve metadata for a given pathname. Falls back to 404 metadata for unknown routes. */
export function getRouteMeta(pathname: string): RouteMeta {
  // Normalise: strip trailing slash except for root
  const key =
    pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";

  // Dynamic routes: /sources/:sourceId
  if (key.startsWith("/sources/") && key !== "/sources") {
    return {
      title: fullTitle("Source Detail"),
      description:
        "Source record detail — publisher, document type, publication date, access date, related evidence records, and original document links.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  // Dynamic routes: /evidence/:slug
  if (key.startsWith("/evidence/") && key !== "/evidence") {
    return {
      title: fullTitle("Evidence Record"),
      description:
        "Evidence record detail — category, source quality, editorial status, legal status labels, linked sources, citation, and correction route.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  // Dynamic routes: /legal-tracker/:slug
  if (key.startsWith("/legal-tracker/") && key !== "/legal-tracker") {
    return {
      title: fullTitle("Legal Case Detail"),
      description:
        "Legal case detail — institution, jurisdiction, parties, procedural timeline, legal status labels, source documents, and correction route. Not legal advice.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  // Dynamic routes: /organizations/:slug
  if (key.startsWith("/organizations/") && key !== "/organizations") {
    return {
      title: fullTitle("Organization Detail"),
      description:
        "Organization listing detail — category, regions, services, official website, relationship status, editorial status, and correction/removal route. Public resource listing — no partnership implied.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  // Dynamic routes: /take-action/:slug
  if (key.startsWith("/take-action/") && key !== "/take-action") {
    return {
      title: fullTitle("Action Detail"),
      description:
        "Action template detail — title, type, jurisdiction, intended audience, purpose, policy ask, source basis, instructions, template text, review statuses, warnings, related routes, and correction link. Manual copy-only during the static beta.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  // Dynamic routes: /dossiers/:slug
  if (key.startsWith("/dossiers/") && key !== "/dossiers") {
    return {
      title: fullTitle("Dossier"),
      description:
        "Policy dossier detail — title, version, dossier type, executive summary, key facts from referenced records, legal context, policy asks, recommended actions, and full source list. Static preview — automated generation not yet active.",
      canonicalPath: key,
      ogType: "article",
    };
  }

  return meta[key] ?? meta["/404"];
}

export { meta as routeMetadataMap };
