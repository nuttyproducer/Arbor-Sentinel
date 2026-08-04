# Accessibility and Performance Gate

**Status:** Active — applied to all commits and PRs.
**Last reviewed:** 2026-07-24
**Version:** 0.1.0

This document defines the accessibility and performance standards that must
be met before any public release. It combines automated checks, manual QA,
and performance budgets into a single gate.

---

## Automated checks (CI)

These run on every push and PR via `.github/workflows/ci.yml`:

| Check | Tool | Threshold |
|---|---|---|
| TypeScript typecheck | `tsc -b` | Zero errors |
| Lint | ESLint | Zero errors, zero warnings |
| Unit + component tests | Vitest | All passing |
| Axe accessibility scan | vitest-axe | Zero violations on tested pages |
| Production build | `vite build` | Must succeed |

### Axe coverage

Pages tested with axe-core automated scans:

- [x] Methodology
- [x] Corrections
- [x] Not Found (404)
- [x] Press
- [x] Accessibility
- [x] Contribute

**Not covered by automated axe scans** (require manual review):

- HomePage — full-viewport image sections with text overlays
- EvidenceDetailPage — complex metadata grids
- LegalCaseDetailPage — timeline component
- DossierDetailPage — multi-section layout
- GazaDossierPage — custom layout
- SearchPage — dynamic search results

Axe catches structural issues (landmarks, headings, ARIA, contrast).
It does not catch: animation behavior, touch target sizes at specific
viewport widths, screen-reader UX quality, or cognitive accessibility.

---

## Performance budget

| Metric | Budget | Measurement |
|---|---|---|
| Total bundle size (gzip) | ≤ 300 KB | `vite build` output |
| Main chunk (gzip) | ≤ 150 KB | `vite build` output |
| LCP (Largest Contentful Paint) | ≤ 2.5 s | Lighthouse / Web Vitals |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Lighthouse / Web Vitals |
| TBT (Total Blocking Time) | ≤ 200 ms | Lighthouse |
| First load JS (gzip) | ≤ 200 KB | `vite build` output |

### Measuring bundle size

```bash
npm run build
# Inspect dist/ directory:
# du -sh dist/assets/*.js | sort -h
```

The build is configured with `chunkSizeWarningLimit: 400` (KB). Any chunk
exceeding this triggers a warning during build.

### Route chunk strategy

- **Eager:** HomePage, NotFoundPage — critical for first paint and error handling
- **Lazy (React.lazy):** All other pages — split at the route level
- **Vendor chunks:** react/react-dom/react-router-dom, framer-motion, i18n

---

## Manual QA checklist

Complete before public release. Re-check after significant UI changes.

### Keyboard navigation

- [ ] Tab order is logical on every page
- [ ] Focus rings are visible on every interactive element
- [ ] Skip-to-content link works on every page
- [ ] Mobile menu is keyboard-operable (open, navigate, close)
- [ ] No keyboard traps
- [ ] All interactive elements reachable via Tab (no positive tabindex)

### Screen reader

- [ ] All pages have a unique `<title>` (check browser tab)
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skips)
- [ ] Landmarks are present (banner, main, contentinfo, navigation)
- [ ] Images have alt text or are marked aria-hidden
- [ ] Dynamic content uses aria-live regions
- [ ] Test with VoiceOver (macOS) or NVDA (Windows)

### Zoom and viewport

- [ ] **200% zoom:** All content remains readable, no overlapping elements
- [ ] **400% zoom:** Page is usable, critical content not hidden
- [ ] **375px viewport:** No horizontal overflow on any page
- [ ] **1024px viewport:** Layout adapts correctly (tablet)
- [ ] **1920px viewport:** Layout uses available space without breaking

### Color and contrast

- [ ] All text meets WCAG AA contrast minimum (4.5:1 for normal text)
- [ ] Text over images/overlays has sufficient contrast
- [ ] Focus rings have sufficient contrast against backgrounds
- [ ] Information is not conveyed by color alone

### Motion

- [ ] `prefers-reduced-motion: reduce` disables all animations and transitions
- [ ] No auto-playing video or animation over 5 seconds
- [ ] Scroll-triggered reveals are disabled when reduced motion is preferred

### Low-graphic mode

- [ ] Toggle is accessible from the header (keyboard-operable)
- [ ] Toggling to "low-graphic" replaces documentary images with calm surfaces
- [ ] All text content and functionality is preserved
- [ ] Toggling back to "standard" restores all images
- [ ] Preference persists across page navigations (same tab)
- [ ] Preference is stored in localStorage only (no server request)

### Print

- [ ] Navigation and footer are hidden
- [ ] Print header shows title, version, status, dates
- [ ] Print footer shows canonical URL and correction path
- [ ] No clipped cards or overflow
- [ ] URLs are printed for external links
- [ ] Background images are removed
- [ ] Text is legible (dark on white)
- [ ] Tested on: Evidence detail, Legal detail, Country page, Institution page,
  Dossier detail, Methodology

### Content validation

- [ ] `npm run validate:content` passes
- [ ] No review_pending content described as "reviewed"
- [ ] Source quality and editorial status are not conflated
- [ ] All sources have title, publisher, URL, publication date, access date
- [ ] Legal status labels use controlled vocabulary

### Performance

- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] Lighthouse score ≥ 90 (Accessibility)
- [ ] Lighthouse score ≥ 90 (Best Practices)
- [ ] Lighthouse score ≥ 100 (SEO)
- [ ] No chunk size warnings during build
- [ ] Route code splitting verified: navigating between routes loads new chunks

---

## No-horizontal-overflow check

Run in browser console on each page at 375px viewport:

```javascript
// Check for horizontal overflow
const docWidth = document.documentElement.scrollWidth;
const viewportWidth = window.innerWidth;
console.log(
  'Overflow:',
  docWidth > viewportWidth
    ? `YES — ${docWidth - viewportWidth}px overflow`
    : 'None'
);
```

Any page with horizontal overflow at 375px must be fixed before release.

---

## Mobile viewport tests

Test each route at these widths:

| Width | Device |
|---|---|
| 375px | iPhone SE / small Android |
| 390px | iPhone 14 |
| 412px | Samsung Galaxy |
| 768px | iPad portrait |
| 1024px | iPad landscape |

Verify:
- No horizontal scrolling
- Text is readable without zooming
- Touch targets ≥ 44×44px (or 24×24px for inline links)
- Navigation is usable (mobile menu works)

---

## 200% and 400% zoom checklist

Tested in Chrome at 1280px viewport:

### 200% zoom
- [ ] All text remains within viewport
- [ ] No overlapping elements
- [ ] Navigation is usable
- [ ] Forms/links are clickable
- [ ] Images scale without breaking layout

### 400% zoom
- [ ] Critical content is visible
- [ ] Horizontal scrolling is minimal and intentional
- [ ] Skip-to-content link works
- [ ] Main navigation is accessible

---

## Acceptance criteria for this gate

- [x] Route code splitting works (React.lazy + Suspense)
- [x] Low-graphic mode preserves all information
- [x] Print layouts are usable
- [x] No image attribution is lost
- [x] Reduced-motion behavior remains correct
- [x] Accessibility tests pass
- [x] Content validation passes
- [x] Build succeeds

---

## Related documents

- [Quality and Testing](./quality-and-testing.md) — CI pipeline and test structure
- [Content Review Workflow](./content-review-workflow.md) — content statuses
- [Correction Policy](./correction-policy.md) — reporting errors
- [Static Beta Security Checklist](./static-beta-security-checklist.md)
- [Static Beta Release Readiness](./STATIC-BETA-RELEASE-READINESS.md)
