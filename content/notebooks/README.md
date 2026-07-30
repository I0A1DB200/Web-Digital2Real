# Notebook Content

This directory owns structured, reusable technical knowledge for the Digital2Real Notebook product.

## Allowed content

- canonical Notebook entries;
- content metadata;
- content-owned references required by those entries.

## Prohibited content

- Notebook UI components or styles;
- Experience logic;
- generated publication artifacts;
- shared application configuration.

The canonical Notebook data is `content/notebooks/notebook.js`. The Frontend consumes only the generated publication artifact at `Frontend/generated/notebooks/notebook.js`; generated files MUST NOT be edited.

Platform and product boundaries are defined by [D2R-000](../../docs/00-blueprint/D2R-000-digital2real-blueprint.md).
