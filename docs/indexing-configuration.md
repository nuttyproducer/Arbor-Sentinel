# Indexing Configuration

**Status:** Public Static Beta — indexing is disabled by default.  
**Last reviewed:** 2026-07-12

## Current state

During the public static beta, search-engine indexing is turned off across
every route. This is enforced in two places:

| Layer | Location | Setting |
|---|---|---|
| `robots.txt` | `public/robots.txt` | `Disallow: /` |
| `<meta>` tag | `src/data/routeMetadata.ts` → `DEFAULT_ROBOTS` | `"noindex,nofollow"` |
| Per-route override | `src/data/routeMetadata.ts` → per-route `robots` field | Inherits `DEFAULT_ROBOTS` |

The `<meta name="robots">` tag is managed by `src/components/ui/DocumentHead.tsx`
and updates on every client-side navigation. Every route gets a robots directive.

## How to enable indexing for production

When the platform is ready for public indexing (Public Static Beta v0.1 or
later), make these three changes:

### 1. Update `robots.txt`

In `public/robots.txt`, change:

```
Disallow: /
```

to:

```
Allow: /
```

### 2. Update the default robots directive

In `src/data/routeMetadata.ts`, change:

```ts
export const DEFAULT_ROBOTS = "noindex,nofollow";
```

to:

```ts
export const DEFAULT_ROBOTS = "index,follow";
```

### 3. Set the canonical base URL

In your application entry point or a bootstrap module, call:

```ts
import { setCanonicalBase } from "./data/routeMetadata";
setCanonicalBase("https://accountabilityatlas.org");
```

Without this call, the canonical base falls back to `window.location.origin`,
which is correct for preview deployments but should be pinned for production.

### 4. Verify

After deployment, check:

- `https://[domain]/robots.txt` returns `Allow: /`
- Page source on any route shows `<meta name="robots" content="index,follow">`
- Canonical URLs use the production domain
- Open Graph and Twitter card metadata render correctly (test with
  [opie.link](https://opie.link) or similar OG debugger)

## Per-route robots override

Individual routes can override the default robots directive by setting
`robots` in their route metadata entry:

```ts
"/404": {
  // …
  robots: "noindex,nofollow",  // always noindex for error pages
},
```

The 404 page always uses `noindex,nofollow` regardless of the default.

## Social preview image

### Current state

The Open Graph image is `/social-preview.svg` (in `public/`). This is a
1,200 × 630 px SVG designed for the brand visual identity.

### Known limitation

SVG is not reliably supported as an OG image by all platforms:

| Platform | SVG support |
|---|---|
| Facebook | Limited — may not render |
| Twitter / X | Not supported — falls back to no image |
| LinkedIn | Not supported |
| Discord | Supported |
| Telegram | Supported |

### Recommended action before public launch

Generate a PNG or JPEG version at 1,200 × 630 px from the SVG source
(`public/social-preview.svg`). Then:

1. Save as `public/social-preview.png`
2. Update `DEFAULT_OG_IMAGE` in `src/data/routeMetadata.ts`:

```ts
const DEFAULT_OG_IMAGE = "/social-preview.png";
```

3. Test with [opie.link](https://opie.link) or the target platform's sharing
   debugger before launch.

The SVG can be kept as a fallback or removed once the PNG is in place.
