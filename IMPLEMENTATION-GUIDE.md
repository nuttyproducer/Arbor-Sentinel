# Accountability Atlas — Implementation Guide

**Version:** 1.0.0  
**Last updated:** 2026-07-24  
**Status:** Active — applies to all current and future implementation work

---

## Purpose

This document is the single source of truth for **how** the Accountability Atlas codebase is built. It contains coding standards, UI rules, documentation requirements, testing expectations, and architectural guardrails that govern every contribution. Every contributor and every AI agent is expected to follow these rules.

This is a companion to the PRD (which defines **what** we build). Where the PRD is aspirational, this guide is enforceable. Where the PRD describes features, this guide describes the discipline of building them.

---

## Table of Contents

1. [Constitutional Rules (Non-Negotiable)](#1-constitutional-rules-non-negotiable)
2. [Development Environment](#2-development-environment)
3. [Project Architecture](#3-project-architecture)
4. [Coding Standards](#4-coding-standardss)
5. [Component Architecture](#5-component-architecture)
6. [Design System Rules](#6-design-system-rules)
7. [Data Handling Rules](#7-data-handling-rules)
8. [Documentation Requirements](#8-documentation-requirements)
9. [Testing Requirements](#9-testing-requirements)
10. [Git and Commit Conventions](#10-git-and-commit-conventions)
11. [Review Gates](#11-review-gates)
12. [AI Usage in Development](#12-ai-usage-in-development)
13. [Performance Budgets](#13-performance-budgets)
14. [Security Checklist](#14-security-checklist)
15. [i18n and Localization](#15-i18n-and-localization)
16. [Accessibility Compliance](#16-accessibility-compliance)
17. [Print Styles and Media](#17-print-styles-and-media)
18. [Search Architecture](#18-search-architecture)
19. [Validation Pipeline](#19-validation-pipeline)
20. [Appendices](#20-appendices)

---

## 1. Constitutional Rules (Non-Negotiable)

These rules are the foundation of every implementation. They must never be violated. If a rule conflicts with another requirement, these rules take precedence. If you cannot implement a feature within these rules, the feature must not be implemented.

### 1.1 AI Rules

**R1.1.1** — Never publish AI-generated content directly. All AI output must pass through human review before publication. This includes code, text, metadata, translations, and summaries.

**R1.1.2** — AI-assisted drafts must be labeled as such in internal systems. The label must specify what was AI-assisted and to what degree.

**R1.1.3** — The AI model name and version must be recorded for every AI-assisted operation that produces substantive content (code, copy, translations, summaries). Record in commit messages or inline comments:
```
AI-assisted: Claude 4 Sonnet (anthropic) — generated dossier type definitions
```

**R1.1.4** — AI confidence scores or probability estimates are metadata only. They must never be the sole basis for publication decisions, and must never be exposed in the UI or to end users.

**R1.1.5** — AI may assist with code generation, refactoring suggestions, test generation, documentation drafts, and translation drafts. AI must never make architectural decisions, content policy decisions, legal judgments, or publication decisions.

### 1.2 Content Rules

**R1.2.1** — Never create unsupported claims. Every factual assertion in the codebase and every published page must trace to a specific, verifiable public source.

**R1.2.2** — Always preserve source provenance. Every source record (see `src/types/content.ts`, `SourceRecord` interface) must include publisher, URL, access date, source type, and content status. Source records cannot be deleted — only superseded or archived.

**R1.2.3** — Never imply legal conclusions beyond the cited sources. Distinguish between allegations, proceedings, rulings, warrants, and findings in all UI labels, component text, and metadata. Use the controlled `LegalStatus` vocabulary from `src/types/content.ts`.

**R1.2.4** — Every factual claim must have a traceable public source or be clearly labeled as draft/pending review. The `ContentStatus` type (`src/types/content.ts`) provides the controlled vocabulary: `draft`, `static_preview`, `review_pending`, `reviewed`, `disputed`, `corrected`, `archived`.

**R1.2.5** — Content in the UI must clearly distinguish between:
- **Verified facts** — source-checked, corroborated, or institutionally recorded
- **Allegations** — claims made by a party, not yet judicially determined
- **Legal proceedings** — active court or tribunal actions with procedural posture
- **NGO determinations** — findings by non-governmental organizations
- **Humanitarian reporting** — operational updates from humanitarian actors

Use `SourceType` (`src/types/content.ts`) and `LegalStatus` enumerations to maintain these distinctions.

### 1.3 Safety Rules

**R1.3.1** — Never publish private addresses, phone numbers, or family details. If such data exists in a source document, reference the document without reproducing the sensitive data.

**R1.3.2** — Never create targeting lists or harassment vectors. The platform exists to support lawful accountability, not intimidation. Lists of representatives must use official public contact channels only.

**R1.3.3** — Never dehumanize populations or treat identity as guilt. Attribution of responsibility must always be to specific actors (governments, institutions, individuals in their official capacity), not to populations, ethnic groups, or nationalities.

**R1.3.4** — Content warnings are required for graphic material. Any component displaying potentially distressing content (documentary images, descriptions of violence, casualty figures) must include an accessible content warning before the content.

**R1.3.5** — Safety review is required before publication of high-risk content. High-risk content includes: evidence of ongoing crimes, personally identifiable information in source documents, operational details of humanitarian or legal actors, and material that could endanger vulnerable populations if misused.

### 1.4 Quality Rules

**R1.4.1** — Every new feature must include documentation. At minimum: purpose and user need, component API (props), data dependencies, accessibility considerations, and review gates passed. See Section 8.

**R1.4.2** — Every public-facing feature must pass accessibility checks. See Section 16.

**R1.4.3** — Every new data type must have validation. Add Zod schemas to `src/schemas/index.ts` and validation rules to `src/lib/content-validation/rules.ts`.

**R1.4.4** — Every route must include metadata. Add entries to `src/data/routeMetadata.ts` with title, description, canonical path, OG metadata, and robots directive.

**R1.4.5** — Every component must support mobile-first responsive design. Use Tailwind breakpoints (`sm:`, `md:`, `lg:`) with mobile-first classes. Test on a 375px viewport minimum.

### 1.5 Architecture Rules

**R1.5.1** — Prefer composition over duplication. Before creating a new component, check if an existing component can be composed or extended. See Section 5 for component categories.

**R1.5.2** — Create shared components only after two concrete use cases exist. The first instance belongs inline; the second instance justifies extraction. This prevents premature abstraction.

**R1.5.3** — Favor event-based data over article-based data. Legal cases, timeline events, and procedural milestones should be structured as typed records (`LegalTimelineEvent` in `src/types/content.ts`), not as prose articles.

**R1.5.4** — Design repositories around domain models, not database tables. Data files in `src/data/` should reflect domain concepts (evidence, legal cases, organizations, dossiers) rather than database normalisation. Future API migration is handled by creating adapters, not by restructuring domains.

**R1.5.5** — Treat review states as first-class citizens in both UI and data. Every public record must include `contentStatus`, `lastReviewedAt`, `reviewedByRole`, and `version`. Every record card must display editorial status. Every page must handle and display review metadata.

**R1.5.6** — Privacy by default. Collect the minimum necessary data. During the static beta, no user accounts, no tracking scripts, no analytics, no cookies. The search index (`src/lib/search/`) is entirely client-side with no query logging.

**R1.5.7** — Performance budgets and progressive enhancement apply to every feature. See Section 13.

---

## 2. Development Environment

### 2.1 Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 19 with TypeScript 5.7 | Strict mode enabled |
| Build | Vite 6 | With manual chunking in `vite.config.ts` |
| Styling | Tailwind CSS 3.4 | Custom design tokens in `tailwind.config.js` |
| Routing | React Router 7 | Lazy-loaded page-level routes |
| Animation | Framer Motion 12 | Restricted usage — see Section 6.3 |
| i18n | i18next + react-i18next | English authoritative, nl/fr as initial targets |
| Testing | Vitest + testing-library + vitest-axe | |
| Validation | Zod 4 | Runtime validation for all static data |
| Fonts | IBM Plex Serif, Inter, IBM Plex Mono | Self-hosted via @fontsource |

### 2.2 Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Type check + production build
npm run typecheck    # TypeScript type checking (tsc -b)
npm run lint         # ESLint across all source files
npm run test         # Vitest run
npm run test:watch   # Vitest watch mode
npm run validate:content  # Run static-data validation rules
npm run preview      # Preview production build
```

### 2.3 TypeScript Configuration

TypeScript is configured via `tsconfig.app.json` (inherited from `tsconfig.json`):

- **strict: true** — all strict checks enabled
- **target: ES2020** — modern syntax, widely supported
- **module: ESNext** — native ES module resolution
- **jsx: "react-jsx"** — automatic JSX runtime (React 19)
- Path aliases configured for clean imports:
  - `@/components/*` → `src/components/*`
  - `@/data/*` → `src/data/*`
  - `@/types/*` → `src/types/*`
  - `@/utils/*` → `src/utils/*`
  - `@/schemas/*` → `src/schemas/*`
  - `@/lib/*` → `src/lib/*`

### 2.4 ESLint Configuration

ESLint is configured via `eslint.config.js` using the flat config format:

- Extends `eslint:recommended` and `typescript-eslint/recommended`
- React Hooks rules enabled
- `react-refresh/only-export-components` at warn level
- `no-unused-vars` with `_` prefix ignore pattern (both args and vars)
- `no-non-null-assertion` at warn level

---

## 3. Project Architecture

### 3.1 Directory Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Router + providers + lazy loading
├── test-setup.ts                     # Vitest global setup + mocks
├── vite-env.d.ts                     # Vite type declarations
├── assets/                           # Static assets (images, SVGs)
│   ├── images/
│   └── logo*.svg
├── components/
│   ├── layout/                       # Header, Footer, PageShell, Navigation
│   ├── ui/                           # Button, Badge, Card, Container, Reveal, etc.
│   ├── landing/                      # Hero, MissionSection, GatewaySection, etc.
│   ├── pages/                        # PageIntro, PageStatusNotice, PreviewNotice, etc.
│   ├── evidence/                     # EvidenceItemCard, EvidenceFilters, EvidenceEmptyState
│   ├── legal/                        # LegalCaseCard, LegalTimeline, legalStatusExplanations
│   ├── countries/                    # CountryIndexCard, CountryOverviewCard
│   ├── institutions/                 # InstitutionIndexCard
│   ├── organizations/               # OrganizationCard, OrganizationDisclaimer
│   ├── actions/                      # CopyTemplateButton, ActionCard
│   ├── dossiers/                     # DossierCard, DossierPreview
│   ├── search/                       # SearchResultCard, RelatedRecords
│   ├── methodology/                  # PublicationWorkflow, sourceHierarchyData
│   ├── press/                        # CitationGuide
│   └── review/                       # ReviewQueue, ReviewAssignment, ReviewBadge (future)
├── pages/                            # Route-level page components
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   ├── ContributePage.tsx
│   ├── CountriesIndexPage.tsx
│   ├── DossiersPage.tsx
│   ├── OrganizationDetailPage.tsx
│   └── ...
├── data/                             # Static data files (domain records)
│   ├── modules.ts
│   ├── principles.ts
│   ├── roadmap.ts
│   ├── navigation.ts
│   ├── countries.ts
│   ├── institutions.ts
│   ├── dossiers.ts
│   ├── dossierTemplates.ts
│   ├── routeMetadata.ts
│   ├── sources.ts
│   ├── evidenceItems.ts
│   ├── legalCases.ts
│   ├── legalTimeline.ts
│   ├── organizations.ts
│   ├── actionTemplates.ts
│   ├── attributions.ts
│   └── ...
├── types/                            # Shared TypeScript type definitions
│   └── content.ts                    # All domain type definitions
├── schemas/                          # Zod validation schemas
│   └── index.ts                      # Runtime validation mirrors types
├── lib/                              # Business logic and utilities
│   ├── content-validation/
│   │   ├── types.ts                  # Validation issue types + cadence config
│   │   ├── rules.ts                  # Individual validation rule functions
│   │   ├── validate.ts               # Orchestrator: runs all rules
│   │   ├── summary.ts                # Human-readable summary output
│   │   └── index.ts                  # Public API
│   └── search/
│       ├── types.ts                  # Search index types
│       ├── buildIndex.ts             # Index builder
│       ├── search.ts                 # Client-side search function
│       ├── relationships.ts          # Cross-record relationship resolver
│       └── index.ts                  # Public API
├── i18n/                             # Internationalization
│   ├── config.ts                     # i18next initialization
│   ├── LocaleProvider.tsx            # React locale context provider
│   ├── languageDetector.ts           # Custom language detection
│   └── locales/
│       ├── en/                       # English (source/authoritative)
│       ├── nl/                       # Dutch
│       └── fr/                       # French
├── contexts/                         # React contexts
│   └── DisplayPreference.tsx         # Display preferences (graphic mode, etc.)
└── styles/
    └── index.css                     # Tailwind imports, custom CSS, print styles
```

### 3.2 Component Categories

Components are organized by domain in `src/components/{domain}/`. Each category has a clear boundary:

| Category | Purpose | Examples |
|----------|---------|----------|
| `layout/` | Page chrome — rendered once per route | Header, Footer, PageShell |
| `ui/` | Atomic, reusable primitives | Button, Badge, Card, Container, Reveal |
| `landing/` | Homepage sections | Hero, MissionSection, GatewaySection |
| `pages/` | Page-level shared patterns | PageIntro, PageStatusNotice, PreviewNotice |
| `evidence/` | Evidence library domain | EvidenceItemCard, EvidenceFilters |
| `legal/` | Legal tracker domain | LegalCaseCard, LegalTimeline |
| `countries/` | Country accountability domain | CountryIndexCard |
| `institutions/` | Institution accountability domain | InstitutionIndexCard |
| `organizations/` | Organization directory domain | OrganizationCard, OrganizationDisclaimer |
| `actions/` | Action hub domain | CopyTemplateButton |
| `dossiers/` | Dossier library domain | (future: DossierCard, DossierPreview) |
| `search/` | Search domain | SearchResultCard, RelatedRecords |
| `methodology/` | Methodology/trust domain | PublicationWorkflow |
| `press/` | Press/media domain | CitationGuide |
| `review/` | Editorial review workflow | ReviewQueue, ReviewAssignment, ReviewBadge (future) |

### 3.3 Route Architecture

Routes are defined in `src/App.tsx` using React Router 7:

- **Critical pages** (HomePage, NotFoundPage) are eagerly imported
- **All other pages** are lazy-loaded via `React.lazy()` with `Suspense` and `RouteLoadingFallback`
- **Route metadata** is centralised in `src/data/routeMetadata.ts` with title, description, canonical URL, OG tags, and robots directives
- **Dynamic routes** (e.g., `/legal-tracker/:slug`, `/evidence/:slug`) resolve metadata via pattern matching in `getRouteMeta()`
- **RouteMeta component** uses `useLocation()` to sets `document.title` and meta tags on every page navigation
- **ScrollToTop** component resets scroll position on route change

The full route table is in `src/App.tsx` lines 84–112. Every new page must be added to the route table, the lazy import list, and the metadata map.

---

## 4. Coding Standards

### 4.1 TypeScript

**S4.1.1** — Strict mode is enabled in `tsconfig.app.json`. This is non-negotiable. No file-level exceptions.

**S4.1.2** — Explicit return types on all public functions and exported components. This includes the return type of component functions (`JSX.Element` or `ReactNode`), hook return values, and utility function signatures.

**S4.1.3** — Use `interface` over `type` for public APIs (props interfaces, exported data shapes). Use `type` for unions, intersections, utility types, and internal-only shapes.

```typescript
// Good — interface for public API
interface EvidenceItemCardProps {
  item: EvidenceItem;
  className?: string;
}

// Good — type for internal union
type PhaseStatus = "current" | "next" | "planned" | "reviewed-later";
```

**S4.1.4** — No `any` without an explicit justification comment. Every use of `any` must include a comment explaining why the type is unrepresentable.

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Acceptable: rule operates on heterogeneous record collections with dynamic fields
records: readonly Record<string, any>[]
```

**S4.1.5** — Use discriminated unions for state management. Loading, error, empty, and success states should be modelled as a union type rather than boolean flags.

**S4.1.6** — Data files in `src/data/` must have exact structure matching their interfaces and Zod schemas. Every record must include: `id`, `contentStatus` (or `status`), version tracking, source references, and correction route where applicable.

### 4.2 React

**S4.2.1** — Functional components only. No class components.

**S4.2.2** — Hooks for state and side effects. Use `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, `useInView`, `useReducedMotion` as appropriate. Custom hooks should be extracted when logic is reused or when a component becomes difficult to test.

**S4.2.3** — Components should have a single responsibility. If a component does more than one thing (e.g., fetches data AND transforms it AND renders it in a complex layout), extract the logic and/or layout into separate units.

**S4.2.4** — Complex logic must be extracted to custom hooks. Good candidates: filtering, search, data resolution, clipboard interaction, expand/collapse state.

**S4.2.5** — Props interfaces must be exported from the component file so they can be reused and documented.

**S4.2.6** — Default exports for pages (for lazy loading convenience), named exports for components. See `src/App.tsx` for the lazy-loading pattern.

**S4.2.7** — File structure: `src/components/{domain}/{ComponentName}.tsx`. Test files co-located in `__tests__/` subdirectory: `src/components/{domain}/__tests__/{ComponentName}.test.tsx`.

### 4.3 File Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Component | PascalCase.tsx | `EvidenceItemCard.tsx` |
| Hook | camelCase.ts | `useFilteredEvidence.ts` |
| Data file | camelCase.ts | `countries.ts`, `routeMetadata.ts` |
| Page | PascalCase.tsx | `HomePage.tsx`, `CountriesIndexPage.tsx` |
| Utility | camelCase.ts | `filters.ts` |
| Type definition | camelCase.ts | `content.ts` |
| Test file | ComponentName.test.tsx | `Badge.test.tsx` |
| Test utility | camelCase.ts | `test-setup.ts` |

### 4.4 Import Order

Imports must follow this order, grouped with blank lines between groups:

1. React / React Router / React DOM
2. Third-party libraries (framer-motion, i18next, zod)
3. Local components (`@/components/...` or relative `../ui/...`)
4. Local utilities and hooks (`@/lib/...`, `@/utils/...`)
5. Local data (`@/data/...` or `../../data/...`)
6. Local types (`@/types/...` or `../../types/...`)
7. Styles (CSS imports only — not used in components, only in `main.tsx`)

Always use path aliases (`@/components/`, `@/data/`, `@/types/`, `@/lib/`, `@/schemas/`) for cross-directory imports. Use relative imports for intra-directory or closely-related imports.

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SourceList } from "../pages/SourceList";

import { sources } from "../../data/sources";

import type { EvidenceItem } from "../../data/evidenceItems";
import { CONTENT_STATUS_LABELS, VERIFICATION_LEVEL_LABELS } from "../../types/content";
```

---

## 5. Component Architecture

### 5.1 Component Patterns

Every component must follow these patterns, as established in the codebase:

**S5.1.1** — Every component must accept a `className` prop for composition. Default to `className = ""`.

```typescript
interface MyComponentProps {
  children: ReactNode;
  className?: string;
}

export function MyComponent({ children, className = "" }: MyComponentProps) {
  return <div className={`... ${className}`.trim()}>{children}</div>;
}
```

**S5.1.2** — Use `forwardRef` where ref forwarding is needed (e.g., for scroll targets, focus management).

**S5.1.3** — Components that fetch or resolve data must handle loading, error, and empty states. See `LegalTimeline.tsx` for the empty state pattern, `EvidenceItemCard.tsx` for the expandable detail pattern.

**S5.1.4** — Use Tailwind CSS exclusively. No CSS modules, no styled-components, no CSS-in-JS libraries. The only custom CSS lives in `src/styles/index.css` (Tailwind directives, print styles, utility classes).

**S5.1.5** — Framer Motion is restricted to specific use cases only: hero entrance, section reveals, staggered cards, roadmap line/cards animation. No parallax, no infinite animation, no scroll-jacking, no image zoom loops.

### 5.2 UI Component Inventory

These are the foundational UI components. Check this list before creating a new component.

| Component | File | Props | Notes |
|-----------|------|-------|-------|
| `Button` | `ui/Button.tsx` | variant, children, icon, className | Discriminated union for Link/anchor/button |
| `Badge` | `ui/Badge.tsx` | variant, children, className | 4 variants: neutral, info, warning, alert |
| `Card` | `ui/Card.tsx` | accent, label, title, children, className | 3 accent colors: amber, clay, blue |
| `Container` | `ui/Container.tsx` | children, className | max-w-7xl centered wrapper |
| `Reveal` | `ui/Reveal.tsx` | children, direction, delay, duration, once, amount, className | Motion wrapper with reduced-motion support |
| `SectionHeading` | `ui/SectionHeading.tsx` | eyebrow, title, description, id | Centered heading block |
| `DocumentHead` | `ui/DocumentHead.tsx` | title, description, canonicalPath, ogImage, robots, ogType | Headless meta manager |
| `ExternalLink` | `ui/ExternalLink.tsx` | href, children, showIcon | Target=_blank with noopener |
| `LinkCard` | `ui/LinkCard.tsx` | label, title, children, to, disabled, accent | Card-wrapped Link |
| `RouteLoadingFallback` | `ui/RouteLoadingFallback.tsx` | — | Suspense fallback |

### 5.3 Page Component Inventory

These components are used by pages for consistent structure.

| Component | File | Purpose |
|-----------|------|---------|
| `PageIntro` | `pages/PageIntro.tsx` | Eyebrow + H1 + description at page top |
| `PageStatusNotice` | `pages/PageStatusNotice.tsx` | Status notification banner (info/warning/alert) |
| `PreviewNotice` | `pages/PreviewNotice.tsx` | Notice that content is a static preview |
| `PolicySection` | `pages/PolicySection.tsx` | Section with heading, optional anchor |
| `CorrectionLink` | `pages/CorrectionLink.tsx` | Consistent correction link at page bottom |
| `LastUpdated` | `pages/LastUpdated.tsx` | Timestamp at page bottom |
| `SourceList` | `pages/SourceList.tsx` | List of linked source documents |
| `ContentStatusBadge` | `pages/ContentStatusBadge.tsx` | Badge for editorial content status |
| `LegalStatusBadge` | `pages/LegalStatusBadge.tsx` | Badge for legal status with explanation |
| `VerificationBadge` | `pages/VerificationBadge.tsx` | Badge for verification level |

### 5.4 Component Props Interface Template

Every new component follows this template:

```typescript
import { type ReactNode } from "react";

interface MyComponentProps {
  /** Primary content or label */
  children: ReactNode;
  /** Optional CSS class override for composition */
  className?: string;
  /** Variant selection — default is the safest option */
  variant?: "primary" | "secondary";
  /** Accessible label when children is not sufficient */
  ariaLabel?: string;
}

export function MyComponent({
  children,
  className = "",
  variant = "primary",
  ariaLabel,
}: MyComponentProps) {
  // Component logic here
  return (
    <div
      className={`base-classes ${variantClasses[variant]} ${className}`.trim()}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      {children}
    </div>
  );
}
```

---

## 6. Design System Rules

### 6.1 Color System

The color palette is defined in `tailwind.config.js` and uses custom tokens, not Tailwind defaults.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `ink` | `#101828` | Authority, footer, overlays, primary buttons |
| `charcoal` | `#1F2937` | Body text |
| `paper` | `#F7F1E8` | Primary background |
| `bone` | `#FAFAF7` | Cards and light text backgrounds |
| `amber` | `#D99A2B` | Current phase, evidence point, careful emphasis |
| `clay` | `#B95C50` | Human/safety accent |
| `trust` | `#3B6EA8` | Legal/institutional states |
| `border` | `#D8D6D0` | Dividers and document card borders |

**Color rules:**
- Use opacity modifiers (`/10`, `/20`, `/50`, `/80`) for backgrounds and borders to create depth without introducing new color tokens. See `Badge.tsx` for the pattern.
- Accent colors (amber, clay, trust) must always be used with opacity on backgrounds. Full opacity is reserved for small decorative elements (lines, dots, borders).
- Text must never use accent colors as primary text color. Text colors are `ink`, `charcoal`, `bone`, or opacity variants.
- `bone` is the card background color. Cards render on `paper` (the page background). This creates subtle depth.

### 6.2 Typography

| Font Family | CSS Class | Usage |
|-------------|-----------|-------|
| IBM Plex Serif | `.font-serif` | Headings (h1-h3) and editorial authority |
| Inter | `.font-sans` | Body text and interface |
| IBM Plex Mono | `.font-mono` | Labels, metadata, source and status language |

**Typography rules:**
- Fonts are self-hosted via `@fontsource` imports in `src/styles/index.css`. No external font requests.
- Font weights used: Inter 400/500/600/700/800, IBM Plex Serif 500/600/700, IBM Plex Mono 400/500.
- All font imports are in `src/styles/index.css` before the Tailwind directives.
- Heading hierarchy: `h1` uses `text-4xl lg:text-5xl`, `h2` uses `text-2xl lg:text-3xl` or `text-3xl lg:text-4xl`, `h3` uses `text-lg` or `text-xl`.
- Never skip heading levels. The semantic heading hierarchy must be maintained.
- Labels and metadata use `text-[10px]` to `text-xs` in `font-mono` with uppercase tracking.
- The base body size is `text-base` (16px) on `font-sans`.

### 6.3 Motion Rules

Motion is a deliberate tool, not a decoration. Framer Motion is restricted to:

1. **Hero entrance** — staggered reveal of hero section elements (`Reveal` component with delays)
2. **Section reveals** — fade-in + upward slide as sections enter viewport (`Reveal` component)
3. **Staggered cards** — sequential card reveals in grids (incrementing `delay` prop)
4. **Roadmap line/cards** — animated connecting line and staggered card reveals on the roadmap section

**Forbidden patterns:**
- No parallax scrolling effects
- No infinite animation (spinning, pulsing, breathing)
- No scroll-jacking (changing scroll behavior beyond `scroll-behavior: smooth`)
- No image zoom loops
- No animation on elements that convey information (status badges, legal labels, timestamps)

**Motion timing defaults:**
- Duration: 0.5s (standard), 0.6s (hero), 0.35s (roadmap markers)
- Easing: `easeOut` (standard entrance)
- Delay increments: 0.05-0.08s between staggered items, 0.1s between sections
- Amount: 0.2 (viewport intersection threshold)

**S5.6.5** — Respect `prefers-reduced-motion`. The `Reveal` component uses `useReducedMotion()` and renders plain divs when reduced motion is preferred. The `RoadmapPreview` does the same for all animated elements.

```typescript
const prefersReducedMotion = useReducedMotion();

if (prefersReducedMotion) {
  return <div className={className}>{children}</div>;
}
```

### 6.4 Shadows and Borders

- Cards and containers use `border border-charcoal/15` as the standard border.
- Hover states on interactive cards: `hover:shadow-soft hover:-translate-y-0.5 hover:border-charcoal/30`.
- `shadow-soft` is a custom token defined in `tailwind.config.js`: `0 18px 50px rgba(16, 24, 40, 0.08)`.
- Dividers use `border-t border-border` or `border-t border-border/50`.

### 6.5 Spacing and Layout

- Page top padding: `py-16 lg:py-20` (index pages), `py-24 lg:py-32` (content pages).
- Section padding: `py-24 lg:py-32` for major sections.
- Internal card padding: `p-5 lg:p-6` or `p-7 lg:p-9`.
- Grid layouts use `gap-4`, `gap-5`, or `gap-6` depending on density.
- Max content width: `max-w-7xl` for page containers, `max-w-3xl` or `max-w-2xl` for text content.
- The `Container` component (`src/components/ui/Container.tsx`) provides the standard page wrapper: `max-w-7xl mx-auto px-6 lg:px-8`.
- Sections are distinguished visually by alternating between `bg-paper` (default body background) and `bg-bone` (alternate section background). See `NotThisProject.tsx` and `ContributorCTA.tsx` for the `bg-bone` section pattern.

### 6.6 Section Pattern

Every section on the landing page and content pages follows a consistent structural pattern:

```typescript
import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function ExampleSection() {
  return (
    <section className="py-24 lg:py-32" aria-labelledby="section-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Label"
            title="Section Title"
            id="section-title"
            description="Optional description below the title."
          />
        </Reveal>
        <Reveal delay={0.1}>
          {/* Section content here */}
        </Reveal>
      </Container>
    </section>
  );
}
```

Section variations:
- **Text-heavy sections** (like `MissionSection`): `max-w-3xl mx-auto` for the text block, with an optional `border-l-2 border-amber/30` for editorial quotes.
- **Card grid sections** (like `GatewaySection`): responsive grid with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
- **List sections** (like `SafetyPrinciples`): `max-w-3xl mx-auto space-y-4` with individual card items.
- **Alternate background sections**: add `bg-bone` to the `<section>` element for visual separation from the default `paper` background.

### 6.7 List and Detail Item Patterns

**Label rows** (metadata labels above content):
```tsx
<p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
  Label text
</p>
```

**Metadata stat rows** (key-value pairs in evidence item cards):
```tsx
<div>
  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
    Incident date
  </p>
  <p className="text-sm text-charcoal/70">{item.incidentDate}</p>
</div>
```

**Pill/tag styling** (non-interactive tags):
```tsx
<span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-bone border border-border text-charcoal/60">
  {tag}
</span>
```

**Interactive links in cards** (consistently styled with Trust Blue):
```tsx
<Link
  to={item.slug}
  className="inline-flex items-center gap-1.5 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
>
  View details
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M4 8.5L7 5.5L4 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</Link>
```

**Correction link pattern** (at the bottom of every page and every record):
```tsx
<Link
  to="/corrections"
  className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
>
  Report an error in this entry
</Link>
```

### 6.8 Icon and SVG Patterns

All inline SVGs in the codebase follow these rules:
- `aria-hidden="true"` on every decorative SVG (never use `role="img"` for decorative icons)
- `stroke="currentColor"` so the icon inherits text color from its parent
- Consistent viewbox dimensions: `16x16` for primary arrows, `14x14` for external links, `12x12` for inline chevrons and secondary icons
- `strokeWidth` of `1.2` or `1.5` depending on size
- `strokeLinecap="round"` and `strokeLinejoin="round"` for clean rendering
- Never use `fill` on icons that should be stroke-based
- No icon libraries (Font Awesome, Heroicons, Lucide) — all icons are hand-written inline SVGs

The `ArrowIcon` and `ExternalIcon` exported from `Button.tsx` are the canonical arrow and external-link icons. Use them wherever these icons are needed rather than redefining the SVG.

---

## 7. Data Handling Rules

### 7.1 Static Data (Current Phase — Static Beta)

All data lives in `src/data/*.ts` files as typed exports.

**S7.1.1** — Every record must include:
- `id` — unique, kebab-case identifier
- `contentStatus` (or `status`) — from the controlled `ContentStatus` vocabulary
- `sourceIds` — array of source record IDs that support the data
- `version` — integer starting at 1
- `lastReviewedAt` — ISO 8601 date string, required for reviewed records
- `reviewedByRole` — role string, required for reviewed records
- `correctionUrl` — route to the corrections process, required for publishable records

**S7.1.2** — Draft/preview content must be explicitly marked. Records with `contentStatus: "draft"` must not be rendered in production. Records with `contentStatus: "static_preview"` must display a preview notice.

**S7.1.3** — No sensitive personal data in static files. No addresses, phone numbers, email addresses, or personal identifiers.

**S7.1.4** — No raw witness material. No unverified social media claims as evidence. Social media content that has been verified by a trusted organization may be referenced as a source, but the raw post must not be embedded.

**S7.1.5** — All interfaces in `src/types/content.ts` must remain compatible with future API records. Use consistent field naming, ISO 8601 dates, and controlled vocabularies. When the database layer is added, domain interfaces should not need to change — only the data-fetching layer.

### 7.2 Controlled Vocabularies

These vocabularies are defined in `src/types/content.ts` and must be used wherever applicable:

**ContentStatus:**
```typescript
"draft" | "static_preview" | "review_pending" | "reviewed" | "disputed" | "corrected" | "archived"
```

**LegalStatus:**
```typescript
"court_proceeding_active" | "provisional_measures_issued" | "arrest_warrant_issued" |
"allegation_under_investigation" | "un_finding" | "ngo_legal_determination" |
"not_judicially_determined" | "contested_claim" | "requires_further_verification"
```

**VerificationLevel:** `0 | 1 | 2 | 3 | 4 | 5`
- 0: Unreviewed lead
- 1: Preserved lead
- 2: Source checked
- 3: Corroborated
- 4: Trusted organization verified
- 5: Legal/institutional record

**SourceType:**
```typescript
"court" | "un" | "government" | "humanitarian" | "ngo" | "academic" | "journalism" | "osint"
```

**DossierType, DossierAudience, LegalTimelineEventType, EvidenceCategory:** See `src/types/content.ts` for the complete lists.

### 7.3 Data File Pattern

Every data file follows this pattern, established across all existing data files:

```typescript
// src/data/{domain}.ts
import type { SomeType } from "../types/content";

export interface DomainRecord {
  id: string;
  // ... fields matching both the TypeScript interface and Zod schema
  contentStatus: ContentStatus;
  sourceIds: string[];
  version: number;
  lastReviewedAt?: string;
  reviewedByRole?: string;
  correctionUrl: string;
}

export const records: DomainRecord[] = [ /* ... */ ];

/** Convenience lookup function. */
export function getRecordById(id: string): DomainRecord | undefined {
  return records.find((r) => r.id === id);
}
```

### 7.4 Future Database Data (Functional MVP)

When the platform transitions to a database-backed architecture:

**S7.4.1** — Row-Level Security on all tables. Users should only see what they have permission to see.

**S7.4.2** — Audit logging on all mutations. Every insert, update, and delete must be logged with timestamp, actor, and old/new values.

**S7.4.3** — Soft deletes preferred over hard deletes. Records should be archived or superseded, not destroyed.

**S7.4.4** — Version all published content. Every update creates a new version record. The current published version is the latest reviewed version.

**S7.4.5** — Public IDs should be UUIDs, not sequential integers. Sequential IDs leak information about record count and ordering.

---

## 8. Documentation Requirements

### 8.1 Per Feature

Every new feature must include documentation covering:

- **Purpose and user need** — what problem does this feature solve, and for whom?
- **Component API (props)** — all props with types, defaults, and descriptions. Use JSDoc format.
- **Data dependencies** — what data files, types, sources, and records does this feature depend on?
- **Accessibility considerations** — keyboard navigation, screen reader behavior, focus management, reduced motion, color contrast.
- **Review gates passed** — which of the review gates in Section 11 have been applied?

Documentation should live as JSDoc comments on the component/hook/function that it describes, plus inline comments for non-obvious logic.

### 8.2 Per Data Type

Every new data type (interface + Zod schema) must include:

- **Field definitions** — each field with type, purpose, and whether it's required or optional.
- **Validation rules** — what Zod schemas enforce, and what additional rules exist in `rules.ts`.
- **Example records** — at least one real or realistic example in the data file.
- **Source requirements** — what constitutes acceptable source support for this type.

Add corresponding validation rules in `src/lib/content-validation/rules.ts` and wire them into the orchestrator in `validate.ts`.

### 8.3 Per Route

Every route must have metadata in `src/data/routeMetadata.ts`:

- **Title** — unique document title appended with " — Accountability Atlas"
- **Description** — 150-160 character meta description
- **Canonical path** — the canonical URL path
- **Open Graph metadata** — title, description, image, type, URL
- **Twitter card** — summary_large_image with title, description, image
- **Robots directive** — defaults to `noindex,nofollow` during static beta
- **Last updated date** — shown at the bottom of the page via `LastUpdated` component
- **Methodology link** — where the methodology or explanation for this page type lives
- **Correction link** — shown at the bottom of every page via `CorrectionLink` component

### 8.4 JSDoc Standards

Use JSDoc for:
- All exported functions and components (purpose, params, returns, example when non-obvious)
- All interfaces and types that are part of the public API
- Complex or non-obvious logic
- Data files (module-level JSDoc describing the file's purpose)

```typescript
/**
 * Resolves the accent colour for a given evidence category.
 *
 * Maps evidence categories to the design system's three accent colours:
 * - court record / human-rights report → clay
 * - official UN document / parliamentary document → blue
 * - all other categories → amber (default)
 */
export function categoryAccent(category: string): "clay" | "blue" | "amber" {
  // ...
}
```

---

## 9. Testing Requirements

### 9.1 Current Phase (Static Beta)

During the static beta, the testing regime is focused on correctness and build integrity:

**S9.1.1** — TypeScript compilation must pass with zero type errors. Run `npm run typecheck` (which executes `tsc -b`) before every commit.

**S9.1.2** — Linting must pass. Run `npm run lint` before every commit.

**S9.1.3** — Build must succeed. Run `npm run build` before every commit.

**S9.1.4** — Content validation must pass for any changed data files. Run `npm run validate:content` to check all validation rules. This is enforced as a build gate.

**S9.1.5** — Manual mobile review on every public-facing change. Test at 375px viewport width (iPhone SE/12/13/14 size) and at tablet (768px) and desktop (1280px+) widths.

**S9.1.6** — Manual accessibility review on every public-facing change. Check keyboard navigation (Tab through all interactive elements), focus visibility, screen reader announcements, and reduced motion.

**S9.1.7** — Visual regression check for key pages: HomePage, countries index, legal tracker, evidence library, methodology, and any page directly affected by the change.

### 9.2 Test Structure

Tests are co-located with the code they test:

```
src/components/{domain}/__tests__/{ComponentName}.test.tsx
src/components/{domain}/__tests__/{utility}.test.ts
src/lib/{module}/__tests__/{module}.test.ts
src/pages/__tests__/{PageName}.test.tsx
```

**S9.2.1** — Component tests use `@testing-library/react` with `render` and `screen` queries.

**S9.2.2** — Prefer `getByRole`, `getByText`, and `getByLabelText` over `getByTestId`.

**S9.2.3** — Test behavior, not implementation. Test what the user sees and interacts with, not internal state.

**S9.2.4** — Test empty states, error states, and edge cases (long text, zero items, missing optional data).

**S9.2.5** — Use `vitest-axe` for accessibility assertions where appropriate.

### 9.3 Test Setup

The test environment (`src/test-setup.ts`) provides:
- `@testing-library/jest-dom/vitest` matchers
- Mock for `i18n/config` (prevents real i18next initialization in jsdom)
- Mock for `react-i18next` that provides English labels without `I18nextProvider`
- Full English status label data in the mock for `t()` lookups

### 9.4 Future Phases

When the platform moves to the functional MVP:

**S9.4.1** — Unit tests for all data transformations (filters, search, relationship resolvers).

**S9.4.2** — Component tests for all critical UI components (evidence cards, legal timeline, filters, search results, action templates).

**S9.4.3** — Integration tests for the review workflow (content status transitions, validation pipeline, correction submission).

**S9.4.4** — Automated accessibility testing with `axe-core` (via `vitest-axe` or `@axe-core/playwright`) in CI.

**S9.4.5** — Performance budgets in CI. See Section 13 for budget values.

---

## 10. Git and Commit Conventions

### 10.1 Branch Naming

| Pattern | Purpose |
|---------|---------|
| `feature/{description}` | New features |
| `fix/{description}` | Bug fixes |
| `docs/{description}` | Documentation only |
| `chore/{description}` | Tooling, dependencies, configuration |

Branch names use kebab-case: `feature/landing-page`, `fix/evidence-filter-crash`.

### 10.2 Commit Messages

Use conventional commits:

```
feat: add evidence filtering by source type and verification level
fix: correct legal timeline event date sorting
docs: update contribution guide with review gate checklist
chore: upgrade framer-motion to v12
refactor: extract filter chip group into shared component
test: add tests for evidence item card empty state
```

**Rules:**
- Limit subject line to 72 characters.
- Use the imperative mood ("add" not "added" or "adds").
- Reference issues where applicable with `#issue-number`.
- Keep commits focused and atomic. A commit should do one thing.
- AI-assisted work: append `AI-assisted: {model} — {description}` to the commit body.

### 10.3 Pull Request Requirements

Every PR must include:

1. **Description** of what the change does and why.
2. **Screenshots** for UI changes (before/after where applicable).
3. **Accessibility checklist** for public-facing changes:
   - [ ] Keyboard navigation tested
   - [ ] Focus states visible
   - [ ] Screen reader tested (at minimum, announcement of key content)
   - [ ] Color contrast verified (4.5:1 text, 3:1 large text)
   - [ ] Reduced motion works
4. **Content/legal review** by at least one other person for:
   - Changes to legal status labels or legal content
   - Changes to country/institution positions
   - Changes to evidence or source records
   - Changes to methodology or trust pages

---

## 11. Review Gates

Every feature or content change must pass applicable gates before merge. Gates are checked at the PR level and documented in the PR description.

### 11.1 Gate Checklist

| Gate | Description | Applicable To |
|------|-------------|---------------|
| **1. Source check** | Every factual claim has a reliable, publicly accessible source attached | All content changes |
| **2. Date check** | Information is current, or clearly dated so the reader knows when it was accurate | All content changes |
| **3. Legal-status check** | Every legal reference uses the controlled vocabulary to distinguish allegation, proceeding, ruling, warrant, finding | Legal content, evidence with legal dimensions |
| **4. Safety check** | No unsafe personal data, location data, or targeting content. No dehumanization | All content, especially images and attributions |
| **5. Language check** | Calm, precise, non-hateful, non-inciting language. No loaded or inflammatory terms | All copy |
| **6. Correction path** | Users can report errors. Every publishable record has a `correctionUrl` | Every page, every record |
| **7. Methodology link** | Relevant methodology or explanation is accessible from the content | Every page type, every data type |
| **8. Version check** | Change date is recorded. Version is incremented | Every data record |

### 11.2 Review Cadence

Content review cadence per record type (configured in `src/lib/content-validation/types.ts`):

| Record Type | Review Cadence |
|-------------|----------------|
| Court records | 6 months |
| Legal cases | 6 months |
| Evidence items | 6 months |
| Organizations | 12 months |
| Action templates | 12 months |
| Dossiers | 12 months |
| Country sections | 6 months |
| Source records | 6 months |
| Attributions | 24 months |

Records exceeding their review cadence trigger `checkStaleReviews` warnings in the validation pipeline.

---

## 12. AI Usage in Development

### 12.1 Permitted AI Uses

AI may assist with:

1. **Code generation** — boilerplate, component scaffolding, test generation, data file creation. All generated code must be reviewed by a human before commit.
2. **Documentation drafts** — JSDoc comments, README sections, methodology explanations. Human must verify accuracy before publication.
3. **Refactoring suggestions** — AI may propose refactoring targets, but the human decides whether to implement.
4. **Translation drafts** — AI may produce translated content, but the translation must be reviewed by a human fluent in the target language.
5. **Content summaries** — AI may summarize source documents for editorial review, but the summary must not be published without human verification.

### 12.2 Prohibited AI Uses

AI must never:

1. Make architectural decisions (database schema, component structure, routing strategy) without human approval.
2. Make content policy decisions (what constitutes acceptable evidence, which sources are authoritative).
3. Make legal judgments or determinations about legal status.
4. Make publication decisions (whether content is ready for public viewing).
5. Generate or modify safety-related code (accessibility, security, content warnings) without explicit human review.

### 12.3 Labeling Requirements

Every AI-assisted operation that produces substantive output must be labeled:

- **In commit messages:** Append to the commit body: `AI-assisted: Claude 4 Sonnet (anthropic) — generated dossier type definitions and schemas`
- **In code comments:** For AI-generated code blocks: `// AI-assisted: {model} — {description}`
- **In documentation:** For AI-drafted content: `> AI-assisted draft. Verified by {human reviewer} on {date}.`
- **In internal systems:** Record the AI tool, model, version, and date for significant work.

### 12.4 AI Agent Architecture

When multiple AI agents are used for a task, the following architecture applies:

**Orchestration:**
- A lead agent decomposes the task, assigns subtasks to specialized agents, and integrates results.
- The lead agent is responsible for maintaining consistency across agent outputs and ensuring the final result meets project standards.

**Specialization:**
- Research agents: explore code patterns, find files, and analyze architecture. They do not write code.
- Implementation agents: write code, create files, and execute scripts. They must not make architectural decisions.
- Review agents: review code for correctness, style, and adherence to this guide. They do not write code.
- Testing agents: write and run tests. They follow patterns established in existing test files.

**Handoff protocol:**
- When handing off between agents, the sending agent must include:
  - The specific task to be completed
  - Relevant context (files, types, patterns to follow)
  - Acceptance criteria (how to verify the work is correct)
  - Any constraints or boundaries (what the receiving agent must not do)
- The receiving agent must confirm understanding before starting work.

**Quality checks before handoff:**
Before an agent passes work to the next agent or declares a task complete:
1. TypeScript compilation passes (`npm run typecheck`)
2. The component/file follows established patterns (check similar existing files)
3. All props have types, required props are documented
4. `className` prop exists for composition
5. Loading/error/empty states are handled where data is involved
6. No `any` types without justification
7. No hard-coded test data in production components
8. No secrets, credentials, or hard-coded URLs

### 12.5 AI-Assisted Content Safety

Content generated or modified by AI must be reviewed with extra scrutiny because AI models can:

- **Hallucinate sources** — invent document titles, URLs, publication dates, or institutions that do not exist. Every source record generated by AI must be manually verified against the actual source document.
- **Over-summarize** — omit critical nuance in legal or procedural descriptions. AI summaries of legal proceedings must be compared against the original source.
- **Introduce subtle bias** — frame information in ways that reflect training data distribution rather than balanced presentation. Review for loaded language, implicit judgments, and framing effects.
- **Mistranslate** — produce fluent-sounding translations that change meaning. AI-translated content must be reviewed by a human fluent in both the source and target languages.

**Safe AI content workflow:**
1. AI produces draft content in a branch or isolated file
2. Human reviews draft against original sources
3. Human labels the review outcome (verified / needs revision / rejected)
4. Only verified content moves to the main branch
5. The AI model and version are recorded in the commit message

**Prohibited AI content categories:**
- AI must never generate legal analysis, legal conclusions, or legal status determinations
- AI must never generate safety-related content (content warnings, safety notes, security policies)
- AI must never generate content that claims to represent the views of real organizations, governments, or individuals
- AI must never generate personal data or personally identifiable information, even in examples

---

## 13. Performance Budgets

### 13.1 Static Beta Budgets

| Metric | Target |
|--------|--------|
| Total page weight (including images) | Under 500KB per page |
| First Contentful Paint (FCP) | Under 1.5s |
| JavaScript bundle per route | Under 150KB (gzipped) |

### 13.2 Functional MVP Budgets (Additional)

| Metric | Target |
|--------|--------|
| API response time (p95) | Under 200ms |
| Lighthouse Performance score | 90+ |
| Lighthouse Accessibility score | 95+ |

### 13.3 Image Rules

- All images must be in WebP format.
- Provide responsive sizes using the `<picture>` element with `<source>` for WebP and fallback `<img>` for JPEG.
- Set explicit `width` and `height` attributes on all images to prevent Cumulative Layout Shift (CLS).
- Use `loading="lazy"` for below-the-fold images and `loading="eager"` for above-the-fold (LCP candidate) images.
- Use `fetchPriority="high"` for the LCP candidate image only.
- The Hero component (`Hgero.tsx`) demonstrates the pattern: `<picture>` wrapper, explicit dimensions, `loading="eager"`, `fetchPriority="high"`.

### 13.4 JavaScript Rules

- Code splitting at the route level via `React.lazy()` — see `src/App.tsx`.
- Manual chunk configuration in `vite.config.ts`:
  - `vendor-react`: React, ReactDOM, React Router
  - `vendor-motion`: framer-motion (isolated so pages without motion don't pay)
  - `vendor-i18n`: i18next, react-i18next
- No third-party scripts (analytics, tracking, marketing) during the static beta.
- No `eval()`, no `document.write()`, no synchronous script loading.
- Tree shaking is enabled by default through Vite's Rollup configuration.

### 13.5 CSS Rules

- Tailwind's JIT compiler purges unused classes automatically.
- No CSS imports in components — only in `src/styles/index.css`.
- No CSS modules or CSS-in-JS that would prevent tree-shaking.
- Print styles are included in `index.css` and should not require separate loading.

---

## 14. Security Checklist

Every deployment must pass this checklist. Security is handled at the infrastructure level during the static beta (no application-level attack surface), but the checklist should be maintained for the transition to the functional MVP.

### 14.1 Deployment Checklist

- [ ] HTTPS enforced at the hosting/reverse-proxy level
- [ ] Content Security Policy (CSP) configured — restrict script-src, connect-src, img-src
- [ ] Security headers set: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] All dependencies scanned for known vulnerabilities (`npm audit` before deploy)
- [ ] No secrets, API keys, or credentials in client code or committed files
- [ ] Minimal third-party scripts — zero during static beta
- [ ] `security.txt` published at `/.well-known/security.txt`
- [ ] `robots.txt` configured to prevent indexing of draft/preview content
- [ ] No user-submitted content rendered without sanitization (future feature)

### 14.2 CSP Configuration

When a CSP is implemented, the following directives should be the starting point:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';  /* Required for Tailwind / inline styles */
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
```

Strict CSP may require adjustment for development tooling (HMR, source maps). The production CSP should be stricter than the development CSP.

### 14.3 Dependency Management

- Run `npm audit` before every deployment.
- Pin major versions in `package.json` (e.g., `"react": "^19.0.0"`) and let the lockfile pin exact versions.
- Review dependency updates for breaking changes before upgrading.
- Keep the dependency tree minimal. Before adding a new dependency, consider:
  - Can this be implemented with built-in browser APIs?
  - Can this be implemented with a few lines of custom code?
  - Is the dependency actively maintained? Does it have a security track record?
  - What is the bundle size impact? (Check with `npm run build -- --report` or similar tools.)

### 14.4 Static Beta Security Posture

The static beta has no user accounts, no forms, no database, no uploads, no API endpoints, and no cookies. This means:

- No CSRF risk
- No XSS from stored user content
- No SQL injection
- No authentication bypass
- No session hijacking

This simplifies the security model dramatically. The only attack surface during the static beta is:
- **Dependency vulnerabilities** — managed via `npm audit` and dependency review
- **XSS from build-time content** — mitigated by React's JSX escaping (content is in static TypeScript files, not user-submitted)
- **CDN/font loading** — mitigated by self-hosting all fonts and assets (no external CDN dependencies)
- **Information disclosure** — mitigated by not including secrets, credentials, or sensitive paths in the codebase

### 14.5 Future Security Architecture (Functional MVP)

When forms, accounts, uploads, and databases are introduced:

- **CRUD endpoints** must use parameterized queries (via ORM or prepared statements). Never construct SQL strings by concatenation.
- **File uploads** must be scanned, validated, limited in size and type, and stored outside the web root. Uploaded files must never be served with user-controlled filenames.
- **User sessions** must use HTTP-only, Secure, SameSite cookies. Session tokens must be cryptographically random and stored hashed.
- **API endpoints** must be rate-limited per IP and per authenticated user. Implement exponential backoff for failed authentication attempts.
- **Row-Level Security** must be enforced at the database level. Every query must be scoped to the authenticated user's permissions.
- **Input validation** must happen server-side. Client-side validation is a UX convenience, not a security control.
- **CORS** must be restricted to known origins. No `Access-Control-Allow-Origin: *` for authenticated endpoints.
- **Audit logging** for all data mutations (create, update, delete, status change) with timestamp, actor ID, and old/new values.
- **API keys** for external integrations must be stored as environment variables, never in the codebase or client code.
- **Security reviews** must be conducted for any feature that accepts user input, processes personal data, or publishes user-generated content.

---

## 15. i18n and Localization

### 15.1 Architecture

The i18n system is configured in `src/i18n/config.ts`:

- **Framework:** i18next + react-i18next
- **Supported locales:** `en` (English, authoritative), `nl` (Dutch), `fr` (French)
- **Language detection:** localStorage → navigator.language → `en` fallback
- **Storage key:** `accountability-atlas-lang`
- **Namespaces:** `common` (buttons, labels), `statusLabels` (content/legal/verification labels), `navigation` (header/footer)
- **No URL-based locale routing** during the static beta (avoids duplicate canonical URLs)

### 15.2 Rules

**S15.2.1** — English is the authoritative source language. All substantive content (legal summaries, evidence, country positions, action templates, organization descriptions) remains English until translated and reviewed. The i18n layer currently handles UI chrome only (nav, labels, buttons, accessibility text).

**S15.2.2** — Missing keys in non-English locales fall back to English. This is configured via `parseMissingKeyHandler` in the i18next config.

**S15.2.3** — New UI strings must be added to all locale files. If a translation is not available, use English as a placeholder and mark the locale as having incomplete coverage.

**S15.2.4** — Translation review is required before publishing content in a non-English locale. Use the `TranslationMetadata` type from `src/types/content.ts` to track translation status.

**S15.2.5** — RTL support (Arabic, Hebrew) is planned for the functional MVP. Do not hard-code left-to-right assumptions in components. Use logical CSS properties (`padding-inline-start`, `margin-inline-end`) where practical for future RTL compatibility.

### 15.3 Locale File Structure

```
src/i18n/locales/{locale}/
├── common.json
├── statusLabels.json
└── navigation.json
```

---

## 16. Accessibility Compliance

### 16.1 Standard

All public-facing content must meet WCAG 2.2 AA as a minimum. The accessibility commitment is published at `/accessibility`.

### 16.2 Requirements

**S16.2.1** — Semantic HTML structure. Use `<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`, `<article>`, `<aside>` elements. Use `aria-labelledby` to associate sections with their headings.

```html
<section aria-labelledby="principles-title">
  <h2 id="principles-title">Safety Principles</h2>
  ...
</section>
```

**S16.2.2** — Logical heading hierarchy. Never skip levels. `h1` → `h2` → `h3` only. The page title is always `h1`. Section headings are `h2`. Sub-sections within sections are `h3`.

**S16.2.3** — Keyboard navigation for all interactive elements. All buttons, links, form elements, and interactive controls must be reachable and operable via keyboard (Tab, Enter, Space, Escape).

**S16.2.4** — Visible focus states. Never remove `outline` or `:focus` styles without providing an alternative visible focus indicator. Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2` as the standard focus ring pattern.

**S16.2.5** — Minimum touch target 44x44px for all interactive elements on touch devices. Use `min-h-[44px]` on buttons and interactive controls.

**S16.2.6** — Sufficient color contrast:
- Text: 4.5:1 minimum contrast ratio against background
- Large text (18px+ bold or 24px+ regular): 3:1 minimum
- UI components and graphical objects: 3:1 minimum

**S16.2.7** — Alt text on all informative images. Decorative images must use `aria-hidden="true"` or `alt=""`. Documentary images (like the Hero background) require substantive alt text describing what the image depicts.

**S16.2.8** — Reduced motion support. Use `useReducedMotion()` from framer-motion to disable animations when the user prefers reduced motion. The global CSS in `index.css` also disables animations at the `prefers-reduced-motion: reduce` media query.

**S16.2.9** — No text embedded only in images. All text must be real HTML text for screen reader access, translation, and zoom.

**S16.2.10** — Skip-to-content link is provided as the first focusable element on every page (rendered by `PageShell`). It must be the first tabbable element.

### 16.3 Common Patterns

**Badge pattern** (from `Badge.tsx`):
- Renders as `<span>` — announcements are handled by the reading order
- Variant colors maintain contrast (e.g., `bg-amber/10` with `text-[#8B6914]`)

**Button pattern** (from `Button.tsx`):
- Discriminated union ensures Link/anchor/button are rendered semantically
- Focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2`
- Minimum height: `min-h-[44px]`

**Reveal pattern** (from `Reveal.tsx`):
- Reduced motion: renders plain `<div>` with no animation
- Uses `useReducedMotion()` hook from framer-motion

**Accent visual element pattern**:
- Decorative accent lines and dots use `aria-hidden="true"` so they are invisible to screen readers
- Example: Card accent bar, timeline dots, section heading divider lines

---

## 17. Print Styles and Media

### 17.1 Print Styles

Print styles are defined in `src/styles/index.css` at `@media print`. Key behaviors:

- **Chrome removal:** `<header>`, `<footer>`, `<nav>`, `<button>`, `.skip-to-content` are hidden.
- **Background reset:** All dark backgrounds (`bg-ink`, hero overlays, gradient backgrounds) are removed. Text colors are reset to `#101828` on white.
- **URL display:** External links show the full URL in parentheses after the link text. Internal links show the platform path.
- **Card/print-aware sections:** Cards have border-radius reduced to 2px. Section margins are reduced. Some overflow-hidden elements are set to `overflow: visible`.
- **Image handling:** Full-bleed background images are hidden. Inline content images are kept.
- **Badge simplification:** Badge backgrounds are removed, leaving clean bordered labels.
- **Typography:** Headings are reduced in size. Body text at 10.5pt. Font families preserved.

### 17.2 Print-Enabling Patterns

To make a component or page printable:

- Use `class` combinations like `print\:hidden` to hide elements in print.
- Add a `.print-footer` div with the correction URL and version info on detail pages.
- Report pages (dossiers, evidence detail, legal case detail) should use the print layout classes: `.dossier-print`, `.evidence-print`, `.legal-print`, etc.

---

## 18. Search Architecture

### 18.1 Design Principles

The search system (`src/lib/search/`) is:

- **Client-side only** — no external service, no API calls, no query logging.
- **Zero personal data** — no user profiling, no search history, no analytics.
- **Deterministic ranking** — simple, understandable scoring. No ML, no fuzzy matching.
- **Accessible** — results are navigable by keyboard, announced by screen readers.

### 18.2 Index

The search index is built from all public platform records. Each record type maps to a `SearchableRecord` via `buildIndex.ts`:

```typescript
interface SearchableRecord {
  id: string;
  type: SearchableRecordType;
  title: string;
  description: string;
  route: string;
  tags: string[];
  publisher?: string;
  category?: string;
  jurisdiction?: string;
  sourceType?: SourceType;
  contentStatus?: ContentStatus;
  sourceQuality?: VerificationLevel;
  legalStatuses?: LegalStatus[];
  language?: string;
  active: boolean;
}
```

### 18.3 Ranking

The search ranking is intentionally simple and auditable:

1. Exact title match: score 100
2. Title starts with query: score 80
3. Title contains all query terms: score 60 + term count
4. Title contains any query term: score 30 + match count
5. Description contains all query terms: score 20 + term count
6. Description contains any query term: score 10 + match count
7. Tags, publisher, category, jurisdiction: score 3-5 per match

**Search rules:**
- Empty query returns no results (never show all records).
- Only `active: true` records are searchable.
- Type filter narrows results to selected record types.
- Results are sorted by score descending.

### 18.4 Cross-Record Relationships

The `relationships.ts` module resolves cross-record references:

- Every record that references another record via `sourceIds`, `legalCaseIds`, `countryOrInstitutionIds`, etc. creates a relationship.
- Relationships are bidirectional: a record that is referenced appears in `referencedBy`; a record that references others appears in `references`.
- The `RelatedRecords` component displays these relationships on detail pages.

When adding a new record type or a new ID-reference field, update `relationships.ts` to include the new relationship path.

---

## 19. Validation Pipeline

### 19.1 Purpose

The content validation pipeline (`src/lib/content-validation/`) implements runtime validation of all static data. It ensures that data files conform to their schemas and project rules before publication.

### 19.2 Execution

Validation is run via `npm run validate:content`, which executes `scripts/validate-content.ts`. This script:

1. Imports all data collections from `src/data/*.ts`
2. Runs all validation rules from `src/lib/content-validation/rules.ts`
3. Generates a `ValidationReport` with errors and warnings
4. Exits with code 1 if any errors are found, 0 otherwise

The pipeline is also run as part of the build process to prevent invalid data from reaching production.

### 19.3 Validation Rules

Currently 25 rules (see `rules.ts` for the complete implementations):

| # | Rule | Scope |
|---|------|-------|
| 1 | Duplicate IDs | All collections |
| 2 | Duplicate slugs | All collections with slugs |
| 3 | Invalid URLs | All collections with URL fields |
| 4 | Invalid/ambiguous dates | All collections with date fields |
| 5 | Missing source references | All collections with `sourceIds` |
| 6 | Empty sourceIds on reviewed records | All collections |
| 7 | Reviewed without lastReviewedAt | All collections |
| 8 | Reviewed without reviewedByRole | All collections |
| 9 | Reviewed without version | All collections |
| 10 | Invalid legal status values | Evidence, legal cases |
| 11 | Verification levels outside 0-5 | Evidence, legal cases |
| 12 | Relationship status > public_resource | Organizations |
| 13 | Action template review completeness | Action templates |
| 14 | Evidence reviewed without source support | Evidence items |
| 15 | Missing correction route | Publishable records |
| 16 | Invalid route targets in relatedRoutes | Records with relatedRoutes |
| 17 | Stale review dates | All collections with review cadence |
| 18 | Source record completeness | Sources |
| 19 | Organization donation URL domain check | Organizations |
| 20 | Organization link-check date presence | Organizations |
| 21 | Evidence item empty sourceIds | Evidence items |
| 22 | Organization empty sourceIds | Organizations |
| 23 | Organization description length | Organizations |
| 24 | Evidence content-status vs source-quality consistency | Evidence items |
| 25 | Organization source status consistency | Organizations |

### 19.4 Adding a New Rule

1. Define the rule function in `src/lib/content-validation/rules.ts`
2. Use the `issue()` helper from `types.ts` to create `ValidationIssue` objects
3. Wire the rule into the orchestrator in `src/lib/content-validation/validate.ts`
4. Add the rule to the table in this document (Section 19.3)

### 19.5 Adding a New Data Type

1. Define the interface in `src/types/content.ts`
2. Create the Zod schema in `src/schemas/index.ts`
3. Create the data file in `src/data/{name}.ts`
4. Add validation rules in `rules.ts` and wire them in `validate.ts`
5. Add to the validation script `scripts/validate-content.ts` if needed
6. Add search indexing in `buildIndex.ts` if the type is publicly searchable
7. Add route metadata in `routeMetadata.ts` if the type has its own route

---

## 20. Appendices

### Appendix A — Code Review Checklist

Before submitting a PR or declaring a feature complete:

- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Content validation passes (`npm run validate:content`)
- [ ] Props interfaces are exported and documented
- [ ] `className` prop exists on all new components
- [ ] Loading, error, and empty states are handled
- [ ] Mobile responsive: tested at 375px, 768px, 1280px
- [ ] Keyboard navigation: all interactive elements reachable and operable
- [ ] Focus states: visible, not removed without replacement
- [ ] Reduced motion: components with animation respect `prefers-reduced-motion`
- [ ] Semantic HTML: sections have `aria-labelledby`, headings follow hierarchy
- [ ] Every new route has metadata in `routeMetadata.ts`
- [ ] Every new data type has Zod schemas and validation rules
- [ ] Decorative elements use `aria-hidden="true"`
- [ ] Images have alt text or `aria-hidden="true"` for decorative-only
- [ ] No hard-coded strings that should be i18n keys
- [ ] No `any` types without justification comments
- [ ] No secrets, credentials, or hard-coded URLs that should be configurable

### Appendix B — Architectural Decision Records

| ADR | Decision | Date |
|-----|----------|------|
| 001 | Vite over Webpack: faster builds, native ESM, simpler config | 2026-04 |
| 002 | Tailwind over CSS modules: single design token source, no naming conventions | 2026-04 |
| 003 | Static data files over CMS during beta: simpler review, versioning, CI | 2026-04 |
| 004 | Client-side search over server-side: no infra, no privacy risk, simpler | 2026-05 |
| 005 | i18next over custom i18n: maintainable, namespace splitting, fallback | 2026-05 |
| 006 | Framer Motion restricted: performance, reduced-motion, scope control | 2026-05 |
| 007 | Zod over custom validation: runtime type safety, composable schemas | 2026-06 |
| 008 | Self-hosted fonts over CDN: privacy, offline, no external requests | 2026-06 |
| 009 | Default exports for pages, named exports for components | 2026-06 |
| 010 | ContentStatus as enum on every record: no record published without status | 2026-06 |

### Appendix C — Key File Locations

| What | Where |
|------|-------|
| App entry | `src/main.tsx` |
| Router + providers | `src/App.tsx` |
| Type definitions | `src/types/content.ts` |
| Zod schemas | `src/schemas/index.ts` |
| Route metadata | `src/data/routeMetadata.ts` |
| Tailwind config | `tailwind.config.js` |
| Vite config | `vite.config.ts` |
| ESLint config | `eslint.config.js` |
| TypeScript config | `tsconfig.app.json`, `tsconfig.json` |
| Global styles + print | `src/styles/index.css` |
| Validation rules | `src/lib/content-validation/rules.ts` |
| Validation orchestrator | `src/lib/content-validation/validate.ts` |
| Search function | `src/lib/search/search.ts` |
| Search index builder | `src/lib/search/buildIndex.ts` |
| i18n config | `src/i18n/config.ts` |
| Test setup + mocks | `src/test-setup.ts` |
| Home page | `src/pages/HomePage.tsx` |
| 404 page | `src/pages/NotFoundPage.tsx` |
| Page shell (header/footer) | `src/components/layout/PageShell.tsx` |
| UI components | `src/components/ui/` |
| Landing components | `src/components/landing/` |
| Page components | `src/components/pages/` |
| Evidence components | `src/components/evidence/` |
| Legal components | `src/components/legal/` |
| Country components | `src/components/countries/` |
| Organization components | `src/components/organizations/` |
| Action components | `src/components/actions/` |
| Search components | `src/components/search/` |

### Appendix D — Component Creation Guide

Follow these steps when creating a new component:

**Step 1: Determine the category**
- Is it a foundational UI element (button, badge, card)? → `src/components/ui/`
- Is it a page-structural element (intro, notice, section)? → `src/components/pages/`
- Is it domain-specific (evidence, legal, country)? → `src/components/{domain}/`
- Is it a page shell or chrome element (header, footer)? → `src/components/layout/`

**Step 2: Create the component file**
```
src/components/{category}/{ComponentName}.tsx
```

**Step 3: Follow the template pattern**
- Export a named function (not default)
- Export the Props interface
- Accept `className?: string` with default `""`
- Use Tailwind classes exclusively
- Use `aria-*` attributes for accessibility

**Step 4: Create the test file**
```
src/components/{category}/__tests__/{ComponentName}.test.tsx
```

Cover at minimum: renders children, applies variant classes, merges className.

**Step 5: Wire into the application**
- If the component is used in a page, import it directly in the page file
- If the component is a new page, add the route to `App.tsx` and metadata to `routeMetadata.ts`

**Step 6: Check for duplication**
Before merging, search the codebase for similar patterns:
- Is there already a component that does this?
- Could an existing component be extended with a prop?
- Is the component too specific to one use case to justify extraction? (If so, keep the code inline.)

### Appendix E — Data File Checklist

Use this checklist when creating or modifying a data file:

- [ ] Interface defined or imported from `src/types/content.ts`
- [ ] Every record has an `id` (kebab-case)
- [ ] Every record has a `slug` if it has a route
- [ ] Every record has `contentStatus` from the controlled vocabulary
- [ ] Every record has `version` (integer, starts at 1)
- [ ] Every record has `sourceIds` (empty array if not yet sourced)
- [ ] Every record has `correctionUrl` if it is publishable
- [ ] Reviewed records have `lastReviewedAt` (ISO 8601 date)
- [ ] Reviewed records have `reviewedByRole` (role, not personal name)
- [ ] No date ranges (use single ISO dates only)
- [ ] All URLs are valid (http or https)
- [ ] Zod schema exists in `src/schemas/index.ts`
- [ ] Validation rules exist in `src/lib/content-validation/rules.ts`
- [ ] Rules are wired into the orchestrator in `src/lib/content-validation/validate.ts`
- [ ] Search indexing added in `src/lib/search/buildIndex.ts` if publicly searchable
- [ ] Route metadata exists in `src/data/routeMetadata.ts` if the type has its own route
- [ ] Convenience lookup functions are exported (e.g., `getRecordById`, `getActiveRecords`)
- [ ] Module-level JSDoc comment describes the file's purpose and limitations

### Appendix F — Migration Guide (Static Data to API)

When the platform transitions from static data files to a database-backed API:

**Phase 1 — API layer:**
1. Create API routes that return JSON matching the existing TypeScript interfaces
2. Create data-access functions in `src/lib/api/` that wrap fetch calls
3. Create React hooks (`useEvidenceItem`, `useLegalCases`, etc.) using these API functions
4. Keep static data files as fallback/seed data

**Phase 2 — Migration:**
1. Update page components to use API hooks instead of direct data imports
2. Add loading states to every page that was previously eagerly loaded
3. Add error handling for API failures (network error, 500, rate limit)
4. Implement caching (React Query or similar) where appropriate

**Phase 3 — Deprecation:**
1. Move static data files to a `src/data/seed/` directory
2. Add a build-time seeding script that populates the database from seed files
3. Remove direct imports of static data from components
4. Verify that all pages work with the API layer

**Interface compatibility requirements:**
- The API response shapes must match the existing TypeScript interfaces exactly
- Only optional fields may be added to existing interfaces
- Field types (dates, enums, numbers) must not change
- New API-only fields should be optional with clear documentation
- The `id` field transitions from static string to UUID but remains a string type

### Appendix G — Glossary

| Term | Definition |
|------|------------|
| **Static beta** | Current phase: no database, no user accounts, no API, all content in static TypeScript files |
| **ContentStatus** | Editorial status of a record: draft, static_preview, review_pending, reviewed, disputed, corrected, archived |
| **VerificationLevel** | Source reliability level (0-5): Unreviewed lead → Legal/institutional record |
| **LegalStatus** | Procedural status of a legal matter: distinguishes allegations from findings |
| **SourceRecord** | A publicly accessible document referenced as support for a factual claim |
| **Dossier** | A structured, source-linked evidence brief assembled from platform records |
| **Review gate** | A specific check that content must pass before publication |
| **Correction route** | The URL/path where users can report errors in a record |
| **Canonical URL** | The authoritative URL for a page, used for SEO and deduplication |
| **Lazy loading** | Route-level code splitting via `React.lazy()` — pages are loaded on demand |

---

*This document is maintained as the single source of truth for implementation practices. It should be updated when standards evolve, new patterns emerge, or gaps are identified. All updates must go through the PR process with appropriate review.*
