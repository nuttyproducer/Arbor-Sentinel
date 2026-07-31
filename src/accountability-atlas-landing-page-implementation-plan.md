# Accountability Atlas — Landing Page Implementation Plan

**Branch:** `feature/landing-page`  
**Sprint:** 1  
**Goal:** Build the first public-facing credibility landing page for Accountability Atlas.  
**Stack:** Vite + React + TypeScript + Tailwind CSS  
**Deployment target:** Netlify or Vercel, static build first  
**Status:** Ready to implement

---

## 1. Sprint Goal

Create a clean, credible, responsive landing page that explains:

- what Accountability Atlas is;
- what it is not;
- why it exists;
- how it will be built safely;
- who can contribute;
- where contributors should go next.

The first build should feel like a serious civic-tech / human-rights documentation project, not a rage campaign, news site, petition page, or charity landing page.

The landing page should help answer:

> “Is this project serious, safe, structured, and worth contributing to?”

---

## 2. Strict Sprint Scope

### In scope

Build:

- Vite React TypeScript app
- Tailwind CSS setup
- responsive landing page
- brand colors and typography
- header/navigation
- hero section
- project status notice
- mission section
- feature/module cards
- safety principles section
- “what this project will not do” section
- MVP roadmap preview
- contributor CTA section
- footer with license/safety links
- placeholder `/methodology`
- placeholder `/contribute`
- Netlify/Vercel-ready build

### Out of scope

Do **not** build yet:

- database
- authentication
- admin panel
- witness submission form
- evidence upload form
- live map
- incident database
- donation flow
- partner portal
- email automation
- AI translation
- public action tracking
- sensitive data collection
- real organization partnership claims

---

## 3. Recommended Repository Structure

Your repo should keep documentation and source code clearly separated.

```txt
accountability-atlas/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   ├── good_first_issue.md
│   │   ├── research_task.md
│   │   ├── source_correction.md
│   │   └── config.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── LICENSES/
│   ├── AGPL-3.0-or-later.txt
│   └── CC-BY-SA-4.0.txt
│
├── docs/
│   ├── methodology.md
│   ├── source-policy.md
│   ├── legal-language-policy.md
│   ├── ethics-and-safety.md
│   ├── anti-doxing-policy.md
│   ├── outreach-plan.md
│   └── ...
│
├── public/
│   ├── favicon.svg
│   ├── social-preview.svg
│   └── robots.txt
│
├── src/
│   ├── assets/
│   │   ├── logo-mark.svg
│   │   └── pattern-grid.svg
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageShell.tsx
│   │   │
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── StatusNotice.tsx
│   │   │   ├── MissionSection.tsx
│   │   │   ├── ModuleGrid.tsx
│   │   │   ├── SafetyPrinciples.tsx
│   │   │   ├── NotThisProject.tsx
│   │   │   ├── RoadmapPreview.tsx
│   │   │   └── ContributorCTA.tsx
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Container.tsx
│   │       └── SectionHeading.tsx
│   │
│   ├── data/
│   │   ├── modules.ts
│   │   ├── principles.ts
│   │   ├── roadmap.ts
│   │   └── navigation.ts
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MethodologyPage.tsx
│   │   └── ContributePage.tsx
│   │
│   ├── styles/
│   │   └── index.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── LICENSE.md
├── NOTICE.md
├── PRD-v2.md
├── README.md
├── ROADMAP-v2.md
├── SECURITY.md
│
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 4. Where to Put Assets

Use this rule:

### `public/`

Use for files that should be served directly by URL and do not need importing into React.

Examples:

```txt
public/favicon.svg
public/social-preview.svg
public/robots.txt
```

Use when you want URLs like:

```txt
/favicon.svg
/social-preview.svg
/robots.txt
```

### `src/assets/`

Use for assets imported into components.

Examples:

```txt
src/assets/logo-mark.svg
src/assets/pattern-grid.svg
```

Use when you want:

```tsx
import logoMark from "../assets/logo-mark.svg";
```

### For this sprint

Use only:

```txt
public/favicon.svg
public/social-preview.svg
src/assets/logo-mark.svg
src/assets/pattern-grid.svg
```

No heavy images yet. No graphic violence. No political flag war aesthetic.

---

## 6. Install Vite + React + TypeScript in Existing Repo

Because the repository already exists, scaffold carefully.

From the repo root:

```bash
npm create vite@latest . -- --template react-ts
```

If Vite warns that the directory is not empty, choose the option that lets you continue only if you are sure it will not overwrite important docs. If unsure, scaffold in a temporary folder and copy the generated app files manually.

Safer alternative:

```bash
npm create vite@latest accountability-atlas-web -- --template react-ts
```

Then copy these into the repo root:

```txt
index.html
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
src/
```

Then install dependencies:

```bash
npm install
```

---

## 7. Add Tailwind CSS

Install Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        charcoal: "#1F2937",
        paper: "#F7F1E8",
        bone: "#FAFAF7",
        clay: "#B95C50",
        amber: "#D99A2B",
        trust: "#3B6EA8",
        border: "#D8D6D0",
      },
      fontFamily: {
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
```

