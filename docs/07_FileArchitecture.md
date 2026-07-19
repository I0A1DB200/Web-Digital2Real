# Digital2Real — File Architecture

**Version:** 2.0
**Status:** Current repository map
**Architecture authority:** `RFC-001_RepositoryArchitecture.md`

## 1. Purpose

This document describes the repository as it exists now. It does not define the future migration structure.

RFC-001 contains the approved target architecture. RFC-002 records implementation progress. Until a migration package is completed, current paths remain authoritative.

## 2. Current Structure

```text
Web-Digital2RealV2/
├── Backend/
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
└── docs/
```

## 3. Repository Responsibilities

### `Frontend/`

The single browser-deployable application root.

### `Backend/`

An isolated FastAPI prototype. It is not consumed by the active frontend and is not an approved platform API.

### `docs/`

Project governance, product documentation, architecture decisions, implementation records, and status.

## 4. Current Frontend SSOTs

| Concern | Current source of truth |
|---|---|
| Visual identity | `Frontend/styles/brand.css` |
| Global site information | `Frontend/data/site.js` |
| Laboratories | `Frontend/data/labs.js` |
| Engineering Notes | `Frontend/data/notebook.js` |
| Navbar | `Frontend/components/navbar.js` |
| Lab card | `Frontend/components/labCard.js` |
| Lab viewer | `Frontend/components/labViewer.js` |
| About rendering | `Frontend/components/about.js` |
| CSS imports | `Frontend/styles.css` |

These paths remain official until an approved move is completed. Do not duplicate their data or responsibility at proposed target paths.

## 5. Current Runtime Status

### Active

- Engineering Notes data, card, viewer, and styles
- Academy data and rendering
- About data, rendering, and styles
- Navbar, routing, layout, brand, and base styles

### Preserved but disconnected

- Labs data
- Lab card
- Lab viewer
- Labs exhibition and viewer styles

Disconnected Labs styles remain imported by the global CSS entry point. This is known technical debt, not authorization to remove or activate Labs.

### Not implemented

- Digital2Real Assistant
- Shared Engines directory
- Product directories approved by RFC-001

Empty future directories must not be created.

## 6. Modification Rules

1. Define the objective and authoritative SSOT.
2. List exact files changed and files explicitly not touched.
3. Obtain approval before modification.
4. Keep a package to five changed paths whenever possible.
5. Preserve behavior unless an approved requirement changes it.
6. Keep data separate from rendering.
7. Do not hardcode colors outside `Frontend/styles/brand.css`.
8. Do not duplicate current files at future target paths.
9. Update every import and reference atomically with a future move.
10. Validate and document every completed package.

## 7. Current Common Tasks

### Change brand identity

Modify the relevant tokens in `Frontend/styles/brand.css` and reconcile `docs/08_BrandBook.md` when the identity decision changes.

### Add an Engineering Note

Modify `Frontend/data/notebook.js` and add owned images beneath `Frontend/assets/images/notebook/`.

### Change global site information

Modify `Frontend/data/site.js`.

### Change the active navbar

Modify `Frontend/components/navbar.js` and, when presentation changes, `Frontend/styles/navbar.css`.

### Change About

Use `Frontend/data/site.js`, `Frontend/components/about.js`, and the owning CSS modules according to the approved scope.

### Change Labs

Labs is disconnected. Any activation, retirement, or content repair requires explicit Product Owner approval before modifying Labs files.

## 8. Migration Rule

Do not implement the RFC-001 target structure directly from this document. Follow the approved packages and live move ledger in `RFC-002_RepositoryRefactor.md`.
