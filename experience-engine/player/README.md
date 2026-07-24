# Experience Player v1

Experience Player v1 is the headless session runtime for a validated, normalized Experience Engine 2.0 model.

It owns temporary learner-session state. It does not own authoring, YAML parsing, schema validation, publication, persistence, analytics, or presentation.

## Boundary

```text
experience.yaml
→ external schema validation
→ normalized Experience 2.0 object
→ ExperiencePlayer
→ immutable learner-safe snapshot
→ future presentation layer
```

The Player receives the normalized object through dependency injection:

```js
import { ExperiencePlayer } from "./experiencePlayer.js";

const player = new ExperiencePlayer({ experience: normalizedExperience });
```

It never reads `experience.yaml` directly and has no filesystem, browser, network, UI, backend, or vendor dependency.

## Public API

### `new ExperiencePlayer({ experience })`

Accepts one normalized Experience Engine 2.0 object, validates the runtime references it consumes, and stores an immutable internal copy.

### `start({ timestamp })`

Starts a new session. The timestamp must be supplied by the caller and must be finite and non-negative.

### `selectDecision(decisionId, { timestamp })`

Selects a decision available in the current stage. It:

- records the choice;
- reveals the decision's declared evidence;
- applies score and safety effects;
- adds declared time cost;
- moves to the next stage or terminal state;
- exposes the selected consequence only after the choice.

Timestamps must be monotonic. The Player does not use system or browser time.

### `getSnapshot()`

Returns a deeply immutable learner-safe session snapshot.

While a session is active, the snapshot excludes:

- the private fault model;
- diagnostic hypotheses;
- the structured debrief;
- Notebook references intended for terminal review;
- unselected decision rationale, classification, consequence, scoring, and destination.

The debrief and Notebook references become available only after `COMPLETE` or `BLOCKED`.

### `getState()`

Returns the same immutable public state as `getSnapshot()`. The alias is intended for presentation adapters and does not add UI ownership to the Player.

The public state includes generic scenario context, canonical stage progress and an `interaction` phase:

- `start`;
- `introduction`;
- `stage`;
- `consequence`;
- `debrief`.

### `continue()`

Acknowledges the current introduction or selected-decision consequence. The Player owns this transition so presentation layers do not duplicate workflow state.

### `reset()`

Clears all temporary session state and returns the Player to `NotStarted`. The normalized static experience remains unchanged.

## Session state

The Player owns:

- current stage;
- revealed evidence;
- selected decisions;
- immutable decision history;
- visited stages;
- score;
- safety score;
- elapsed time;
- completion status;
- terminal debrief availability.

Score is clamped to the configured minimum and maximum. Safety score starts at zero and accumulates the schema-defined `safety_effect` values. A `COMPLETE` transition is blocked when the resulting safety score is below the configured `safety_threshold`.

## Terminal states

- A strong decision leading to `COMPLETE` produces `completed`.
- A non-strong decision leading to `COMPLETE` produces `completed_with_warnings`.
- A decision leading to `BLOCKED` produces `blocked`.

Completion-condition interpretation beyond these declared transitions remains outside v1. The Player preserves the schema values for future approved evaluation logic.

## Explicit exclusions

Version 1 does not implement:

- YAML loading or schema parsing;
- automatic publication-state filtering;
- UI or routing;
- persistence or learner profiles;
- authentication;
- analytics;
- scoring redesign;
- asynchronous events;
- Notebook loading;
- Markdown parsing;
- network or backend integration.

These boundaries preserve the existing web integration contract and keep the Player deterministic, vendor-neutral, and presentation-independent.
