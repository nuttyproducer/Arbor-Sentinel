# Beta User Guide

**Status:** Active — M7-05 beta onboarding
**Last reviewed:** 2026-08-04

---

## Overview

Arbor Sentinel is an open-source platform for organizing verified public
evidence, tracking legal and political responsibility, and helping people take
lawful action. During the beta, the platform is a static preview: content is
hand-authored and reviewed, and automated generation is planned for later phases.

This guide is written for beta users who have been granted access to the
onboarding and feedback routes.

## Access

Beta routes require an authenticated account:

| Route | Purpose |
|---|---|
| `/beta/welcome` | Post-login welcome page with onboarding links |
| `/beta/quick-start` | Quick start guide |
| `/beta/feedback` | Feedback submission form |
| `/beta/bug-report` | Bug report submission form |

Unauthenticated visitors are redirected to the admin login. Feedback and bug
report forms require authentication so submissions can be traced to a known user
and spam is prevented server-side.

## Key features

- **Gaza Dossier** — a structured evidence brief on the regional crisis.
- **Legal Tracker** — court proceedings, investigations, warrants, UN findings,
  and procedural milestones with consistent legal status labels.
- **Country & institution accountability pages** — with clear competency
  boundaries and no scores or rankings.
- **Organization directory** — humanitarian, legal, documentation, medical,
  research, and press-freedom groups.
- **Action Hub** — lawful action templates you can send to representatives.
- **Evidence, sources, and dossiers libraries** — browse verified public records.
- **Interactive map and knowledge-graph explorer.**

## Finding content

Use the search bar to search across sources, evidence, legal cases,
organizations, actions, countries, institutions, dossiers, and trust pages.
Search is client-side — queries are not logged or stored. Browse from the top
navigation, or explore the interactive map and knowledge graph.

## Using action templates

1. Open the Action Hub (`/take-action`) and choose a template.
2. Read the template and its policy ask carefully.
3. Personalize the template with your own details where prompted.
4. Check the audience and jurisdiction — templates are written for specific
   recipients.

Templates are manual copy during the beta; automated generation is planned for a
later phase.

## Submitting corrections

Corrections are part of the trust model. If information is inaccurate, outdated,
unsafe, mistranslated, or missing context, submit a correction:

- Include the specific page or section, a description of the issue, a suggested
  correction, and a supporting source.
- During the beta, submit corrections through the public GitHub issue tracker
  (see the Corrections page at `/corrections`).
- Never include sensitive witness information or private personal data.

## Reporting bugs

Use the beta bug report form (`/beta/bug-report`):

- Describe what you did, what you expected, and what actually happened.
- Include the steps to reproduce (browser and device details are captured
  automatically).
- Set a realistic severity: critical, major, minor, or cosmetic.

## Giving feedback

Use the beta feedback form (`/beta/feedback`):

- Rate your overall experience 1–5.
- Choose a category: content, UI, performance, feature request, or missing
  content.
- Add free text. Be specific — page context is recorded automatically.
- A screenshot field is shown but files are not uploaded during the beta;
  describe the issue in text instead.

## Support

During the beta, support is handled through the project's public channels. Bug
reports and feedback submitted through the beta forms reach the maintenance team
directly. See `docs/beta-feedback-process.md` for the full process.

## Privacy

Feedback and bug reports do not collect personal data beyond your account.
User-journey analytics, where enabled, are aggregate-only and opt-in — they never
contain user identifiers. See the Privacy page (`/privacy`).
