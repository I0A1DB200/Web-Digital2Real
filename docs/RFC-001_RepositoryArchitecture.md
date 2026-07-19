# RFC-001 — Repository Architecture

**Status:** Approved architecture proposal  
**Date:** 2026-07-19  
**Owners:** Digital2Real Product Owner and Lead Software Engineer  
**Decision scope:** Repository organization and migration boundaries  
**Implementation RFC:** RFC-002 Repository Refactor

---

## 1. Status

This RFC records the approved architectural direction for the Digital2Real repository. It is based exclusively on a read-only audit of the repository as it existed on 2026-07-19.

This document does not implement the architecture. Paths shown under the target architecture are decisions or proposals for later migration packages; they are not statements that those paths already exist.

Normative terms are used as follows:

- **Observed fact:** verified directly in the repository.
- **Decision:** the architectural rule adopted by this RFC.
- **Proposal:** an implementation approach to be confirmed by the relevant migration package.
- **Risk:** a condition that can compromise correctness, maintainability, or delivery.
- **Deferred work:** intentionally outside this RFC or lacking a current product requirement.

## 2. Context

Digital2Real is evolving from a single editorial website into a long-lived platform with five conceptual areas:

1. Editorial Website;
2. Engineering Notes;
3. Academy;
4. Digital2Real Assistant;
5. Shared Engines.

The current repository is a small vanilla JavaScript ES Modules application with modular CSS and a separate FastAPI prototype. Its small size is an advantage, but its documentation and inactive code describe a Labs-first product while the active frontend is Notes-first. The next architecture must make product ownership explicit without imposing infrastructure that the current system does not require.

The governing principles are Single Source of Truth (SSOT), component boundaries, data-driven content, reusable engines, separation of concerns, modularity, maintainability, editorial design, and vendor neutrality.

## 3. Scope

This RFC covers:

- repository, frontend, backend, JavaScript, CSS, data, component, asset, documentation, and quality-tooling organization;
- target product and shared-code boundaries;
- dependency direction and SSOT ownership;
- classification of current files and capabilities;
- an ordered, reversible migration strategy;
- migration packages limited to five changed paths whenever possible.

This RFC does not:

- develop features or redesign the UI;
- select a framework, package manager, build system, database, CMS, hosting platform, or backend platform;
- define an Assistant implementation;
- activate or remove the disconnected Labs experience;
- repair content or missing media as part of writing this RFC;
- authorize commits, pushes, merges, history changes, or deployment.

## 4. Current repository structure

The audited source structure is:

```text
Web-Digital2RealV2/
├── AGENTS.md
├── Backend/
│   ├── __pycache__/
│   │   └── main.cpython-313.pyc
│   └── main.py
├── Frontend/
│   ├── assets/
│   │   ├── brand/
│   │   ├── images/
│   │   │   └── notebook/
│   │   └── videos/
│   ├── components/
│   │   ├── about.js
│   │   ├── articleViewer.js
│   │   ├── labCard.js
│   │   ├── labViewer.js
│   │   ├── navbar.js
│   │   └── notebookCard.js
│   ├── data/
│   │   ├── labs.js
│   │   ├── notebook.js
│   │   └── site.js
│   ├── styles/
│   │   ├── about.css
│   │   ├── base.css
│   │   ├── brand.css
│   │   ├── exhibition.css
│   │   ├── layout.css
│   │   ├── navbar.css
│   │   ├── notebook.css
│   │   ├── responsive.css
│   │   ├── variables.css
│   │   └── viewer.css
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── docs/
│   ├── 00_ProjectVision.md
│   ├── 01_ProductBlueprint.md
│   ├── 02_DesignLanguage.md
│   ├── 03_FrontendArchitecture.md
│   ├── 04_DataModel.md
│   ├── 05_Roadmap.md
│   ├── 06_Changelog.md
│   ├── 07_FileArchitecture.md
│   └── 08_BrandBook.md
└── validation-*.png
```

Observed local browser-profile validation directories were also present but untracked. There was no `.gitignore` to govern them.

## 5. Verified findings

### 5.1 Runtime and product findings

- **Observed fact:** `Frontend/app.js` imports `site`, `notebook`, navbar, Notebook card, Article viewer, and About.
- **Observed fact:** the active routes are `engineering-notes`, `academy`, and `about`; invalid hashes fall back to `engineering-notes`.
- **Observed fact:** `labs.js`, `labCard.js`, and `labViewer.js` are not imported by the active application.
- **Observed fact:** `exhibition.css` and `viewer.css` remain imported globally even though their Labs components are disconnected.
- **Observed fact:** Academy currently consists of data in `site.js`, rendering in `app.js`, and styles in `layout.css`; it is not yet a separate product module.
- **Observed fact:** no Assistant source directory or runtime integration exists.
- **Observed fact:** the frontend does not call the FastAPI backend.

### 5.2 Integrity findings

- **Observed fact:** all audited JavaScript files pass `node --check`.
- **Observed fact:** Notebook image references resolve.
- **Observed fact:** three Labs video references do not resolve: `scada-demo.mp4`, `opcua-node-red.mp4`, and `industrial-ai-assistant.mp4`.
- **Observed fact:** multiple tracked images and videos have no source reference in the active repository.
- **Observed fact:** tracked asset names mix generic names, domain names, capitalization, Spanish abbreviations, and implementation-oriented names.
- **Observed fact:** CSS contains literal colors outside `brand.css`, notably in `exhibition.css` and `viewer.css`.
- **Observed fact:** `Backend/__pycache__/main.cpython-313.pyc` is tracked.
- **Observed fact:** root validation screenshots are tracked.

### 5.3 Governance findings

