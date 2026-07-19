# RFC-002 — Repository Refactor

**Status:** In Progress — foundation only
**Governing RFC:** RFC-001 Repository Architecture
**Started:** 2026-07-19
**Current sprint:** SPRINT-001 Repository Foundation

---

## 1. Purpose

This document is the implementation ledger for the repository migration approved by RFC-001. It records completed packages, validation evidence, moved and removed files, and remaining technical debt.

It does not redefine RFC-001. A package may be implemented only after its exact file scope is approved.

## 2. Migration controls

- Preserve current functionality and presentation.
- Keep every package independently reviewable and runnable.
- Limit packages to five changed paths whenever possible.
- Prefer history-preserving moves over rewrites.
- Separate structural, behavioral, and visual changes.
- Update imports and references atomically with every future move.
- Do not create empty product or shared folders.
- Record validation and remaining debt after every package.

## 3. Sprint ledger

| Sprint | Scope | Status |
|---|---|---|
| SPRINT-001 | Repository foundation | In Progress |
| RFC-002 structural migration | Packages 05 onward from RFC-001 | Not Started |

## 4. Package ledger

| Package | Objective | Status | Behavior impact |
|---|---|---|---|
| TASK-001 | Repository hygiene | Completed | None |
| TASK-002 | RFC-002 migration ledger | Completed | None |
| TASK-003 | Validation baseline | Completed | None |
| TASK-004 | Documentation reconciliation | Completed | None |
| RFC-001 Package 05+ | Structural migration | Not Started | Must remain none unless separately approved |

## 5. Completed package records

### TASK-001 — Repository Hygiene

**Status:** Completed

**Created**

- `.gitignore`

**Removed**

- `Backend/__pycache__/main.cpython-313.pyc`

**Changed behavior**

- None. The removed file was generated Python bytecode.

**Validation**

- Confirm ignore rules cover Python caches, browser validation profiles, validation images, and common local artifacts.
- Confirm source files and tracked assets remain visible to Git.

### TASK-002 — RFC-002 Migration Ledger

**Status:** Completed

**Created**

- `docs/RFC-002_RepositoryRefactor.md`

**Changed behavior**

- None. Documentation only.

### TASK-003 — Validation Baseline

**Status:** Completed

**Created**

- `docs/VALIDATION_BASELINE.md`

**Changed behavior**

- None. Documentation only; no dependency or test framework was added.

### TASK-004 — Documentation Reconciliation

**Status:** Completed

**Modified**

- `docs/00_ProjectVision.md`
- `docs/01_ProductBlueprint.md`
- `docs/03_FrontendArchitecture.md`
- `docs/07_FileArchitecture.md`
- `docs/08_BrandBook.md`

**Changed behavior**

- None. Documentation now distinguishes the active Notes-first application from approved future migration boundaries.

## 6. Move ledger

No files have been moved. RFC-002 structural migration has not started.

| Original path | Target path | Package | Status |
|---|---|---|---|
| — | — | — | No moves |

## 7. Removal ledger

| Path | Reason | Package | Recoverability |
|---|---|---|---|
| `Backend/__pycache__/main.cpython-313.pyc` | Generated Python bytecode | TASK-001 | Regenerated automatically by Python |

No source, content, asset, or functionality file has been removed.

## 8. Validation ledger

| Check | SPRINT-001 result |
|---|---|
| JavaScript syntax | Passed — 10 files checked with `node --check` |
| Relative import resolution | Passed — all current relative imports resolve |
| Referenced local assets | Passed with three documented pre-existing Labs video exceptions |
| Route smoke tests | Not required — no frontend runtime file changed |
| UI comparison | Not required for documentation-only changes; runtime files unchanged |
| Git scope review | Passed — changes limited to the approved SPRINT-001 scope |

## 9. Remaining technical debt

- `Frontend/app.js` owns routing, rendering, modal lifecycle, animation, validation, and composition.
- Labs data, components, and styles are disconnected from the active application.
- Three Labs video references point to missing files.
- Unreferenced assets do not yet have an approved ownership inventory.
- Literal colors remain outside `Frontend/styles/brand.css`.
- Responsive CSS ownership overlaps across modules.
- There is no automated test suite or CI enforcement.
- The backend prototype has no approved product role or dependency manifest.
- Product and shared-engine boundaries approved by RFC-001 are not implemented.

## 10. Structural migration gate

Structural migration remains blocked until a later approved sprint explicitly authorizes the relevant RFC-001 packages. SPRINT-001 does not move, rename, or restructure any source file or folder.
