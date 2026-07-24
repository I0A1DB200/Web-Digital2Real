# Changelog

## Academy Implementation Package 7 — Academy UI MVP

### Added

- Added the editorial Lab 001 view with an accessible conveyor stage, learner commands, process state and validation objectives.
- Added a scoped responsive Academy stylesheet consuming the existing brand token SSOT.
- Added dependency-free UI projection and integration tests against the real Lab 001 Session.

### Changed

- Connected the existing Academy route directly to the interactive Lab 001 experience.
- Added explicit Academy view teardown during route changes and registered the Academy stylesheet in the existing CSS entry point.

### Confirmed

- Package 6 remains the sole process-state authority; no Core Engine public API or business logic changed.
- No framework, dependency, browser timing authority, persistence, backend service, generic Lab Loader or website redesign was introduced.
- Engineering Notes, About and navbar behavior remain operational.

## Academy Implementation Package 6 — Lab 001 Headless Vertical Slice

### Added

- Added the immutable Lab 001 Start/Stop Conveyor definition, Signals, PLC memory/mappings/Program, Machine configuration and Validation rules.
- Added a narrowly scoped Lab 001 Session composing the Signal Registry, Clock, Controller, PLC, Machine and Validation public APIs.
- Added deterministic learner commands, canonical tick orchestration, ordered learning evidence, aggregate snapshots, diagnostics and coordinated reset.
- Added dependency-free end-to-end tests for ownership, mappings, Start/Stop seal-in, priorities, Emergency, Reset, Validation completion and replay.

### Confirmed

- Packages 1 through 5 public behavior remains unchanged and all regression tests continue to pass.
- No generic Lab Loader, UI, routing, persistence, additional Lab, browser dependency or backend behavior was added.

## Academy Implementation Package 5 — Validation Engine

### Added

- Added immutable Validation Rule definitions with separate per-session runtime state.
- Added deterministic Signal equality, inequality, true/false and All/Any composite rule evaluation.
- Added Validation Session lifecycle, immutable Results, synchronous events, diagnostics and reset behavior.
- Added dependency-free tests for rules, composites, sessions, Registry observation, events, immutability, reset and replay.

### Confirmed

- Packages 1 through 4 public behavior remains unchanged and all regression tests continue to pass.
- Validation remains observer-only and adds no scoring, UI, persistence, runtime ownership or scripting capability.

## Academy Implementation Package 4 — PLC Runtime

### Added

- Added canonical PLC lifecycle, Boolean Input/Internal/Output memory areas and deterministic scan execution.
- Added a bounded ordered Program/Network/Instruction model with Boolean reads, contacts, AND, OR, NOT and memory/output writes.
- Added validated Signal-to-Input and Output-to-Signal mappings using the approved Signal Registry API.
- Added immutable PLC events, faults, scan results, diagnostics and deterministic reset behavior.
- Added dependency-free tests for lifecycle, process images, Boolean logic, priority representation, mappings, faults, events, reset and replay.

### Confirmed

- Packages 1 through 3 public behavior remains unchanged and all regression tests continue to pass.
- No Machine dependency, vendor language, parser, timer, counter, UI, persistence or backend behavior was added.

## Academy Implementation Package 3 — Machine Runtime

### Added

- Added a generic immutable Machine Component contract with deterministic update and reset behavior.
- Added focused Motor and Sensor models plus the MVP Conveyor Machine Runtime composition.
- Added Machine lifecycle, recoverable faults, Emergency priority, state-derived Sensors, synchronous events and diagnostics.
- Added dependency-free tests for components, transitions, commands, faults, reset equivalence, events, snapshots and replay determinism.

### Confirmed

- Package 1 and Package 2 public behavior remains unchanged and all regression tests continue to pass.
- No PLC, Validation, Signal Registry ownership, scheduler, UI, rendering, persistence or backend behavior was added.

## Academy Implementation Package 2 — Simulation Clock and Controller

### Added

