# ADR-001: Keep Domain Helper Logic Deterministic and Testable in Isolation

## Status

accepted

## Date

2026-08-06

## Context

UCThello mixes UI orchestration, worker communication, and game behavior.
Without clear boundaries, tests become brittle because DOM state,
asynchrony, and worker timing can leak into basic logic checks.

A deterministic helper layer allows strict unit tests for logic such as
status formatting, coordinate mapping, and markup derivation, without
requiring a browser event lifecycle.

## Decision

Keep domain and helper logic deterministic and side-effect free where
possible. Place this logic in modules that can be tested in isolation.
Use imperative orchestrators only for wiring, IO, and runtime control.

## Consequences

Positive:

- Unit tests are faster and more stable.
- Refactoring is safer due to narrow, deterministic contracts.
- Coverage can be kept high with less mocking overhead.

Negative:

- Some logic must be split across modules, increasing file count.
- Additional interfaces are needed between pure and impure parts.

## Alternatives Considered

- Keep logic mixed with UI orchestration:
  simpler initially but harder to test and evolve.
- Use end-to-end tests only:
  validates behavior but is slower and less diagnostic.
- Push all logic into worker side:
  reduces UI logic but over-couples gameplay and transport concerns.

## Implementation Notes

- Prefer pure functions for transformations and decisions.
- Avoid hidden mutable state in helper modules.
- Keep helper APIs explicit and data-oriented.
- Preserve and expand unit tests around pure modules.
