# ADR-004: Prefer Browser Standards over Heavy UI Libraries

## Status

accepted

## Date

2026-08-06

## Context

Earlier web UI approaches often depended on large helper libraries for
basic interactions. Modern browsers provide robust ES modules,
standards-based DOM APIs, ARIA support, and native event models.

UCThello benefits from low dependency overhead and direct control.

## Decision

Prefer standards-based browser features over heavy UI libraries for
runtime behavior. Implement tabs, accordions, and interaction logic
with native JavaScript, semantic HTML, and accessible attributes.

## Consequences

Positive:

- Smaller runtime dependency surface.
- Better long-term maintainability and portability.
- More transparent behavior and easier performance profiling.

Negative:

- Team must implement and maintain UI primitives directly.
- Compatibility details require explicit handling and testing.

## Alternatives Considered

- Keep jQuery and jQuery UI style runtime dependencies:
  quick setup but adds weight and legacy coupling.
- Adopt a large SPA framework:
  rich ecosystem but unnecessary complexity for current scope.
- Mix multiple utility libraries:
  may speed delivery but increases fragmentation.

## Implementation Notes

- Use ES modules and native browser APIs as default choice.
- Keep accessibility requirements explicit in widget behavior.
- Cover interactive components with unit and e2e tests.
- Add dependencies only when there is clear net benefit.