Update `src/styles/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #101828;
  background: #f7f1e8;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at top left, rgba(217, 154, 43, 0.12), transparent 34rem),
    linear-gradient(180deg, #f7f1e8 0%, #fafaf7 58%, #f7f1e8 100%);
  font-family: Inter, system-ui, sans-serif;
}

::selection {
  background: rgba(185, 92, 80, 0.24);
}
```

Import it in `src/main.tsx`:

```tsx
import "./styles/index.css";
```

---

## 8. Brand Tokens for the Landing Page

Use these in Tailwind and design decisions:

```txt
Deep Ink Navy: #101828
Soft Charcoal: #1F2937
Warm Paper: #F7F1E8
Bone White: #FAFAF7
Muted Clay Red: #B95C50
Signal Amber: #D99A2B
Trust Blue: #3B6EA8
Quiet Border Grey: #D8D6D0
```

Tone:

```txt
calm
credible
human
institutional
evidence-led
nonviolent
lawful
protective
```

Avoid:

```txt
rage campaign visuals
blood-red dominant palette
military aesthetics
gore
anonymous hacker style
shock content
overanimated hero
```

---

## 9. Initial Routes

Use simple state-based routing first, or install React Router if you prefer.

Recommended:

```bash
npm install react-router-dom
```

Routes:

```txt
/             HomePage
/methodology  MethodologyPage placeholder
/contribute   ContributePage placeholder
```

