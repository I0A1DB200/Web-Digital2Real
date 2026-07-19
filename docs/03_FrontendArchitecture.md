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
- `academy`
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

This concentration is recorded technical debt. No responsibility has been extracted yet.

## Current Module Boundaries

- `Frontend/components/` contains active shared/product components and disconnected Labs components.
- `Frontend/data/` contains global site data, Engineering Notes content, and disconnected Labs data.
- `Frontend/styles/` contains brand, base, layout, active product, and disconnected Labs styles.
- `Frontend/assets/` contains brand resources, images, and videos.

## Approved Direction

RFC-001 approves an evolutionary internal separation into product-owned and shared modules while retaining `Frontend/` as the single deployable application root.

That structural migration has not started. Current paths remain authoritative until an approved RFC-002 package moves them and updates all references atomically.
