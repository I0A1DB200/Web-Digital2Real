# Changelog

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
