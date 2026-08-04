# Security Policy

Accountability Atlas is a safety-sensitive civic-technology project. Security issues may affect users, contributors, researchers, journalists, humanitarian workers, or people living under dangerous conditions.

Do not disclose vulnerabilities publicly.

---

## Supported versions

The project is currently pre-MVP. Security support applies to:

- the default branch;
- active release branches once created;
- production deployment once live.

Older experimental branches may not receive security updates.

---

## Reporting a vulnerability

**During the public static beta**, use GitHub's private vulnerability reporting:

1. Go to the repository's Security tab.
2. Click **"Report a vulnerability"**.
3. Describe the issue. Do not publish it in a public issue.

If private vulnerability reporting is not enabled on the repository yet,
open a public issue stating only that you have a security concern and
request that the maintainer enable private reporting or contact you
through an alternative channel. Do not include vulnerability details in
the public issue.

A dedicated security email is not yet configured. Once available, this
file will be updated with:

```text
Security contact: security@[domain]
PGP key: [link]
Response target: 72 hours
```

A good report includes:

- affected component;
- vulnerability type;
- reproduction steps;
- potential impact;
- screenshots or proof-of-concept if safe;
- suggested fix if known.

---

## What counts as security-sensitive

Report privately if the issue involves:

- authentication or authorization bypass;
- admin/moderator access;
- data exposure;
- private contact leakage;
- witness/source safety;
- file upload handling;
- metadata stripping failure;
- analytics/privacy leakage;
- cross-site scripting;
- server-side request forgery;
- SQL injection;
- API key exposure;
- insecure storage;
- denial-of-service weaknesses;
- supply-chain compromise;
- unsafe dependencies;
- third-party embeds that leak sensitive context.

---

## Public issues are acceptable for

Public GitHub issues may be used for:

- documentation typos;
- UI bugs;
- broken links;
- accessibility issues;
- non-sensitive build problems;
- generic feature requests.

Do not include secrets, tokens, raw logs with personal data, private emails, or sensitive source material.

---

## Security principles

The project follows these principles:

1. Minimize data collection.
2. Do not collect sensitive witness data before expert review.
3. Do not store raw sensitive submissions in public infrastructure.
4. Use privacy-first analytics only.
5. Strip metadata from media if media handling is introduced.
6. Avoid third-party scripts unless essential and reviewed.
7. Use role-based access control for admin/moderator tools.
8. Require 2FA for maintainers and deployment access.
9. Keep audit logs for sensitive admin actions.
10. Separate public website infrastructure from sensitive workflows.
11. Prefer static-first architecture for the public MVP.
12. Do not build custom cryptography.

---

## High-risk features requiring review

These features must not be implemented without explicit security, privacy, legal, and human-rights review:

- anonymous witness submission;
- encrypted media upload;
- offline submission queue;
- Tor/onion mirror;
- whistleblower workflows;
- user accounts for affected persons;
- publication of exact GPS incident locations;
- automated email/call campaigns at scale;
- scraped social-media databases;
- evidence preservation pipelines;
- partner/admin dashboards.

---

## Dependency policy

Before adding a dependency, consider:

- is it necessary?
- is it maintained?
- does it introduce tracking?
- does it run third-party scripts?
- does it process user data?
- does it increase attack surface?
- is there a smaller safer alternative?

---

## Secrets policy

Never commit:

- API keys;
- tokens;
- private keys;
- passwords;
- database URLs;
- webhook secrets;
- partner contact lists;
- raw sensitive evidence;
- user data exports.

Use environment variables and secret-management tools.

---

## Responsible disclosure expectations

We ask security researchers to:

- avoid accessing, modifying, or deleting data;
- avoid social engineering;
- avoid denial-of-service testing against production;
- stop testing if sensitive data is encountered;
- report promptly and privately;
- give maintainers reasonable time to fix before public disclosure.

---

## Current security posture

As of the public static beta (2026-07-12):

| Control | Status |
|---|---|
| Content Security Policy | ✅ Configured via `_headers` + `<meta>` fallback |
| Self-hosted fonts | ✅ `@fontsource` — no external font requests |
| HSTS / X-Content-Type-Options / Referrer-Policy | ✅ Configured in `_headers` |
| Permissions-Policy | ✅ All sensors disabled by default |
| Frame-ancestors | ✅ `'none'` — prevents clickjacking |
| security.txt | ✅ Published at `/.well-known/security.txt` |
| Dependabot (npm + Actions) | ✅ Weekly npm, monthly Actions |
| CI pipeline | ✅ Typecheck + lint + test + build |
| CSP-compatible build | ✅ App loads under the declared CSP |
| 2FA for maintainers | ⬜ Recommended — enforce via GitHub org settings |
| Branch protection on `main` | ⬜ Recommended — require PR + passing CI |
| Secret scanning | ⬜ Enable in GitHub repo Settings → Code security |
| Private security contact (email) | ⬜ Not yet configured |
| Incident response plan | ⬜ Template in `docs/static-beta-security-checklist.md` |
| External security review | ⬜ Before sensitive features launch |
| Privacy-first analytics | ⬜ Not introduced; none active |

### Recommended next steps for maintainers

1. **Enable branch protection** on `main`: require pull requests, at least
   one approving review, and passing CI before merge.
2. **Require 2FA** for all collaborators in GitHub organization settings.
3. **Enable secret scanning** in repo Settings → Code security → Secret
   scanning. Push protection is recommended.
4. **Enable private vulnerability reporting** in repo Settings → Code
   security → Private vulnerability reporting.
5. **Set up a security email** and PGP key when the domain is active.
   Update `security.txt` and this file.

Before sensitive features:

- external security review;
- privacy impact assessment;
- human-rights risk assessment;
- legal review;
- red-team testing;
- moderator training;
- takedown and correction workflow.
