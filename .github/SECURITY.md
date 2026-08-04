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

Until a private security contact is created, do not publish vulnerability details in GitHub issues.

Use the repository maintainer’s private contact method once listed. A future version of this file should include:

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

## Future security roadmap

Before public launch:

- enable GitHub branch protection;
- require 2FA for maintainers;
- set up private security contact;
- configure dependency scanning;
- configure secret scanning;
- add Content Security Policy;
- choose privacy-first analytics;
- document incident response.

Before sensitive features:

- external security review;
- privacy impact assessment;
- human-rights risk assessment;
- legal review;
- red-team testing;
- moderator training;
- takedown and correction workflow.
