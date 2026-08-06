# Software Architecture

## Architecture Specification

UCThello uses a modern browser-first architecture based on ES modules
and native browser APIs.
The runtime has no jQuery or jQuery UI dependency.

Extracted from repository abstract and AI notes in
[README.md](../README.md):

- UCThello is a board game demonstrator using an MCTS UCT AI engine.
- The project prefers responsive UX and bounded compute over
  maximum-strength search at any cost.

The system is intentionally split into:

- Functional core: deterministic, side-effect-free logic and helpers.
- Imperative shell: DOM interaction, event wiring, worker messaging, and orchestration.

This separation improves correctness, testability, and maintainability.

## Key Properties

- Functional core / imperative shell split.
- Deterministic helper module with high unit-test coverage.
- Browser-native UI behavior using semantic HTML, ARIA attributes,
  and keyboard support.
- Worker-based game engine boundary between presentation and search logic.

## Module View

### Imperative shell

- html5/src/js/hmi.js: UI orchestration, event lifecycle,
  board rendering calls, worker IO.
- html5/src/js/ui/widgets.js: tab and accordion initialization and event behavior.

### Functional core

- html5/src/js/ui/pure.js: pure helper functions for markup derivation,
  coordinate mapping, status formatting, and move parsing.

### Engine and game model side

- html5/src/js/controller.js: worker-side command processing and orchestration.
- html5/src/js/board.js: board state transitions and legal-action computation.
- html5/src/js/uct/uct.js and html5/src/js/uct/uctnode.js: UCT search behavior.
- html5/src/js/random/random.js: fallback move selection.

## AI Engine Documentation

Detailed algorithm explanation for the four MCTS UCT stages,
including exploration vs exploitation:

- [doc/mcts_uct_ai_engine.md](mcts_uct_ai_engine.md)

## Quality and Verification

- Unit tests: Vitest with jsdom for deterministic module
  and orchestration validation.
- End-to-end tests: Playwright for browser behavior.
- Coverage target: strict global thresholds configured for statements,
  branches, functions, and lines.
- Linting and formatting: Biome for code quality,
  markdownlint for documentation quality.

## UML Coverage (Mermaid)

### 1. Use case diagram

```mermaid
flowchart LR
  User((User))
  AI((AI Engine))

  UC1([Start new game])
  UC2([Play legal move])
  UC3([Request AI action])
  UC4([View game status])
  UC5([Configure options])

  User --> UC1
  User --> UC2
  User --> UC4
  User --> UC5
  AI --> UC3
```

### 2. Class diagram

```mermaid
classDiagram
  class Hmi {
    +init()
    +update(board, actionInfo)
    +send(action)
    +requestAiAction()
  }

  class PureUI {
    +buildBoardMarkup(width)
    +buildStatusHtml(board, actionInfo)
    +fieldIdFromCoordinates(x, y)
    +parseMoveFromFieldId(id)
  }

  class Widgets {
    +initializeTabs(container)
    +initializeAccordion(container)
  }

  class Controller {
    +processHmiRequest(event)
    +draw(data, actionInfo)
  }

  class OthelloBoard {
    +setup(size)
    +getActions()
    +doAction(action)
    +getState()
  }

  class Uct {
    +getActionInfo(board, maxIterations, maxTime, verbose)
  }

  Hmi --> PureUI : uses
  Hmi --> Widgets : uses
  Hmi --> Controller : via Web Worker
  Controller --> OthelloBoard : owns
  Controller --> Uct : uses
```

### 3. Object diagram

```mermaid
flowchart TB
  hmiObj["hmi: Hmi"]
  workerObj["engineWorker: Controller"]
  boardObj["board: OthelloBoard"]
  cfgObj["settings: {playerwhite, playerblack, passingallowed}"]

  hmiObj --> cfgObj
  hmiObj --> workerObj
  workerObj --> boardObj
```

### 4. Package diagram

```mermaid
flowchart LR
  subgraph UI[ui package]
    HMI[hmi.js]
    WID[ui/widgets.js]
    PURE[ui/pure.js]
  end

  subgraph ENGINE[engine package]
    CTRL[controller.js]
    BRD[board.js]
    UCT[uct/uct.js]
    NODE[uct/uctnode.js]
    RND[random/random.js]
  end

  HMI --> PURE
  HMI --> WID
  HMI --> CTRL
  CTRL --> BRD
  CTRL --> UCT
  CTRL --> RND
  UCT --> NODE
```

### 5. Component diagram

