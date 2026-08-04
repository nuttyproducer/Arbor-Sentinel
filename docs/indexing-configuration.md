# Indexing Configuration

**Status:** Public launch preparation — indexing enabled for public content (M7-06).  
**Last reviewed:** 2026-08-04

## Current state

Search-engine indexing is **enabled for public content routes** and disabled
for admin, beta, and error routes. Enforced in three places:

| Layer | Location | Setting |
|---|---|---|
| `robots.txt` | `public/robots.txt` | `Allow: /` (with `Disallow: /admin/`, `Disallow: /beta/`) |
| Default directive | `src/data/routeMetadata.ts` → `DEFAULT_ROBOTS` | `"index,follow"` |
| Per-route override | `src/data/routeMetadata.ts` → per-route `robots` field | Admin, beta, and 404 routes set `"noindex,nofollow"` |
| Static fallback | `index.html` | `<meta name="robots" content="index,follow">` |

The `<meta name="robots">` tag is managed by `src/components/ui/DocumentHead.tsx`
and updates on every client-side navigation. Public routes inherit
`DEFAULT_ROBOTS`; admin, beta, and error routes pass an explicit
`noindex,nofollow` override.

## How to verify indexing after deployment

1. Check `https://[domain]/robots.txt` returns `Allow: /` (and the admin/beta disallows).
2. Open page source on a public route — `<meta name="robots" content="index,follow">`.
3. Open an admin or beta route — `<meta name="robots" content="noindex,nofollow">`.
4. Canonical URLs use the production domain. Set it at runtime by calling:

```ts
import { setCanonicalBase } from "./data/routeMetadata";
setCanonicalBase("https://arborsentinel.org");
```

   Without this call, canonical URLs fall back to `window.location.origin`,
   which is correct for preview deployments but should be pinned for production.
   Add this to the launch checklist (`docs/launch-checklist.md` §7).

5. Open Graph and Twitter card metadata render correctly (test with
   [opie.link](https://opie.link) or the target platform's sharing debugger).
   The OG image is now the PNG (`/social-preview.png`).

## How to revert to noindex (e.g., pre-launch preview or emergency)

1. In `src/data/routeMetadata.ts`, change `DEFAULT_ROBOTS` back to `"noindex,nofollow"`.
2. In `public/robots.txt`, change `Allow: /` back to `Disallow: /`.
3. In `index.html`, change the static robots meta back to `content="noindex,nofollow"`.
4. See `docs/incident-response-plan.md` (content error class) for when this is
   appropriate.

## Per-route robots override

Individual routes can override the default robots directive by setting
`robots` in their route metadata entry:

```ts
"/404": {
  // …
  robots: "noindex,nofollow",  // always noindex for error pages
},
```

The 404 page always uses `noindex,nofollow` regardless of the default. Admin
(`/admin/*`), beta (`/beta/*`), and 404 routes carry explicit overrides.

## Social preview image

The Open Graph image is `/social-preview.png` (in `public/`), a 1,200 × 630 px
PNG generated from `public/social-preview.svg`. The PNG is the supported
format for Facebook, Twitter/X, LinkedIn, Discord, and Telegram. The SVG
source is kept as the editable master. Regenerate with:

```bash
npm install --no-save sharp
node scripts/generate-images.mjs
```

## Related

- `docs/launch-checklist.md` — §7 indexing/SEO gate
- `src/data/routeMetadata.ts` — `DEFAULT_ROBOTS`, `DEFAULT_OG_IMAGE`
- `public/robots.txt` — crawl rules
