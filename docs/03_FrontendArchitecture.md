# Frontend Architecture

**Status:** Current implementation baseline
**Target architecture:** `RFC-001_RepositoryArchitecture.md`

## Runtime Model

Digital2Real currently runs as one browser-native single-page application using:

- semantic HTML;
- modular CSS;
- vanilla JavaScript;
- native ES Modules;
- hash-based routing;
- static data modules.

There is no frontend framework, package manager, build system, or runtime dependency manifest.

## Current Entry Points

- `Frontend/index.html` is the minimal document shell.
- `Frontend/app.js` is the bootstrap and application controller.
- `Frontend/styles.css` is the CSS import entry point.

## Active Views

- `engineering-notes`
- `experience-lab`
- `about`

Engineering Notes is the default and fallback view.

## Current Responsibilities

`Frontend/app.js` currently owns:

- startup validation;
- route parsing and navigation;
- view selection and rendering;
- document titles;
- Article viewer lifecycle;
- reveal animation lifecycle;
- top-level application composition.

Route parsing/formatting is owned by `Frontend/navigation/labRoutes.js`. The app remains the composition and browser-history owner. Product presentation/session responsibilities stay in their product workspace.

## Current Module Boundaries

- `Frontend/components/` contains active shared/product components and disconnected Labs components.
- `Frontend/data/` contains global site data, Engineering Notes content, and disconnected Labs data.
- `Frontend/styles/` contains brand, base, layout, active product, and disconnected Labs styles.
- `Frontend/assets/` contains brand resources, images, and videos.

## Approved Direction

RFC-001 approves an evolutionary internal separation into product-owned and shared modules while retaining `Frontend/` as the single deployable application root.

Current product components live under `Frontend/products/`; shared components remain under `Frontend/components/`. This navigation update does not move product roots or alter Headless Player contracts.

## Browser navigation and content scrolling (2026-11-26)

The application owns hash/history integration, validated route application, outgoing scroll/focus capture and restoration. `labRoutes.js` owns pure route parsing/formatting and parent relationships. URL hashes preserve repository-subpath hosting on GitHub Pages.

- `#engineering-notes`, `#about`: primary views.
- `#experience-lab`: environment catalog (standalone simulators remain independent).
- `#experience-lab/env/{ENV-ID}`: selected environment.
- `#experience-lab/env/{ENV-ID}/preview/{EXPERIENCE-ID}`: anchored hotspot preview.
- `#experience-lab/env/{ENV-ID}/experience/{EXPERIENCE-ID}`: authored Experience presentation, including its existing Incident Brief.
- `#experience-lab/env/{ENV-ID}/theory/{one-based-section}`: theory section.

Catalog/ENV/hotspot relationships are validated against generated catalog metadata. Unknown IDs fall back to the catalog or known ENV; malformed primary hashes fall back to Notebook. Both popstate and hashchange enter one route application path, which suppresses duplicate application and stale asynchronous transitions. Internal parent actions reuse the previous matching history entry; they do not create a decision-level history.

Environment Navigator emits navigation intent; Workspace validates/restores its own view and preserves Player sessions in an in-memory map. Accepted commands, attempts and evidence remain Player-owned. Global language changes replay accepted commands only into detached localized Players, under the existing locale guard; a newer navigation supersedes a pending replay. Browser navigation never re-registers a previously recorded completion. No command/stage/result is pushed into browser history.

The Lab composition stays alive when detached by another primary view. Back/Forward can therefore restore the same session during the current document lifetime. A reload restores the deep route and persisted aggregate progress, but starts a new pedagogical session; command history and evidence are not persisted across reloads. This is deliberately distinct from route recovery.

`Frontend/components/scrollToContent.js` owns geometry-based content alignment and reduced-motion handling. The workspace wrapper targets the current Result/Stage heading when it is outside the visible content area. Navbar height is measured; no document-origin scroll is used for internal Lab transitions. Opening/closing hotspot previews preserves viewport context; restored history entries recover their previous scroll and stable focus target using preventScroll. Hero arrow scrolling uses the shared helper and adds no history entry. No arbitrary timeout, per-Experience coordinate or Player change is involved.

Notebook catalog authority remains `content/notebooks/notebook.js` plus its ES overlay. The authorized withdrawal of article-009 through article-033 removes actual source entries, without changing EE/ENV YAML or technical source archives. Historical reading-path references in those preserved sources are text, not live Notebook URLs; their withdrawal is inventoried as editorial debt in the implementation report.
