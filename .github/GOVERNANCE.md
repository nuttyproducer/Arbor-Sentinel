# Governance

Accountability Atlas is an open-source civic-tech project with safety-sensitive goals. It uses an open contribution model with a small trusted core team for high-risk decisions.

---

## Governance goals

The governance model should:

- protect the mission;
- prevent chaos;
- keep public work credible;
- protect affected people and contributors;
- avoid founder bottlenecks;
- allow meaningful volunteer contributions;
- create clear decision paths;
- distinguish public open-source work from sensitive operational work.

---

## Roles

### Founder / Product Steward

Responsible for:

- mission clarity;
- product direction;
- public positioning;
- roadmap coordination;
- contributor onboarding;
- protecting scope discipline;
- ensuring the project does not become hateful, unsafe, or legally reckless.

The founder is not expected to build everything.

### Core Maintainers

A small group responsible for reviewing and merging work.

Suggested areas:

- product/strategy;
- frontend;
- backend/data;
- design/accessibility;
- research/methodology;
- legal/human-rights review;
- security/privacy;
- communications.

Core maintainers should use 2FA and follow the security policy.

### Advisors

Advisors may include:

- human-rights lawyers;
- humanitarian workers;
- OSINT researchers;
- journalists;
- civic-tech experts;
- data protection experts;
- diaspora/community representatives.

Advisors are not required to contribute code. Their role is to review, warn, improve, and guide.

### Contributors

Public contributors may work on:

- documentation;
- research;
- design;
- code;
- translation;
- testing;
- issue triage;
- accessibility;
- communications.

Contributors do not receive access to sensitive systems by default.

---

## Decision types

### Low-risk decisions

Examples:

- typo fixes;
- small UI fixes;
- documentation formatting;
- internal link updates;
- small accessibility improvements.

Decision path: one maintainer review.

### Medium-risk decisions

Examples:

- source methodology changes;
- country page templates;
- public copy changes;
- action template changes;
- organization directory schema;
- analytics/tooling changes.

Decision path: relevant maintainer review plus product steward review.

### High-risk decisions

Examples:

- legal language changes;
- claims of genocide/war crimes/crimes against humanity;
- witness submission features;
- media upload systems;
- partner verification;
- donation integrations;
- security architecture;
- doxing/targeting edge cases;
- publication of sensitive evidence;
- public launch messaging.

Decision path: core maintainer approval plus relevant expert/advisor review where available.

---

## Maintainer permissions

Repository permissions should follow least privilege:

- public contributors: fork and pull request;
- triage contributors: issue labeling only;
- maintainers: merge approved PRs;
- admins: repository settings and secrets.

No one should have admin rights unless needed.

---

## Required reviews

Before merge, require:

- at least one review for normal PRs;
- at least two reviews for feature PRs;
- legal/methodology review for factual/legal public content;
- security/privacy review for data, analytics, auth, or upload changes;
- design/accessibility review for public UI changes when possible.

---

## Public representation

Nobody may claim to represent the project publicly, contact organizations as an official representative, or speak to media on behalf of the project unless authorized by the core team.

Public communication must follow [`docs/communications-playbook.md`](docs/communications-playbook.md).

---

## Partner verification

No organization may be described as a “partner,” “verified partner,” “supporter,” or “collaborator” unless written confirmation exists.

Before confirmation, use:

- “public resource listed”;
- “organization directory entry”;
- “not affiliated with Accountability Atlas.”

---

## Conflict resolution

Conflicts should be handled calmly and privately where possible.

Escalation path:

1. direct clarification;
2. maintainer mediation;
3. core team decision;
4. temporary restriction if needed;
5. removal from project spaces if conduct standards are violated.

---

## Decision log

Significant decisions should be recorded in [`docs/decision-log.md`](docs/decision-log.md), including:

- date;
- decision;
- reason;
- alternatives considered;
- risks;
- owner.

---

## Governance review

This governance model should be reviewed after:

- first 10 contributors;
- first public MVP;
- first advisory review;
- first major security/legal concern;
- every 3 months during active development.