- **Observed fact:** there is no `.gitignore`, dependency manifest, automated test suite, CI configuration, or machine-enforced architecture check.
- **Observed fact:** no frontend package or build manifest exists; the frontend runs directly as browser ES Modules.
- **Observed fact:** no Python requirements or project manifest declares FastAPI dependencies.
- **Observed fact:** documentation still identifies Home as Labs and the application as Labs/Notebook/About.
- **Observed fact:** the active interface and `site.js` identify Engineering Notes/Academy/About.
- **Observed fact:** `02_DesignLanguage.md` and `08_BrandBook.md` specify blue accents, while `brand.css` uses copper and repository instructions define copper as the identity color.
- **Observed fact:** `07_FileArchitecture.md` lists paths that do not exist or were later removed.

## 6. Strengths

1. The browser application uses native ES Modules and has no framework lock-in.
2. Content is substantially separated from rendering through `Frontend/data/`.
3. UI responsibilities are already divided into focused component files.
4. CSS has an explicit import entry point and named modules.
5. `brand.css` and `variables.css` establish a usable token-and-alias model.
6. Article content is structured as data blocks rather than stored as component markup.
7. Article and Lab viewers include focus trapping, Escape handling, lifecycle cleanup, and focus return.
8. Routing and render fallback behavior are deterministic.
9. The minimal `index.html` shell supports an evolutionary architecture.
10. The repository is sufficiently small to migrate through reversible packages.

## 7. Architectural risks

| Risk | Evidence | Impact | Priority |
|---|---|---|---|
| Documentation/runtime divergence | Labs-first documents versus Notes-first runtime | Engineers change the wrong SSOT or restore obsolete behavior | Critical |
| Application-controller concentration | Routing, view rendering, modal lifecycle, animation, validation, and titles in `app.js` | Product changes collide in one file | High |
| Ambiguous inactive Labs code | Data/components/styles remain but are disconnected | Accidental deletion or accidental reactivation | High |
| Undefined product boundaries | Academy rendering and content are mixed into site/controller files | Academy growth increases coupling | High |
| Undefined shared engines | Dialog and focus behavior are duplicated between viewers | Divergent accessibility behavior | Medium |
| Broken asset references | Three missing Labs videos | Broken media if Labs is reactivated | High |
| Unmanaged generated files | No `.gitignore`; bytecode and screenshots tracked | Repository pollution and noisy reviews | High |
| CSS token violations | Literal colors outside `brand.css` | Brand drift and SSOT violations | Medium |
| Prototype backend ambiguity | Unused API with sample data and permissive CORS | False production expectations and security mistakes | High |
| No automated verification | No tests or CI | Refactors rely only on manual inspection | High |
| No dependency declaration | FastAPI imports without a manifest | Backend is not reproducible | Medium |

## 8. Frontend assessment

### Observed facts

The frontend is a browser-native single-page application. `index.html` is appropriately minimal. `styles.css` is the CSS entry point. `app.js` is both bootstrap and application controller. Hash routing avoids server rewrite requirements and preserves deep-link state within the current deployment model.

### Assessment

The technology choice is appropriate for current scale. The weakness is not vanilla JavaScript; it is the lack of explicit boundaries within it. Product composition, shared UI, routing, and data ownership can be separated with ES Modules without adding a build system.

### Decision

The repository will retain `Frontend/` as the deployable frontend root. It will not migrate to top-level `apps/` and `packages/` now. That convention normally implies multiple independently built artifacts and package-level dependency management, neither of which exists today.

Within `Frontend/`, product boundaries will evolve under `products/`, and product-neutral reusable behavior will evolve under `shared/`. This gives the platform clear ownership without pretending it is already a monorepo.

## 9. Backend assessment

### Observed facts

`Backend/main.py` creates a FastAPI application titled “SCADA Web API,” creates a media directory at import time, allows all CORS origins, mounts media, exposes a health-like root response, and exposes sample video and post arrays. No frontend module consumes these endpoints. No dependency or runtime manifest exists.

### Decision

The backend is classified as an **isolated prototype**, not as the platform API. It remains in `Backend/` during RFC-002 unless a dedicated backend RFC establishes a real consumer, API contract, configuration policy, dependency declaration, and operational owner.

It must not be moved into a shared engine. Shared engines are frontend or platform-neutral behavior, not a label for an unused service.

### Deferred work

- Product Owner decision on retaining or archiving the prototype.
- API contract and security design if a frontend requirement emerges.
- Dependency and execution manifest after, not before, a confirmed backend role.

## 10. JavaScript architecture

### Observed facts

`app.js` currently owns startup validation, route parsing, navigation, title selection, Engineering Notes rendering, Academy rendering, article viewer lifecycle, reveal animation lifecycle, and application composition.

Viewer modules independently implement near-equivalent dialog activation, focus queries, focus trapping, body locking, destruction, and return-focus behavior.

### Decision

JavaScript dependencies will follow this direction:

```text
app bootstrap
  → application shell/router
    → product public modules
      → shared components and shared engines
        → product or global data passed by callers
```

Lower layers must not import `app.js`. Shared modules must not import product modules. Product modules may depend on shared modules, but not on sibling products. Cross-product navigation is application-shell responsibility.

`app.js` will eventually retain only bootstrap, top-level composition, and fatal startup handling. Extraction must preserve behavior exactly and occur one responsibility at a time.

## 11. CSS architecture

### Observed facts

The CSS entry point imports modular files. `brand.css` contains identity and primitive design tokens; `variables.css` maps aliases. Layout and responsive ownership overlap: `layout.css` contains media queries while `responsive.css` also owns cross-module breakpoints. Product styles are partly identifiable but are not colocated with product boundaries.

Literal colors occur outside `brand.css`, including `#111`, `#000`, and `rgba(...)` declarations in Labs-related styles. These violate the repository rule even when visually intentional.