```mermaid
flowchart LR
  BrowserUI[[Browser UI Component]]
  PureHelpers[[Deterministic Helper Component]]
  Widgets[[Accessible Widgets Component]]
  WorkerController[[Worker Controller Component]]
  GameModel[[Game Model Component]]
  Search[[UCT Search Component]]

  BrowserUI --> PureHelpers
  BrowserUI --> Widgets
  BrowserUI --> WorkerController
  WorkerController --> GameModel
  WorkerController --> Search
```

### 6. Composite structure diagram

```mermaid
flowchart TB
  subgraph HmiComposite[Hmi internal structure]
    Dispatcher[Event dispatcher]
    Renderer[Board/status renderer]
    SettingsReader[Settings reader]
    WorkerPort[Worker message port]

    Dispatcher --> Renderer
    Dispatcher --> SettingsReader
    Dispatcher --> WorkerPort
    WorkerPort --> Renderer
  end
```

### 7. Deployment diagram

```mermaid
flowchart LR
  subgraph ClientDevice[Client device]
    Browser[Web Browser]
    Worker[Web Worker Thread]
  end

  subgraph StaticHost[Static HTTP host]
    Assets[HTML CSS JS Images]
  end

  Browser --> Assets
  Browser --> Worker
```

### 8. Profile diagram

```mermaid
classDiagram
  class FunctionalCore {
    <<stereotype>>
    deterministic
    side_effect_free
    high_test_coverage
  }

  class ImperativeShell {
    <<stereotype>>
    orchestrates_io
    dom_side_effects
    worker_messaging
  }

  FunctionalCore <|-- PureUI
  ImperativeShell <|-- Hmi
```

### 9. Activity diagram

```mermaid
flowchart TD
  A[User selects move] --> B[Hmi validates selectable field]
  B --> C[Hmi sends perform request to worker]
  C --> D[Controller updates board]
  D --> E[Controller emits redraw event]
  E --> F[Hmi updates board and status]
  F --> G{Next player human?}
  G -- Yes --> H[Prepare human move]
  G -- No --> I[Request AI action]
```

### 10. State machine diagram

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> AwaitingHumanMove : redraw(nextishuman=true)
  Idle --> AwaitingAI : redraw(nextishuman=false)
  AwaitingHumanMove --> ApplyingMove : click field
  AwaitingAI --> ApplyingMove : AI response
  ApplyingMove --> Idle : redraw
  Idle --> GameOver : no actions for both players
  GameOver --> Idle : restart
```

### 11. Sequence diagram

```mermaid
sequenceDiagram
  participant User
  participant Hmi
  participant Worker as ControllerWorker
  participant Board

  User->>Hmi: click legal field
  Hmi->>Worker: postMessage(perform, action, settings)
  Worker->>Board: doAction(action)
  Worker-->>Hmi: message(redraw, board, actioninfo)
  Hmi->>Hmi: update(board, actioninfo)
```

### 12. Communication diagram

```mermaid
flowchart LR
  U[User] -- 1 click --> H[Hmi]
  H -- 2 perform request --> C[Controller worker]
  C -- 3 mutate --> B[Board]
  C -- 4 redraw event --> H
  H -- 5 render --> V[View DOM]
```

### 13. Interaction overview diagram

```mermaid
flowchart TD
  S[Start interaction] --> I1[Sequence: Start game]
  I1 --> D1{Human or AI turn}
  D1 -- Human --> I2[Sequence: Human move flow]
  D1 -- AI --> I3[Sequence: AI move flow]
  I2 --> M[Merge]
  I3 --> M
  M --> E[Check termination]
  E --> F[End or continue]
```

### 14. Timing diagram

```mermaid
sequenceDiagram
  participant UI as Hmi
  participant WK as ControllerWorker
  participant DOM as Board View

  Note over UI,WK: t=10ms - Hmi request starts
  UI->>WK: perform(action, settings)
  Note over WK: t=12ms - worker compute starts
  WK->>WK: selection/expansion/simulation/backpropagation
  Note over WK,UI: t=23ms - redraw event window
  WK-->>UI: redraw(board, actioninfo)
  Note over UI,DOM: t=26ms - DOM update starts
  UI->>DOM: render board + status
  Note over UI,DOM: t=32ms - DOM update ends
```

Compatibility note:
Some Mermaid renderers do not consistently support `timingDiagram`
or high-resolution axis formatting. This sequence-based timing view is
used as a stable cross-renderer fallback while preserving discrete
timing points.

## Architectural Decision Summary

- Keep domain/helper logic deterministic and testable in isolation.
- Keep side effects concentrated in orchestration boundaries.
- Preserve worker boundary to decouple rendering and decision-making workloads.
- Prefer standards-based browser features over heavy UI libraries.
