# Requirements Specification

## Method and Scope

Requirements shall match implemented behavior, and be
cross-checked against tests and architecture documentation.

Scope includes:

- Browser UI and interaction model.
- Worker-based game orchestration and AI invocation.
- Deterministic helper logic and rendering contracts.
- Quality attributes enforced by tests and tooling.

## Functional Requirements (FR)

### FR-001 Board initialization and rendering

The system shall build and render an 8x8 board with stable field IDs
from `fielda1` through `fieldh8`.

### FR-002 Status rendering

The system shall render status text for active turns and game-over
states, including optional previous action and optional AI action info.

### FR-003 Human move submission

The system shall allow a human to select legal set actions and submit
them as `perform` requests to the worker.

### FR-004 Runtime settings propagation

The system shall propagate runtime options (`playerwhite`,
`playerblack`, `passingallowed`) in worker-bound requests.

### FR-005 Available move marker behavior

The system shall show or hide available move markers based on the
`showavailablemove` option.

### FR-006 Pass handling

The system shall detect pass-only action sets and perform pass handling
in update flow.

### FR-007 New game flow

The system shall support restarting the game via the New control and
emit a `restart` request to the worker.

### FR-008 Worker request/response protocol

The system shall support `start`, `perform`, `restart`, and
`actionbyai` worker requests, and `redraw` worker requests back to UI.

### FR-009 Tabs behavior

The system shall provide tabbed navigation for major UI sections,
including URL hash activation and click selection.

### FR-010 Accordion behavior

The system shall provide accordion behavior for the about/legal/rules
section, including single active item semantics.

### FR-011 Keyboard interaction support

The system shall support keyboard interactions for tabs, accordion,
and the New game control.

### FR-012 Responsive board sizing

The system shall compute and apply square sizing based on viewport and
board geometry constraints.

### FR-013 AI action execution

The system shall request AI actions for non-human turns and apply the
selected move through the worker/game model pipeline.

## Non-Functional Requirements (NFR)

### NFR-001 Browser-first standards implementation

The runtime shall be based on modern browser APIs and ES modules,
without jQuery runtime dependency.

### NFR-002 Deterministic functional core

Core helper logic shall remain deterministic and testable in isolation.

### NFR-003 Imperative shell boundaries

Side effects (DOM updates, events, timers, worker IO) shall be
concentrated in orchestration modules.

### NFR-004 UI responsiveness under AI load

AI computations shall run behind a worker boundary to avoid blocking
main-thread interaction and rendering.

### NFR-005 Accessibility baseline

Interactive UI components shall expose keyboard interaction and ARIA
roles/states consistent with implemented widget semantics.

### NFR-006 Testability and verification rigor

The project shall maintain unit and end-to-end automated tests that
validate both deterministic logic and orchestration behavior.

### NFR-007 Coverage quality gate

Automated test coverage thresholds shall be enforced at 95% minimum
for statements, branches, functions, and lines.

### NFR-008 Static quality gates

Code and documentation shall be guarded by Biome and markdownlint
checks in project scripts.

## Traceability Matrix (Requirements to Tests)

### Unit tests (`html5/src/test/*.unit.test.js`)

- `pure.unit.test.js`:
  FR-001, FR-002, FR-006, FR-012, NFR-002, NFR-006
- `widgets.unit.test.js`:
  FR-009, FR-010, FR-011, NFR-001, NFR-005, NFR-006
- `hmi.unit.test.js`:
  FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008,
  FR-012, FR-013, NFR-003, NFR-004, NFR-006

### End-to-end tests (`html5/src/test/app.e2e.spec.js`)

- `tabs and accordion interactions work without jQuery`:
  FR-009, FR-010, FR-011, NFR-001, NFR-005, NFR-006
- `new game control is keyboard accessible`:
  FR-007, FR-011, NFR-005, NFR-006

## Quality Criteria

- Each implemented test case must reference one or more requirement
  IDs.
- New features should add or update FR/NFR entries and matching tests.
- ADR decisions in `doc/adr/` should be reflected by related NFR items.