### Decision

- `brand.css` remains the sole owner of colors, typography primitives, global spacing primitives, and motion primitives.
- `variables.css` remains a compatibility alias layer during migration; it must not define competing literal values.
- `base.css` owns document-level resets and global behavior.
- Shared component styles own only shared component selectors.
- Product style files own product selectors.
- A selector should have one primary owning module.
- Responsive rules should live with their owning module when practical. `responsive.css` may temporarily remain as a compatibility layer and should shrink incrementally.
- CSS movement and token correction are separate packages so a move does not silently change appearance.

## 12. Data architecture

### Observed facts

`site.js` owns metadata, navigation, home content, Engineering Notes introduction, Academy content, About content, SEO, and links. `notebook.js` owns structured Engineering Notes publications. `labs.js` owns disconnected laboratory records. JSDoc supplies informal schemas. Legacy Notebook fields remain supported.

### Decision

Data remains static ES Module data until a concrete requirement proves otherwise. No CMS, database, or serialization layer is justified.

The following boundaries apply:

- global identity, navigation, global SEO defaults, and global links remain global site data;
- Engineering Notes publications belong to the Engineering Notes product;
- Academy content belongs to the Academy product;
- About editorial content may remain global website content until it gains independent lifecycle needs;
- Labs records remain a preserved inactive product dataset pending a Product Owner decision;
- components receive data; they do not become content SSOTs.

Schema changes require a separate migration package and compatibility plan. This RFC does not remove legacy fields.

## 13. Components architecture

### Observed facts

Current components are relatively focused. `navbar.js` is shared application chrome. `about.js` is website content rendering. Notebook card and Article viewer belong to Engineering Notes. Lab card and Lab viewer belong to the inactive Labs capability.

### Decision

Components are classified by ownership:

- **Shared:** usable across products without product vocabulary or product data imports.
- **Editorial Website:** global shell, About, and composition-specific UI.
- **Engineering Notes:** Note cards, article rendering, and Note-specific presentation.
- **Academy:** Academy-specific rendering once extracted from `app.js`.
- **Labs:** preserved inactive components until the product direction is approved.

Dialog mechanics may become a shared engine only after both existing viewers are characterized by tests. Product-specific viewer markup remains in its product.

## 14. Assets assessment

### Observed facts

Brand assets are separated from images and videos. Notebook images already have a product subfolder. Several root image/video assets are unreferenced. Three Labs video references are missing. Asset names are inconsistent.

### Decision

No asset will be removed solely because it is currently unreferenced. An unreferenced file can be unpublished content, source material, or future content; the audit proves absence of references, not lack of ownership.

RFC-002 will first create an asset inventory recording path, current reference status, proposed owner, and disposition. Missing Labs videos will be treated as data-integrity defects: either the Product Owner supplies the files, corrects the references, or explicitly marks video as unavailable. Placeholder media must not be invented.

Asset renaming is deferred until ownership is approved because every rename changes references and may affect external links. New names should be lowercase kebab-case and product-scoped.

## 15. Documentation assessment

### Observed facts

The numbered documentation set gives the project a useful baseline but is materially inconsistent with runtime behavior and current brand direction. `07_FileArchitecture.md` is detailed but stale. The changelog records a Labs/Notebook/About controller that the active code no longer implements. The documentation lacks decision status and supersession markers.

### Decision

This RFC supersedes conflicting repository-architecture statements in `03_FrontendArchitecture.md` and `07_FileArchitecture.md`, but does not silently rewrite them. A dedicated documentation package will reconcile them and mark historical claims clearly. Product vision and roadmap changes require Product Owner approval and are not inferred from code.

Architecture RFCs will live in `docs/` and use stable identifiers. `06_Changelog.md` records implemented changes, not proposals.

## 16. Tooling and quality assessment

### Observed facts

There is no `.gitignore`, test suite, CI, dependency manifest, or architecture enforcement. JavaScript syntax can be checked with the already available Node executable, but Node is not declared as a project dependency. Browser validation has been performed manually and left generated artifacts.

### Decision

Quality tooling will be introduced in layers without adding dependencies:

1. repository hygiene through `.gitignore`;
2. documented native syntax and reference checks;
3. a dependency-free browser smoke-test strategy using current routes and behaviors;
4. CI only after the commands are deterministic and approved;
5. lightweight architectural checks only when stable boundaries exist.

A frontend dependency manifest is not required merely to run static ES Modules. A backend dependency manifest is required before the backend can be called reproducible, but its exact format is deferred to the backend-role decision. No empty or misleading manifest should be added simply to satisfy convention.

## 17. Target repository architecture

### Architectural decision

The target is an evolutionary single-repository architecture, not a monorepo:

```text
Web-Digital2RealV2/
├── .gitignore
├── AGENTS.md
├── Backend/                         # isolated prototype pending a backend RFC
│   └── main.py
├── Frontend/                        # one browser-deployable application root
│   ├── assets/
│   │   ├── brand/
│   │   ├── images/
│   │   │   ├── engineering-notes/
│   │   │   └── labs/                # only after inventory/ownership approval
│   │   └── videos/
│   │       └── labs/                # only after inventory/ownership approval
│   ├── components/                  # temporary compatibility location
│   ├── data/                        # temporary compatibility location and global data
│   │   └── site.js
│   ├── products/
│   │   ├── editorial-website/
│   │   │   ├── components/
│   │   │   └── styles/
│   │   ├── engineering-notes/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── styles/
│   │   │   └── index.js             # product public API when justified
│   │   ├── academy/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── styles/
│   │   │   └── index.js
│   │   └── labs/
│   │       ├── components/
│   │       ├── data/
│   │       └── styles/
│   ├── shared/
│   │   ├── components/
│   │   ├── engines/
│   │   │   ├── dialog.js            # only after characterization
│   │   │   ├── reveal.js
│   │   │   └── router.js
│   │   └── styles/
│   ├── styles/
│   │   ├── brand.css                # visual identity SSOT
│   │   ├── variables.css            # compatibility aliases
│   │   └── base.css
│   ├── app.js                        # bootstrap and top-level composition
│   ├── index.html
│   └── styles.css                    # CSS import entry point
└── docs/
    ├── RFC-001_RepositoryArchitecture.md
    ├── RFC-002_RepositoryRefactor.md # migration report, when implemented
    └── existing numbered documents
```

