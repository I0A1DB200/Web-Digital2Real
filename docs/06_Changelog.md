# Changelog

## 2026-08-26 — Environment & Experience Learning Model V2 draft

- Added D2R-DESIGN-002 as a DRAFT product and learning design for ENV-owned Theory, ten Experiences, the four-phase Experience model, correct-decision progression, retry feedback, attempt tracking, provisional evaluation outcomes, and completion/mastery separation.
- Kept D2R-003 and EXP-MODEL-001 as existing design and contract authorities, Notebook independent from ENV Theory, and all V2 implementation explicitly out of scope.

## 2026-08-26 — Compact Experience Lab selector

- Scoped selector-only spacing to the existing Environment catalog, removing stacked workspace padding and viewport-based minimum height without changing internal ENV or Player layouts.
- Set desktop navigation-to-introduction spacing to 48–64px, reduced the heading maximum from 5.8rem to 4.25rem with balanced wrapping across the existing shell width, and tightened subtitle-to-card spacing to 36–48px.
- Preserved card dimensions, image proportions, responsive stacking, content and all navigation behavior; no fixed heights, negative margins or content-clipping workarounds were added.

## 2026-08-26 — Compact Environment progress

- Integrated a responsive progress card beside the Environment title, using existing graphite and corporate copper tokens with a subtle endpoint glow.
- Replaced capacity-based segments with an accessible continuous bar counting unique active catalog Experiences assigned through Environment hotspots; empty Environments show 0 / 0.
- Reused browser-local completion storage and added change subscriptions without storing derived totals or percentages.
- Added coverage for empty, partial and complete progress, singular/plural labels, subscriptions and archived EE-0009 exclusion. Player, images, hotspot coordinates and generated content remain unchanged.

## 2026-08-15 — Experience Environment vertical slice

- Added three canonical Environment definitions and deterministic Environment publication through the existing Experience Engine packaging pipeline.
- Changed Experience Lab entry from a flat Experience list to an Environment selector with percentage-based hotspots and generic empty states.
- Anchored Experience details to their hotspot with collision-aware placement, accessible single-popover behavior, and versioned browser-local completion progress.
- Retired EE-0009 from generated catalogs through the governed `archived` lifecycle while preserving its canonical package and regression coverage.

## 2026-08-14 — Responsive navigation and editorial rhythm

- Added an accessible small-screen navigation menu while preserving the existing desktop navigation and data source.
- Simplified Engineering Note headers to retain the note identifier and title without a duplicated kicker.
- Consolidated editorial body copy around the governed body line-height token.

## 2026-08-14 — Experience Environment Data Contract

- Registered `content/environments/` as the canonical owner of Environment content.
- Added governed Experience editorial identity and access classification across Authoring, Runtime, Web Artifact, and generated catalogue contracts.
- Added the Environment Definition v1 schema and deterministic validation boundary for draft and published Environments.

## Platform Foundation RC1

### Confirmed

- Finalized the deterministic catalog boundary: preview accepts technically reviewable, approved and published Experiences, while production accepts only published Experiences with passing technical validation.
- Completed the Platform Foundation validation baseline for Experience content production.

## Experience Package v1 pilot

### Added

- Established D2R-STD-001 with ES/EN locale documents, documented media provenance and controlled fallback.
- Added deterministic localization resolution and localized Generated Web Artifact variants without duplicating Experience logic.

### Changed

- Experience packaging now validates standardized packages, publishes only declared web derivatives and keeps legacy Experiences compatible until explicitly migrated.
- Experience Lab selects localized artifacts from the document language while preserving the generic Player behavior.

## Repository architecture baseline and hygiene

### Added

- Established D2R-000 through D2R-008 as the governed blueprint, Industrial Capability Framework, standards and architecture-governance baseline.
- Added canonical capability, Experience Brief, assessment and ADR templates.
- Added provisional indexes for ICF-01 through ICF-11 without creating speculative capability content.

### Changed

- Reconciled live Project Status with the approved Notebook and Experience Lab product model.
- Marked the legacy roadmap as historical and linked current planning to `PROJECT_STATUS.md`.

### Removed

- Removed 789 tracked local Edge profile files from three browser-validation directories.
- Removed three tracked temporary validation screenshots from the repository root.

### Confirmed

- Runtime source, Experience content, schemas, imports, UI behavior and Backend behavior remain unchanged.
- Browser-validation profiles and `validation-*.png` remain covered by `.gitignore`.

## Experience Engine — Workspace foundation

### Added

- Added a dependency-free YAML Adapter that converts canonical experience documents into immutable normalized models.
- Added deterministic `preview` and `publish` packaging modes for the static frontend.
- Added atomic validation, obsolete-artifact cleanup, generated catalogs and browser-consumable Player packaging.
- Added tests for YAML parsing, Player compatibility, deterministic copying, cleanup, publication filtering and failure preservation.

### Changed

- Extended the Headless Player public state with generic scenario context, canonical progress and presentation-neutral interaction phases.

### Confirmed

- `experience-engine/` remains the only editable source of truth.
- `Frontend/` remains the static deployment root, and generated Experience Engine artifacts are disposable and ignored by Git.

## Experience Engine — Experience Player v1

### Added

- Added a dependency-free headless Player for validated, normalized Experience Engine 2.0 models.
- Added deterministic session progression, progressive evidence, decision history, score, safety, elapsed time, terminal states and reset.
- Added learner-safe immutable snapshots that withhold private diagnosis and debrief content until termination.
- Added native tests for lifecycle, privacy boundaries, references, progression, terminal outcomes, reset, immutability and deterministic replay.

### Confirmed

- The Player does not parse YAML, publish experiences, render UI, persist sessions, access browser APIs or modify static experience data.
- Existing schemas, Briefs, prompts, workflows, integration contracts, experiences, Frontend and Backend remain unchanged.

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
