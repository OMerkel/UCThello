# ADR-002: Concentrate Side Effects in Orchestration Boundaries

## Status

accepted

## Date

2026-08-06

## Context

Side effects in UCThello include DOM updates, event listeners,
timeouts, and worker messaging. When these are scattered across many
modules, behavior becomes hard to reason about and defects are harder
to localize.

Concentrating side effects in orchestration boundaries reduces coupling
and keeps the rest of the codebase predictable.

## Decision

Keep side effects in thin orchestration modules. Treat rendering,
listeners, timers, and worker IO as boundary concerns. Keep helper and
core logic modules side-effect free.

## Consequences

Positive:

- Easier debugging due to explicit side-effect locations.
- Cleaner contracts between orchestration and logic modules.
- Improved test strategy split: unit for pure logic, focused tests for
  orchestration behavior.

Negative:

- Orchestration modules can grow if not kept disciplined.
- Requires careful API design to avoid accidental leakage of effects.

## Alternatives Considered

- Allow side effects in any module:
  flexible but leads to hidden dependencies.
- Central event bus for everything:
  can decouple calls but may obscure execution flow.
- Full framework state management layer:
  may standardize effects but adds weight and complexity.

## Implementation Notes

- Keep orchestration classes and functions small.
- Route state derivation through pure helpers before rendering.
- Isolate asynchronous behavior behind explicit methods.
- Avoid direct DOM access from helper modules.