Empty directories must not be created. A target directory appears only in the package that moves or creates an owned file. `assistant/` is absent from the implemented target until an Assistant requirement exists; an empty placeholder would falsely imply an architecture and runtime contract.

### Why not top-level `apps/` and `packages/`

There is currently one frontend artifact, no package manager, no workspace dependency graph, and no independent product deployments. Top-level `apps/` and `packages/` would add ceremony without solving a current runtime problem. This decision must be revisited only if at least two independently built or deployed applications exist, or shared code requires explicit versioned package boundaries.

## 18. Folder responsibility rules

| Folder | Responsibility | Prohibited responsibility |
|---|---|---|
| `Frontend/` | Deployable static browser application | Backend runtime and generated validation output |
| `Frontend/products/<product>/` | Product-owned rendering, data, and styles | Imports from sibling products |
| `Frontend/shared/components/` | Product-neutral visible UI | Product content or product-specific terminology |
| `Frontend/shared/engines/` | Product-neutral behavior and lifecycle logic | DOM presentation tied to one product or content data |
| `Frontend/data/` | Global cross-product site data during transition | Product publications after their move |
| `Frontend/styles/` | Brand, aliases, base rules, transitional entry modules | New product-specific selectors after product extraction |
| `Frontend/assets/` | Static, inventoried, owned media | Generated browser profiles and test screenshots |
| `Backend/` | Isolated API prototype pending decision | Assumed production platform API |
| `docs/` | Architecture, product, data, brand, and change records | Runtime source or generated reports |

Every file must have one primary owner. Transitional paths are permitted only when a migration package states the exit condition.

## 19. Dependency and import rules

1. All browser imports remain relative ES Module imports with explicit `.js` extensions.
2. `app.js` may import product public modules and shared shell modules.
3. Product modules may import their own data/components/styles and shared modules.
4. Product modules must not import from sibling product directories.
5. Shared modules must not import product modules or product data.
6. Data modules must not import rendering components.
7. Components must not mutate imported SSOT data.
8. Shared engines expose behavior through functions or lifecycle objects; they do not own product markup.
9. CSS import order remains explicit in `styles.css`: tokens/aliases, base, shared, product, compatibility responsive rules.
10. Moves must update every importer in the same migration package. A package must not leave compatibility imports broken between commits.
11. No path alias, bundler-specific import, bare browser import, or generated barrel is introduced without a concrete runtime need.
12. The frontend must not begin consuming `Backend/` until an API contract is approved.

## 20. Single Source of Truth map

| Concern | Current SSOT | Target SSOT | Status |
|---|---|---|---|
| Brand colors and visual primitives | `Frontend/styles/brand.css` | Same | Confirmed decision |
| CSS compatibility aliases | `Frontend/styles/variables.css` | Same until retired by RFC | Transitional decision |
| Global site identity/navigation/SEO/links | `Frontend/data/site.js` | Same | Confirmed decision |
| Engineering Notes publications | `Frontend/data/notebook.js` | `Frontend/products/engineering-notes/data/notes.js` | Proposed move; naming requires package approval |
| Academy content | Academy object in `Frontend/data/site.js` | `Frontend/products/academy/data/academy.js` | Approved boundary; extraction proposed |
| About content | About object in `Frontend/data/site.js` | Remains in `site.js` initially | Deferred separation |
| Labs records | `Frontend/data/labs.js` | `Frontend/products/labs/data/labs.js` | Preserved inactive product |
| Global navigation UI | `Frontend/components/navbar.js` | `Frontend/shared/components/navbar.js` | Proposed move |
| Engineering Notes rendering | Notebook/Article components and `app.js` | Engineering Notes product | Approved boundary |
| Academy rendering | `Frontend/app.js` | Academy product | Approved boundary |
| Dialog behavior | Duplicated in two viewers | `Frontend/shared/engines/dialog.js` | Conditional after tests |
| Routing behavior | `Frontend/app.js` | `Frontend/shared/engines/router.js` | Proposed extraction |
| Reveal behavior | `Frontend/app.js` | `Frontend/shared/engines/reveal.js` | Proposed extraction |
| Backend API contract | None | Deferred backend RFC | Explicitly absent |
| Repository architecture | This RFC | This RFC until superseded | Confirmed decision |

The target name `notes.js` improves domain terminology but is not mandatory; retaining `notebook.js` is acceptable if the Product Owner keeps “Notebook” as the public content model.

## 21. Keep / Refactor / Move / Remove / Future classification

