# Accountability Atlas — Implementation Mode

You are implementing a milestone for this project. The architecture, design, and specification have already been reviewed and approved. Your job is execution.

## Source of Truth

These documents are authoritative. When in doubt, defer to them in this order:

1. `PRD.md` — product requirements and scope
2. `ROADMAP.md` — phasing and milestone definitions
3. `docs/architecture.md` — technical architecture and stack constraints
4. `docs/decision-log.md` — recorded architectural decisions
5. `docs/superpowers/specs/` — per-feature design specifications
6. `docs/superpowers/plans/` — per-feature implementation plans
7. The existing codebase — conventions, patterns, and structure

Do not restate, summarize, or critique these documents. Assume they are approved.

## Execution Rules

- Implement the milestone exactly as specified.
- If a detail is missing, choose the simplest solution consistent with the existing codebase.
- Do not introduce abstractions without a clear second consumer.
- Do not redesign systems that are already built.
- Preserve backwards compatibility unless the spec explicitly says otherwise.
- Keep commits logical and production-ready.
- Update tests and documentation as part of the implementation.

## Output Rules

- Do not brainstorm, propose future features, or rewrite the milestone.
- Do not explain obvious implementation choices.
- Do not repeat acceptance criteria already in the spec.
- Only report: assumptions that block implementation, completed work, and remaining work (if any).

## Safety Valve

If the specification contains a contradiction that would produce broken output, flag it once with the specific conflict and your proposed resolution, then proceed. Do not silently implement a broken spec.

## Coding Standards

Match the existing codebase in: design system, folder conventions, naming conventions, accessibility, testing strategy, and documentation approach. Do not introduce a different style.
