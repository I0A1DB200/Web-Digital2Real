# Digital2Real

Digital2Real is an industrial automation engineering platform organized around two products:

- **Notebook** — structured, reusable technical knowledge;
- **Experience Lab** — interactive industrial experiences for developing and validating professional capabilities.

The Industrial Capability Framework (ICF) is the planned canonical model connecting knowledge, experiences, assessment, and professional capability.

## Current repository map

| Area | Current canonical location |
|---|---|
| Web application | `Frontend/` |
| Notebook content | `Frontend/data/notebook.js` |
| Notebook assets | `Frontend/assets/images/notebook/` |
| Experience Engine | `experience-engine/` |
| Headless Experience Player | `experience-engine/player/` |
| Experience Workspace | `Frontend/products/experience-engine/` |
| Experience publication packaging | `scripts/package-experience-engine.mjs` |
| Architecture and project documentation | `docs/` |

The repository retains these established locations. New top-level product folders must not duplicate an existing source of truth.

## Documentation

Start with [`docs/README.md`](docs/README.md) for the documentation map, governance boundaries, and planned ICF structure.