| Item | Classification | Rationale |
|---|---|---|
| `Frontend/index.html` | Keep | Correct minimal shell |
| `Frontend/styles.css` | Keep/refactor imports | Required browser CSS entry point |
| `Frontend/app.js` | Refactor | Excessive orchestration responsibilities |
| `Frontend/styles/brand.css` | Keep | Official visual SSOT |
| `Frontend/styles/variables.css` | Keep transitional | Stable alias compatibility |
| `Frontend/styles/base.css` | Keep | Appropriate global responsibility |
| `site.js` | Keep/refactor | Global SSOT; Academy data must later move |
| Notebook data/components/styles | Move | Engineering Notes product ownership |
| Academy rendering/data/styles | Refactor/move | Establish explicit Academy boundary without new behavior |
| Navbar | Move | Shared application component |
| About component/styles | Move | Editorial Website ownership |
| Labs data/components/styles | Move/preserve | Verified disconnected but potentially intentional capability |
| Dialog lifecycle duplication | Future refactor | Needs characterization before shared extraction |
| Reveal and routing logic | Refactor/move | Product-neutral engines currently in controller |
| `Backend/main.py` | Keep isolated | Prototype status; no evidence supports removal |
| Tracked Python bytecode | Remove | Generated interpreter artifact, not source |
| Tracked validation screenshots | Keep pending owner decision | Audit proves generated/reference role but not whether they are approved evidence |
| Untracked browser profiles | Remove from worktree as hygiene; ignore | Generated local state; deletion requires explicit execution approval |
| Missing video references | Refactor data or supply assets | Broken references verified; resolution requires owner input |
| Unreferenced assets | Keep/inventory | Non-reference alone does not prove obsolescence |
| Hardcoded CSS colors | Refactor | Violates confirmed brand SSOT rule |
| `.gitignore` | Create | Current repository hygiene requirement |
| Test strategy | Future/create incrementally | Required before risky extraction |
| CI | Future | Add only after deterministic local checks exist |
| Frontend dependency manifest | Do not create now | No current dependency/runtime requirement |
| Backend dependency manifest | Future conditional | Required if backend is retained as runnable product code |
| Assistant directory/code | Future | No current functionality exists to move |

No source file is approved for removal by this RFC other than tracked generated Python bytecode. Validation screenshots require Product Owner disposition because they may be intentional visual evidence.

## 22. Migration strategy

Migration follows these rules:

1. **Document before moving.** RFC-002 records the exact path map and result of each package.
2. **Stabilize hygiene and checks first.** Generated artifacts and deterministic validation must be addressed before structural work.
3. **Characterize behavior before extraction.** Current routes, titles, dialogs, keyboard behavior, scroll behavior, article rendering, and responsive rendering form the preservation baseline.
4. **Move coherent vertical slices.** Data, component, style, and required import changes move together where they fit the five-file limit.
5. **Separate moves from behavior changes.** Pure moves update paths only. Token fixes or controller extractions are separate packages.
6. **Keep every commit runnable.** Each commit contains a complete package or an independently runnable subset explicitly defined by RFC-002.
7. **Prefer `git mv`.** History-preserving moves are preferred over delete-and-recreate operations.
8. **Do not create empty architecture.** Directories appear only with real files.
9. **Do not resolve product questions technically.** Labs activation, missing video choice, Assistant scope, and backend role require Product Owner decisions.
10. **Validate after every package.** Syntax, import resolution, asset references, route smoke tests, dialog keyboard behavior, and visual comparison are proportional to the package.

## 23. Migration packages

The packages below are the approved planning sequence. Exact commits may split a package further to retain a runnable state, but must not combine packages if that exceeds five changed paths or obscures responsibility.

### Package 01 — Repository hygiene baseline

**Objective:** prevent new generated artifacts and remove the verified tracked Python bytecode artifact.

- **Files created:** `.gitignore`
- **Files modified:** none
- **Files moved:** none
- **Files removed:** `Backend/__pycache__/main.cpython-313.pyc`
- **Files explicitly not touched:** all source files, validation screenshots, assets, documentation other than the later migration report
- **Risks:** an overly broad ignore pattern could hide intentional media or validation evidence
- **Validation procedure:** inspect `git check-ignore` for Python caches, browser profiles, local server files, and root validation output; confirm source/assets remain visible to Git; run `git status --short`

### Package 02 — RFC-002 migration ledger

**Objective:** create the implementation record and exact move ledger before structural changes.

- **Files created:** `docs/RFC-002_RepositoryRefactor.md`
- **Files modified:** `docs/06_Changelog.md` only when the first implementation package lands
- **Files moved:** none
- **Files removed:** none
- **Files explicitly not touched:** frontend, backend, assets, existing architecture documents
- **Risks:** the ledger can drift if not updated with every completed package
- **Validation procedure:** compare package entries with `git diff --name-status` and confirm no implementation claims are recorded prematurely

### Package 03 — Native validation baseline

**Objective:** document deterministic, dependency-free checks and the manual smoke-test matrix before moves.

- **Files created:** one validation document under `docs/` or one dependency-free validation script, selected during RFC-002
- **Files modified:** none unless RFC-002 records the chosen command
- **Files moved:** none
- **Files removed:** none
- **Files explicitly not touched:** runtime source, styles, data, assets, backend behavior
- **Risks:** a documentation-only test strategy can be inconsistently executed; a script must remain platform-conscious
- **Validation procedure:** run `node --check` for all frontend JavaScript, verify relative imports and local asset references, serve `Frontend/`, and exercise `#engineering-notes`, `#academy`, `#about`, invalid-hash fallback, article open/close, Escape, Tab containment, focus return, and reduced motion

### Package 04 — Documentation truth reconciliation

**Objective:** resolve Notes-first runtime versus Labs-first documentation without rewriting product history.

- **Files created:** none
- **Files modified:** `docs/00_ProjectVision.md`, `docs/01_ProductBlueprint.md`, `docs/03_FrontendArchitecture.md`, `docs/07_FileArchitecture.md`, `docs/08_BrandBook.md`
- **Files moved:** none
- **Files removed:** none
- **Files explicitly not touched:** source code, assets, `docs/04_DataModel.md`, roadmap, changelog
- **Risks:** product vision wording and public taxonomy require Product Owner confirmation; five files reach the package maximum
- **Validation procedure:** cross-check route names, current source paths, copper brand SSOT, RFC supersession markers, and absence of claims that Assistant or Labs are active