`src/App.tsx`:

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { ContributePage } from "./pages/ContributePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/contribute" element={<ContributePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

For Netlify, later add `public/_redirects`:

```txt
/* /index.html 200
```

---

## 10. Landing Page Section Order

Build the homepage in this order:

```txt
1. Header
2. Hero
3. StatusNotice
4. MissionSection
5. ModuleGrid
6. SafetyPrinciples
7. NotThisProject
8. RoadmapPreview
9. ContributorCTA
10. Footer
```

---

## 11. Homepage Copy

### Hero

```txt
Accountability Atlas

Evidence for protection.
Action for accountability.

An open civic-technology project for verified atrocity documentation, humanitarian accountability, legal and policy tracking, and lawful public action.
```

Primary CTA:

```txt
Read the Methodology
```

Secondary CTA:

```txt
Contribute on GitHub
```

Status line:

```txt
Early-stage open-source initiative. Not yet a registered NGO, charity, legal entity, or formal partner of any listed organization.
```

### What it is

```txt
Accountability Atlas is being built as calm public-interest infrastructure for people who need evidence to be organized, sourced, contextualized, and connected to lawful action.
```

### What it is not

```txt
This is not a rage platform, a doxing project, a donation intermediary, a replacement for humanitarian organizations, or a legal authority.
```

### Contributor CTA

```txt
Help build the foundation.

We are looking for careful contributors: developers, designers, researchers, legal and human-rights reviewers, security reviewers, writers, translators, and civic-tech contributors.
```

---

## 12. Data Files

Use simple data files so content is easy to edit.

### `src/data/modules.ts`

```ts
export const modules = [
  {
    title: "Evidence Library",
    description:
      "Organize public-interest sources, reports, legal records, and documentation with clear source labels.",
  },
  {
    title: "Legal Tracker",
    description:
      "Track public court processes, institutional findings, and legal accountability mechanisms.",
  },
  {
    title: "Country Accountability",
    description:
      "Show what governments and institutions say, do, vote for, fund, block, or fail to do.",
  },
  {
    title: "Organization Directory",
    description:
      "List humanitarian, legal, documentation, research, and civic organizations without implying partnership.",
  },
  {
    title: "Action Hub",
    description:
      "Provide lawful templates and routes for citizens to contact representatives and act responsibly.",
  },
  {
    title: "Policy Dossiers",
    description:
      "Turn source-cited information into concise briefings for citizens, journalists, and policymakers.",
  },
];
```

### `src/data/principles.ts`

```ts
export const principles = [
  "Accuracy before speed",
  "Protection before publication",
  "Evidence before opinion",
  "Consent before exposure",
  "Accountability without dehumanization",
  "Lawful action only",
  "No doxing",
  "No sensitive uploads before secure review",
];
```

### `src/data/roadmap.ts`

```ts
export const roadmap = [
  {
    phase: "Phase 1",
    title: "Credibility Landing Page",
    description:
      "Create a public landing page, methodology placeholder, contribute page, and safe project framing.",
  },
  {
    phase: "Phase 2",
    title: "Methodology and Country Pages",
    description:
      "Publish the first source methodology, Belgium page, EU page, legal tracker structure, and organization directory.",
  },
  {
    phase: "Phase 3",
    title: "Static Evidence Dossiers",
    description:
      "Add source-cited public dossiers and downloadable briefing formats.",
  },
  {
    phase: "Phase 4",
    title: "Reviewed Dynamic Features",
    description:
      "Only after review: maps, search, secure workflows, and structured data.",
  },
];
```

---

## 13. Component Responsibilities

### `Header.tsx`

Should include:

- logo/wordmark
- nav links
- GitHub CTA

Links:

```txt
Methodology
Contribute
GitHub
```

### `Hero.tsx`

Should include:

- project name
- tagline
- description
- two CTAs
- non-NGO status line
- subtle visual block, not heavy illustration

### `StatusNotice.tsx`

Should clearly state:

```txt
This project is early-stage and not yet a registered NGO, charity, legal entity, or formal partner of any listed organization.
```

### `MissionSection.tsx`

Should explain the core project purpose in plain language.

### `ModuleGrid.tsx`

Should map over `modules`.

### `SafetyPrinciples.tsx`

Should map over `principles`.

### `NotThisProject.tsx`

Should list what the platform will not do.

### `RoadmapPreview.tsx`

Should map over `roadmap`.

### `ContributorCTA.tsx`

Should invite contributors and link to GitHub issues or `/contribute`.

### `Footer.tsx`

Should include:

- license summary
- safety statement
- repo links
- no legal advice note

---

## 14. UI Components

Create reusable primitives:

### `Button.tsx`

Variants:

```txt
primary
secondary
ghost
```

### `Card.tsx`

Use for modules, principles, roadmap items.

### `Badge.tsx`

Use for labels like:

```txt
Early-stage
Open-source
No doxing
Lawful action only
```

### `Container.tsx`

Standard width wrapper:

```txt
max-w-7xl mx-auto px-6 lg:px-8
```

### `SectionHeading.tsx`

Props:

```ts
eyebrow?: string;
title: string;
description?: string;
```

---

## 15. Accessibility Requirements

Minimum requirements:

- semantic HTML
- one `h1`
- logical heading order
- keyboard-focusable links/buttons
- visible focus states
- good color contrast
- no text embedded in images
- alt text for meaningful images
- decorative SVGs marked `aria-hidden`
- mobile readable without horizontal scroll

Test:

```bash
npm run build
```

Manual checks:

```txt
Tab through the page
Test mobile width
Check all links
Check headings
Check contrast visually
```

---

## 16. SEO / Metadata

Update `index.html`:

```html
<title>Accountability Atlas — Evidence for protection. Action for accountability.</title>
<meta
  name="description"
  content="An open civic-technology project for verified atrocity documentation, humanitarian accountability, legal and policy tracking, and lawful public action."
/>
<meta property="og:title" content="Accountability Atlas" />
<meta
  property="og:description"
  content="Evidence for protection. Action for accountability."
/>
<meta property="og:type" content="website" />
<meta property="og:image" content="/social-preview.svg" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 17. Build Commands

Expected scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 18. Deployment

### Netlify

Build command:

```txt
npm run build
```

Publish directory:

```txt
dist
```

Add `public/_redirects`:

```txt
/* /index.html 200
```

### Vercel

Framework preset:

```txt
Vite
```

Build command:

```txt
npm run build
```

Output directory:

```txt
dist
```

---

Labels:

```txt
frontend
design
good first issue
priority-high
documentation
accessibility
```

---

## 20. Acceptance Criteria

The PR can be merged when:

- app runs locally with `npm run dev`
- build passes with `npm run build`
- landing page is responsive
- `/methodology` route exists
- `/contribute` route exists
- no sensitive submission forms exist
- no false partnership claims exist
- footer includes safety/license notes
- README remains intact
- no major accessibility issues
- no console errors
- PR description explains what was added

---

## 21. Recommended Commit Plan

Use small commits:

```bash
git commit -m "Scaffold Vite React app"
git commit -m "Add Tailwind theme tokens"
git commit -m "Create landing page layout components"
git commit -m "Add landing page content sections"
git commit -m "Add methodology and contribute placeholders"
git commit -m "Add responsive and accessibility polish"
```

---

## 22. First PR Description Template

```md
## Summary

Adds the first static landing page foundation for Accountability Atlas.

## Included

- Vite React TypeScript setup
- Tailwind CSS setup
- landing page sections
- placeholder methodology route
- placeholder contribute route
- safety/status notices
- contributor CTA
- SEO metadata

## Out of scope

- database
- authentication
- witness submissions
- evidence uploads
- live maps
- donation flows
- partner dashboards

## Safety notes

This PR does not collect sensitive data, does not claim partnerships, and does not include witness submission flows.

## Checklist

- [ ] Runs locally with `npm run dev`
- [ ] Builds with `npm run build`
- [ ] Mobile responsive
- [ ] No sensitive data collection
- [ ] No false partnership claims
- [ ] Footer includes license/safety notes
```

---

## 23. Suggested Next Sprint After Landing Page

After this landing page is live:

### Sprint 2: Methodology and Contribute Pages

Build:

- real `/methodology` page
- real `/contribute` page
- contributor role cards
- GitHub issue links
- source-verification model
- correction policy link
- safe contact guidance

### Sprint 3: First Public Content Pages

Build:

- `/legal-tracker`
- `/countries/belgium`
- `/countries/eu`
- `/organizations`

Still static. Still no database.

---

## 24. Final Implementation Rule

Build the first version like a public institution, not like a startup chasing hype.

The landing page must communicate:

```txt
This is serious.
This is safe.
This is structured.
This is open to contributors.
This is not reckless.
```

The goal is not maximum attention.

The goal is maximum trust.
