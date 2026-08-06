# ADR-003: Preserve Worker Boundary to Decouple Rendering and AI Work

## Status

accepted

## Date

2026-08-06

## Context

MCTS UCT search is compute-heavy and can block the main thread when run
in the same execution context as rendering and user interaction.
UCThello targets responsive behavior on desktop and mobile devices,
including constrained environments.

A worker boundary prevents AI computation from stalling UI updates.

## Decision

Preserve the Web Worker boundary between UI and AI decision logic.
Run controller, board simulation, and UCT search in the worker thread.
Use structured message passing for requests and redraw responses.

## Consequences

Positive:

- Better UI responsiveness during AI turns.
- Clear separation between presentation and compute workloads.
- Reduced risk of frame drops and interaction lag.

Negative:

- Message contracts must be maintained carefully.
- Debugging across thread boundaries is more complex.
- Data transfer overhead exists for board snapshots.

## Alternatives Considered

- Run AI on main thread:
  simpler architecture but poorer responsiveness.
- Use setTimeout chunking on main thread:
  partial mitigation with added complexity and less isolation.
- Server-side AI service:
  could offload compute but adds latency and online dependency.

## Implementation Notes

- Keep request and response payloads explicit and versionable.
- Avoid sharing mutable objects across boundaries.
- Ensure redraw events include all state needed by the UI shell.
- Validate worker contracts with unit and integration tests.