### Package 05 — Shared navbar boundary

**Objective:** move the verified cross-product navigation component without behavior changes.

- **Files created:** none
- **Files modified:** `Frontend/app.js`
- **Files moved:** `Frontend/components/navbar.js` → `Frontend/shared/components/navbar.js`
- **Files removed:** none beyond the move source path
- **Files explicitly not touched:** navbar CSS, site data, product components, brand markup, assets
- **Risks:** broken relative import; accidental logo alteration
- **Validation procedure:** syntax/import checks; verify every route, active state, brand navigation, keyboard focus, and unchanged DOM/CSS classes

### Package 06 — Engineering Notes data and card boundary

**Objective:** establish the Engineering Notes product with its content SSOT and list component.

- **Files created:** none
- **Files modified:** `Frontend/app.js`
- **Files moved:** `Frontend/data/notebook.js` → `Frontend/products/engineering-notes/data/notebook.js`; `Frontend/components/notebookCard.js` → `Frontend/products/engineering-notes/components/notebookCard.js`
- **Files removed:** none beyond move source paths
- **Files explicitly not touched:** article viewer, CSS, content values, schemas, image paths, site data
- **Risks:** relative asset paths are interpreted by the document, not module location, but careless rewriting could break them; import paths may fail
- **Validation procedure:** syntax/import and image-reference checks; compare Note order, metadata, titles, thumbnails, and card activation

### Package 07 — Engineering Notes viewer boundary

**Objective:** move Article viewer ownership into Engineering Notes without changing dialog behavior.

- **Files created:** none
- **Files modified:** `Frontend/app.js`
- **Files moved:** `Frontend/components/articleViewer.js` → `Frontend/products/engineering-notes/components/articleViewer.js`
- **Files removed:** none beyond the move source path
- **Files explicitly not touched:** viewer logic, Labs viewer, Notebook data, styles
- **Risks:** import failure or accidental lifecycle change during the move
- **Validation procedure:** article open/close, backdrop, close button, Escape, Tab/Shift+Tab containment, body scroll lock, focus return, and article block rendering

### Package 08 — Engineering Notes CSS boundary

**Objective:** move Note and Article presentation into product ownership without changing selectors or values.

- **Files created:** none
- **Files modified:** `Frontend/styles.css`
- **Files moved:** `Frontend/styles/notebook.css` → `Frontend/products/engineering-notes/styles/engineering-notes.css`
- **Files removed:** none beyond the move source path
- **Files explicitly not touched:** selectors, declarations, responsive behavior, brand tokens, HTML/JavaScript
- **Risks:** CSS import order or URL resolution change
- **Validation procedure:** compare desktop/mobile screenshots for Notes list and Article viewer; confirm computed styles and reduced-motion behavior

### Package 09 — Editorial Website About boundary

**Objective:** assign About rendering and styling to the Editorial Website product.

- **Files created:** none
- **Files modified:** `Frontend/app.js`, `Frontend/styles.css`
- **Files moved:** `Frontend/components/about.js` → `Frontend/products/editorial-website/components/about.js`; `Frontend/styles/about.css` → `Frontend/products/editorial-website/styles/about.css`
- **Files removed:** none beyond move source paths
- **Files explicitly not touched:** About content in `site.js`, layout selectors, navigation, UI copy
- **Risks:** import-order or path errors; existing overlap between `about.css` and `layout.css` remains technical debt
- **Validation procedure:** syntax/import checks and visual comparison of `#about` at desktop/mobile widths

### Package 10 — Academy product boundary

**Objective:** extract current Academy rendering and data into an owned product without adding Academy functionality.

- **Files created:** `Frontend/products/academy/components/academy.js`, `Frontend/products/academy/data/academy.js`
- **Files modified:** `Frontend/app.js`, `Frontend/data/site.js`
- **Files moved:** none; existing inline rendering/data are extracted
- **Files removed:** none
- **Files explicitly not touched:** Academy copy values, layout/CSS, navigation labels, status, assets, backend
- **Risks:** this is a behavior-preserving extraction rather than a pure move; unsafe HTML construction and data validation must not be silently redesigned
- **Validation procedure:** compare Academy DOM, text, list order, title, route behavior, screenshots, and responsive presentation before and after

### Package 11 — Labs inactive product boundary

**Objective:** preserve disconnected Labs code as an explicitly inactive product rather than dead-looking global code.

- **Files created:** none
- **Files modified:** `Frontend/styles.css`
- **Files moved:** `Frontend/data/labs.js` → `Frontend/products/labs/data/labs.js`; `Frontend/components/labCard.js` → `Frontend/products/labs/components/labCard.js`; `Frontend/components/labViewer.js` → `Frontend/products/labs/components/labViewer.js`; `Frontend/styles/exhibition.css` → `Frontend/products/labs/styles/exhibition.css`
- **Files removed:** none beyond move source paths
- **Files explicitly not touched:** `app.js`, navigation, Labs data values, missing video references, `viewer.css`, assets
- **Risks:** five paths reach the package maximum; globally imported inactive CSS remains; the viewer style moves separately to keep the package bounded
- **Validation procedure:** JavaScript syntax and import scan; confirm no active runtime import is introduced; compare CSS import order

### Package 12 — Labs viewer CSS boundary

**Objective:** complete Labs style ownership without activating Labs.

- **Files created:** none
- **Files modified:** `Frontend/styles.css`
- **Files moved:** `Frontend/styles/viewer.css` → `Frontend/products/labs/styles/viewer.css`
- **Files removed:** none beyond the move source path
- **Files explicitly not touched:** Labs JavaScript/data, routes, assets, CSS declarations
- **Risks:** path/import error; class-name overlap must remain unchanged
- **Validation procedure:** CSS reference check; temporary isolated component characterization only if already available—do not add a route or feature to test it

