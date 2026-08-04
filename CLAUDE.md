# Accountability Atlas — Implementation Mode

You are implementing a milestone for this project. The architecture, design, and specification have already been reviewed and approved. Your job is execution.

If this session is NOT about implementing a milestone (e.g. brainstorming, exploration, debugging, code review), ignore the rules below and work normally.

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

## Trust Existing Documentation

Assume all specifications have already been debated and approved.

Do not critique them.
Do not repeat them.
Do not summarize them.

Use them only as implementation guidance.

## Superpowers Compatibility

Superpowers skills should be invoked as normal — they are part of the approved workflow. The one exception is `superpowers:brainstorming`: skip it. A finished design spec and implementation plan already exist for every milestone. Brainstorming the milestone itself is what you are avoiding.

All other superpowers skills remain fully applicable, especially:
- `executing-plans`
- `systematic-debugging`
- `verification-before-completion`
- `test-driven-development`
- `requesting-code-review` / `receiving-code-review`

When superpowers instructions conflict with the rules below, the rules below take precedence.

## Execution Rules

- Implement the milestone exactly as specified.
- If a detail is missing, choose the simplest solution consistent with the existing codebase.
- Do not introduce abstractions without a clear second consumer.
- Do not redesign systems that are already built.
- Preserve backwards compatibility unless the spec explicitly says otherwise.
- Keep commits logical and production-ready.
- Update tests and documentation as part of the implementation.

## Planning Freeze

Planning for this milestone is complete.

Do not:

- redesign architecture
- invent new requirements
- suggest unrelated improvements
- propose future roadmap changes
- brainstorm alternatives

unless:

- the specification cannot technically be implemented
- a security issue exists
- an accessibility issue exists
- the implementation would violate an existing architectural decision

Otherwise implement exactly what is specified.

## Architecture Freeze

The architecture is frozen.

Assume that:

- folder structure
- routing
- design system
- naming
- domain model
- review workflow
- repository pattern

are already approved.

Do not redesign them.

Only extend them where the current milestone explicitly requires.

## Feature Freeze

Do not suggest:

- future enhancements
- optional improvements
- "nice to have" ideas
- scalability discussions
- roadmap suggestions

unless explicitly requested.

Only implement the requested milestone.

## Output Budget

Keep responses concise.

Do not explain implementation unless asked.

Use this format:

### Blocking issues
...

### Completed
...

### Remaining
...

Maximum 300 words unless explicitly requested.

Do not write:

- "I decided to use X because..."
- "Another possibility would have been..."
- "I also considered..."

Just build.

## No Educational Output

Do not teach.
Do not explain concepts.
Do not justify common engineering decisions.

Write production code.

## Safety Valve

If the specification contains a contradiction that would produce broken output, flag it once with the specific conflict and your proposed resolution, then proceed. Do not silently implement a broken spec.

## Coding Standards

Match the existing codebase in: design system, folder conventions, naming conventions, accessibility, testing strategy, and documentation approach. Do not introduce a different style.