- Added a caller-driven fixed-step Simulation Clock with validated lifecycle transitions and deterministic diagnostics.
- Added a Simulation Controller with synchronous canonical phase hooks, lifecycle events, immutable snapshots and reset behavior.
- Added dependency-free tests for Clock and Controller lifecycle, phase ordering, determinism, faults, resets and immutability.

### Confirmed

- Package 1 public behavior remains unchanged and its tests continue to pass.
- No application UI, routing, CSS, assets, backend code or future runtime logic changed.

## Academy Implementation Package 1 — Core Contracts and Signal Registry

### Added

- Added immutable Academy signal constants and definition validation.
- Added a deterministic, ownership-aware Signal Registry with safe events, reset behavior and diagnostics.
- Added dependency-free Node tests for registration, validation, updates, events, resets, isolation and determinism.

### Confirmed

- No existing application source, UI, CSS, routing, assets or backend behavior changed.
- Lab Loader and all PLC, Machine, Simulation and Validation runtimes remain outside this package.

## SPRINT-001 — Repository Foundation

### Added

- Added repository hygiene rules for generated Python, browser-validation, and local files.
- Added `RFC-002_RepositoryRefactor.md` as the implementation and migration ledger.
- Added a dependency-free validation baseline for syntax, imports, assets, routes, interactions, visual comparison, and scope review.

### Changed

- Reconciled project vision, product blueprint, frontend architecture, file architecture, and brand documentation with the active Notes-first application.
- Clarified that Labs is preserved but disconnected, Academy is currently informational, Assistant is not implemented, and Backend is an isolated prototype.
- Confirmed copper from `Frontend/styles/brand.css` as the visual identity SSOT.

### Removed

- Removed tracked generated Python bytecode from `Backend/__pycache__/`.

### Confirmed

- No runtime source, UI, import, asset, dependency, or repository structure changed.
- RFC-002 structural migration has not started.

---

## v2.0.2 — V2 Repository Consolidation

### Changed

- Replaced the legacy `Frontend/index.html` with the minimal SPA shell.
- Replaced the legacy `Frontend/app.js` with the modular Labs, Notebook and About application controller.
- Replaced the legacy monolithic `Frontend/styles.css` with the official modular CSS import entry point.
- Added favicon, metadata and theme colour references to the HTML document.
- Added hash-based view persistence for `Labs`, `Notebook` and `About`.
- Improved Lab Viewer cleanup and keyboard handling.
- Improved reveal animation lifecycle.

### Removed

- Removed the legacy `Frontend/avatar/avatar.js`.
- Removed the legacy `Frontend/scada/scada.js`.
- Removed the legacy `Frontend/videos/videos.js`.
- Removed the obsolete `docs/arquitectura.md.txt`.
- Removed the unused `Frontend/styles/cards.css`.
- Removed the unused `Frontend/styles/labs.css`.

### Confirmed

- `Frontend/styles/exhibition.css` is the official Home/Labs presentation layer.
- `Frontend/styles/brand.css` remains the visual identity SSOT.
- `Frontend/data/labs.js` remains the laboratory content SSOT.
- `Frontend/data/notebook.js` remains the Notebook content SSOT.
- `Frontend/data/site.js` remains the global site information SSOT.

---

## v2.0.1 — File Architecture Documentation

### Added

- Added `07_FileArchitecture.md`.
- Documented the official project structure.
- Documented folder and file responsibilities.
- Added modification rules for future development.
- Added common task guidance for Labs, Notebook, Brand and CSS changes.

### Confirmed

- `Frontend/data/` is the source of truth for Labs and Notebook entries.
- `Frontend/styles/brand.css` is the source of truth for brand identity.
- The navbar logo remains HTML + CSS, not SVG.
- `Frontend/assets/brand/` contains brand assets such as favicon and logo resources.
- The Home/Labs view is treated as an editorial exhibition, not a dashboard.

### Notes

This changelog entry established the official file architecture workflow for Digital2Real V2.