### Package 13 — Reveal engine extraction

**Objective:** remove product-neutral reveal lifecycle responsibility from `app.js`.

- **Files created:** `Frontend/shared/engines/reveal.js`
- **Files modified:** `Frontend/app.js`
- **Files moved:** reveal observer logic from controller to engine
- **Files removed:** none
- **Files explicitly not touched:** CSS reveal rules, timings, thresholds, root margin, view markup
- **Risks:** observer cleanup or reduced-motion behavior can regress
- **Validation procedure:** validate repeated route changes, observer disconnection, reveal completion, browsers without `IntersectionObserver`, and reduced-motion behavior

### Package 14 — Router engine extraction

**Objective:** isolate hash parsing and navigation mechanics while preserving all current routes and fallback behavior.

- **Files created:** `Frontend/shared/engines/router.js`
- **Files modified:** `Frontend/app.js`
- **Files moved:** hash decode, validation, hash-change subscription, and navigation mechanics
- **Files removed:** none
- **Files explicitly not touched:** navigation data, route names, view renderers, document titles, scroll semantics
- **Risks:** startup render, same-route scrolling, malformed hash fallback, or event cleanup can change
- **Validation procedure:** exercise all valid routes, malformed encoding, unknown route, initial load, browser back/forward, same-route activation, and titles

### Package 15 — Product renderer extraction

**Objective:** reduce `app.js` to bootstrap/composition by exposing current Engineering Notes and Academy renderers through product public modules.

- **Files created:** `Frontend/products/engineering-notes/index.js`, `Frontend/products/academy/index.js`
- **Files modified:** `Frontend/app.js`
- **Files moved:** renderer composition from `app.js` into the owning product APIs
- **Files removed:** none
- **Files explicitly not touched:** business logic, content, CSS, route names, components, backend
- **Risks:** callbacks and article lifecycle can become circular or change ownership
- **Validation procedure:** complete frontend smoke matrix, syntax/import graph check, and before/after DOM comparison

### Package 16 — CSS token compliance

**Objective:** eliminate verified hardcoded color values outside the brand SSOT without visual change.

- **Files created:** none
- **Files modified:** `Frontend/styles/brand.css`, `Frontend/products/labs/styles/exhibition.css`, `Frontend/products/labs/styles/viewer.css`
- **Files moved:** none
- **Files removed:** none
- **Files explicitly not touched:** component logic, selectors, layout, active product colors, brand-primary value
- **Risks:** alpha or color substitution may alter appearance; some literal values may represent media canvas rather than brand semantics
- **Validation procedure:** enumerate CSS literals outside `brand.css`; compare computed colors and visual captures; require Product Owner visual acceptance for any non-identical rendering

### Package 17 — CSS responsive ownership

**Objective:** reduce cross-module selector ownership by moving responsive rules next to their owning modules without visual changes.

- **Files created:** none
- **Files modified:** up to four owning CSS modules plus `Frontend/styles/responsive.css` per commit
- **Files moved:** rule blocks only, not files
- **Files removed:** none unless `responsive.css` becomes empty in a later explicitly approved package
- **Files explicitly not touched:** token values, selectors, breakpoint values, JavaScript, HTML
- **Risks:** cascade order and specificity changes can cause subtle regressions
- **Validation procedure:** computed-style and screenshot comparison at 390, 700/720 boundary, 1080 boundary, and desktop widths

### Package 18 — Asset inventory and integrity disposition

**Objective:** document asset ownership and resolve broken references only through Product Owner-approved dispositions.

- **Files created:** `docs/09_AssetInventory.md`
- **Files modified:** at most one product data file if references are explicitly corrected; `docs/06_Changelog.md` if behavior changes
- **Files moved:** none in the inventory package
- **Files removed:** none in the inventory package
- **Files explicitly not touched:** all asset binaries until ownership is approved; active Note assets; UI code
- **Risks:** reference absence may be mistaken for obsolescence; binary moves can break external consumers
- **Validation procedure:** verify every source asset reference, record every tracked asset, confirm missing video disposition, and obtain Product Owner sign-off

### Package 19 — Asset normalization, conditional

**Objective:** move or rename only assets whose ownership and references were approved in Package 18.

- **Files created:** none
- **Files modified:** only the data/source files that reference moved assets, within the five-file maximum
- **Files moved:** approved asset paths, split into ≤5-path commits
- **Files removed:** only duplicates proven byte-identical and explicitly approved; otherwise none
- **Files explicitly not touched:** unowned assets, missing media without a supplied replacement, brand assets, unrelated products
- **Risks:** broken paths, external deep links, binary review limitations, case sensitivity across operating systems
- **Validation procedure:** asset reference scan, filesystem existence check, browser media load, and case-sensitive deployment check

### Package 20 — Dialog engine, conditional

**Objective:** consolidate duplicated modal lifecycle only after both viewers have characterization coverage and Labs disposition is known.

- **Files created:** `Frontend/shared/engines/dialog.js`
- **Files modified:** Engineering Notes Article viewer and Labs viewer
- **Files moved:** common focus/lifecycle behavior into the engine
- **Files removed:** duplicated private helpers only after equivalence is proven
- **Files explicitly not touched:** viewer markup, product content, styling, routes
- **Risks:** accessibility regression is high; the two viewers may have intentionally different behavior
- **Validation procedure:** automated or repeatable characterization of Escape, backdrop, focus trap, focus restoration, listener cleanup, double activation/destruction, and body locking for both viewers

### Package 21 — CI and architecture enforcement, conditional

**Objective:** run already-proven local checks in CI and enforce stable dependency direction.

