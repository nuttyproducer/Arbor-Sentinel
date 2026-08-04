# Static Beta Security Checklist

**Status:** Active — reviewed 2026-07-12  
**Applies to:** Public Static Beta (pre-MVP)

This checklist documents the security controls in place during the public
static beta, what remains to be configured, and what to verify before any
public launch.

---

## Deployment controls

| Control | Status | Notes |
|---|---|---|
| `_headers` file | ✅ Configured | CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| CSP `<meta>` fallback in `index.html` | ✅ Configured | Same policy as `_headers` — covers hosts that don't support `_headers` |
| `robots.txt` | ✅ `Disallow: /` | Prevents indexing during beta |
| `_redirects` | ✅ SPA fallback | `/* /index.html 200` |
| HSTS preload | ⬜ Optional | Submit to hstspreload.org when domain is stable |

## Headers (applied via `_headers`)

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

### CSP notes

- `style-src 'unsafe-inline'` is required for Tailwind CSS utility classes,
  Framer Motion animation styles, and React component inline styles.
  Without it, the design system breaks. Script-src does NOT use
  `unsafe-inline` — all JavaScript is bundled by Vite.
- `frame-ancestors 'none'` prevents any site from embedding this platform
  in an iframe.
- `connect-src 'self'` — no external API calls are made during the static
  beta. If a backend is added later, update this directive.
- `img-src 'self' data:` — all images are self-hosted. `data:` allows
  the SVG favicon and any inline data URIs.

### Verification

After deployment, verify headers with:
```bash
curl -I https://[domain] | grep -E 'content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy'
```

Or use [securityheaders.com](https://securityheaders.com).

## Third-party requests

**During static beta: zero external browser requests.**

| Request type | Source | Status |
|---|---|---|
| Fonts | `@fontsource` (self-hosted) | No external request |
| Analytics | None configured | No external request |
| Scripts | Vite bundle (self-hosted) | No external request |
| Images | `src/assets/` (self-hosted) | No external request |
| Embeds | None used | No external request |

External links (`rel="noopener noreferrer"`) navigate the user away from
the platform — they do not load content into the page.

## Vulnerability reporting

| Channel | Status |
|---|---|
| `security.txt` (`/.well-known/security.txt`) | ✅ Published |
| GitHub private vulnerability reporting | ⬜ Enable in repo Settings |
| Security email (`security@[domain]`) | ⬜ Not yet configured |
| PGP key | ⬜ Not yet published |

### Incident response owner

**During the static beta:** the repository maintainer (`nuttyproducer`) is
the incident response owner. Once a security email is configured, update
`security.txt` and `SECURITY.md`.

### Incident response procedure (draft)

1. Acknowledge receipt within 72 hours.
2. Assess severity and scope. Determine whether the issue is exploitable in
   the current static beta deployment.
3. If user data is at risk (unlikely during static beta — no data is
   collected), contain first.
4. Develop and test a fix on a private branch.
5. Deploy the fix.
6. Publish an advisory through GitHub Security Advisories.
7. Update `SECURITY.md` and this checklist with lessons learned.

## Rollback

During the static beta, rollback is a `git revert` + redeploy:

1. Identify the problematic commit.
2. `git revert <commit>` on a new branch.
3. PR + CI (typecheck → lint → test → build).
4. Merge to `main` and redeploy.

If the deployment platform supports instant rollback (Netlify, Cloudflare
Pages), use that as the first response while preparing the revert.

## Dependency and secret scanning

| Tool | Status |
|---|---|
| Dependabot (npm) | ✅ Weekly — `.github/dependabot.yml` |
| Dependabot (GitHub Actions) | ✅ Monthly |
| Secret scanning | ⬜ Enable in repo Settings → Code security |
| Push protection | ⬜ Recommended — blocks secrets before commit |
| `npm audit` | Run manually or add to CI |

## Branch protection (recommended)

Enable in GitHub repository Settings → Branches → Add rule for `main`:

- [ ] Require a pull request before merging
- [ ] Require approvals (at least 1)
- [ ] Require status checks to pass before merging
  - TypeScript typecheck
  - ESLint
  - Vitest
  - Vite build
- [ ] Require conversation resolution before merging
- [ ] Do not allow bypassing the above settings

## Maintainer 2FA (recommended)

Enforce in GitHub organization Settings → Authentication security:

- [ ] Require two-factor authentication for all members

## Pre-launch verification

Before any public launch beyond the static beta:

- [ ] CSP verified on deployed domain (no block violations in browser console)
- [ ] HSTS header present and `max-age` ≥ 1 year
- [ ] `security.txt` accessible at `/.well-known/security.txt`
- [ ] `robots.txt` updated to `Allow: /` (if indexing is desired)
- [ ] Fonts load without external requests (check Network tab — zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`)
- [ ] Branch protection enabled on `main`
- [ ] 2FA enforced for all collaborators
- [ ] Secret scanning enabled with push protection
- [ ] Private vulnerability reporting enabled
- [ ] Security email configured and listed in `security.txt` and `SECURITY.md`
- [ ] PGP key published (if email is the primary contact)
- [ ] Incident response owner identified and documented
- [ ] `docs/indexing-configuration.md` steps completed (if indexing is desired)
- [ ] Social preview PNG generated (see `docs/indexing-configuration.md`)

## Known limitations (static beta)

- The site is a static SPA. No server-side rendering. The CSP meta tag
  provides fallback protection but is less robust than HTTP headers.
- The `_headers` file is only honoured by certain hosts (Netlify, Cloudflare
  Pages). For other hosts, configure headers in the platform dashboard or
  web server config.
- No Web Application Firewall (WAF) is configured at the project level.
  Rely on the deployment platform's DDoS and WAF defaults.
- No Content Integrity validation beyond npm lockfile and `npm ci` in CI.
- No subresource integrity (SRI) hashes on bundled assets (Vite does not
  currently generate them by default).
- No security.txt signing key — signing is optional (RFC 9116 §4) and can
  be added when a PGP key is published.
