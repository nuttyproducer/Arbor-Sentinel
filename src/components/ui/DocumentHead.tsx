import { useEffect } from "react";
import { getCanonicalBase } from "../../data/routeMetadata";

interface DocumentHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  robots?: string;
  ogType?: "website" | "article";
}

/**
 * Minimal zero-dependency head management for React SPA.
 *
 * Updates document.title and all dynamic meta tags on every render.
 * Uses `data-rh="true"` attributes to identify and replace managed
 * elements — static tags in index.html (charset, viewport, theme-color)
 * are untouched.
 *
 * @example
 *   <DocumentHead
 *     title="Methodology — Accountability Atlas"
 *     description="How the platform works with evidence."
 *     canonicalPath="/methodology"
 *   />
 */
export function DocumentHead({
  title,
  description,
  canonicalPath,
  ogImage = "/social-preview.svg",
  robots,
  ogType = "website",
}: DocumentHeadProps) {
  const canonicalUrl = `${getCanonicalBase()}${canonicalPath}`;

  useEffect(() => {
    // ── Document title ──────────────────────────────────────────────
    document.title = title;

    // ── Helper: set or create a <meta> element ──────────────────────
    const setMeta = (
      attr: "name" | "property",
      value: string,
      content: string,
    ): void => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${value}"][data-rh="true"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        el.setAttribute("data-rh", "true");
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ── Helper: set or create a <link> element ──────────────────────
    const setLink = (rel: string, href: string): void => {
      let el = document.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"][data-rh="true"]`,
      );
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        el.setAttribute("data-rh", "true");
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Meta description ────────────────────────────────────────────
    setMeta("name", "description", description);

    // ── Open Graph ──────────────────────────────────────────────────
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);

    // ── Twitter card ────────────────────────────────────────────────
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // ── Robots ──────────────────────────────────────────────────────
    setMeta("name", "robots", robots ?? "noindex,nofollow");

    // ── Canonical URL ───────────────────────────────────────────────
    setLink("canonical", canonicalUrl);

    // No cleanup needed — the next effect invocation overwrites the
    // same elements. Static tags in index.html are never touched
    // because they lack the data-rh="true" attribute.
  }, [title, description, canonicalUrl, ogImage, robots, ogType]);

  return null;
}