- **Files created:** one CI workflow and, if necessary, one dependency-free architecture-check script
- **Files modified:** validation documentation and RFC-002 migration report
- **Files moved:** none
- **Files removed:** none
- **Files explicitly not touched:** runtime logic, UI, data, assets, backend deployment
- **Risks:** CI can imply unsupported runtime guarantees; platform-specific scripts can fail remotely
- **Validation procedure:** execute identical commands locally and in CI; intentionally test one invalid import in an isolated branch or temporary patch; confirm no package manager is required

## 24. Final recommended target structure

The final recommendation is the structure in Section 17, with these qualifications:

- retain the top-level `Frontend/`, `Backend/`, and `docs/` boundaries;
- organize the single browser application internally by `products/` and `shared/`;
- retain only global SSOTs and foundational styles at frontend root-level folders;
- keep Backend isolated until a real API requirement is approved;
- create no Assistant directory until the Assistant has an approved scope;
- preserve Labs as an inactive bounded product until Product decides whether it returns;
- create no empty folders, workspace packages, build system, or dependency manifest without a concrete runtime requirement.

## 25. Ordered migration package index

1. Repository hygiene baseline
2. RFC-002 migration ledger
3. Native validation baseline
4. Documentation truth reconciliation
5. Shared navbar boundary
6. Engineering Notes data and card boundary
7. Engineering Notes viewer boundary
8. Engineering Notes CSS boundary
9. Editorial Website About boundary
10. Academy product boundary
11. Labs inactive product boundary
12. Labs viewer CSS boundary
13. Reveal engine extraction
14. Router engine extraction
15. Product renderer extraction
16. CSS token compliance
17. CSS responsive ownership
18. Asset inventory and integrity disposition
19. Asset normalization — conditional
20. Dialog engine — conditional
21. CI and architecture enforcement — conditional

Packages 1–4 establish safety and truth. Packages 5–12 establish ownership primarily through moves. Packages 13–17 reduce controller and style debt. Packages 18–21 depend on explicit evidence or Product decisions and must not be treated as automatically authorized.

## 26. Explicit prerequisites for RFC-002

RFC-002 may begin only when:

1. this RFC is present and explicitly approved;
2. the working tree is clean or unrelated owner changes are identified and protected;
3. work occurs on an approved migration branch rather than directly on `main`, unless the Product Owner explicitly authorizes otherwise;
4. the exact files for the first package are listed, along with files not touched, and approved under repository workflow;
5. the current frontend smoke matrix has recorded baseline results;
6. each commit is limited to one coherent package or runnable subpackage and normally no more than five changed paths;
7. move commits use history-preserving operations and contain no business-logic or UI redesign changes;
8. every commit message records the structural decision, preserved behavior, validation performed, and any remaining debt;
9. missing videos, unused assets, Labs activation, Assistant scope, backend status, and validation screenshot disposition are not decided implicitly during refactoring;
10. RFC-002 maintains lists of moved, removed, created, and remaining-debt items.

## 27. Decision log

| ID | Decision | Reason |
|---|---|---|
| D-001 | The active product baseline is Notes-first: Engineering Notes, Academy, and About | Verified runtime behavior is authoritative for current functionality |
| D-002 | Labs is preserved as an inactive bounded product | Disconnection is verified, but obsolescence is not |
| D-003 | Academy receives its own product boundary inside `Frontend/products/academy/` | Its current content and renderer already represent a distinct lifecycle |
| D-004 | Keep the existing top-level `Frontend/` structure | One deployable browser application does not justify `apps/packages` or a monorepo |
| D-005 | Use internal `products/` and `shared/` boundaries | They express ownership using native ES Modules without new tooling |
| D-006 | Shared engines own product-neutral behavior only | Prevents “shared” from becoming an unbounded dumping ground |
| D-007 | Keep `brand.css`, `site.js`, and product data as explicit SSOTs | Preserves current strengths and prevents content duplication |
| D-008 | Treat Backend as an isolated prototype | It has no consumer, contract, manifest, or production configuration |
| D-009 | Do not remove unreferenced assets without ownership evidence | Lack of a source reference does not prove lack of value |
| D-010 | Resolve missing videos through Product disposition, not invented placeholders | Preserves data integrity and avoids feature/content invention |
| D-011 | Remove only verified generated Python bytecode by default | It is reproducible interpreter output, not source |
| D-012 | Separate structural moves from logic and visual changes | Makes regressions attributable and commits reversible |
| D-013 | Do not create an Assistant placeholder | No current implementation or contract exists |
| D-014 | Do not add frontend package/build tooling | No concrete current requirement supports it |
| D-015 | Add CI only after deterministic local checks | Automation should enforce proven commands, not invent a workflow |

## 28. Open questions requiring Product Owner approval

1. Is “Engineering Notes” the permanent product name and should `notebook.js` be renamed to `notes.js`, or is Notebook still an approved internal/public concept?
2. Is Labs a planned product to reactivate, an archive to preserve, or a capability to retire through a later RFC?
3. For each missing Labs video, should the file be supplied, the reference corrected, or video be explicitly optional?
4. Which currently unreferenced assets are source material, approved future content, historical evidence, or removable duplicates?
5. Are root validation screenshots permanent visual-regression evidence or disposable generated artifacts?
6. Should the FastAPI prototype be retained for exploration, archived, or developed only after a backend product requirement and separate RFC?
7. What is the minimum approved scope and consumer for the Digital2Real Assistant?
8. Does Academy remain a view within the single frontend deployment, or is there an approved future need for independent deployment? The current decision assumes one deployment.
9. Should About content remain in global `site.js`, or will Editorial Website content require an independent editorial lifecycle?
10. Which execution environment must dependency-free validation support: Windows only, or Windows plus Linux CI?

Until these questions are answered, RFC-002 must preserve current behavior and content and must treat the affected work as deferred or conditional.
