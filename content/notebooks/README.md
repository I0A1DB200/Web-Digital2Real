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

## Multilingual publication

Notes / Engineering Notes are the website label for Notebook, not another product.
`notebook.js` owns one English technical model: article ID, slug, permanent section
IDs, section order/types, code, measurements, references and relationships.
`locales/es.js` owns Spanish presentation keyed by article and section IDs.
`localization.js` validates and projects ES/EN; `getNotebook(locale)` is the public
API. Unsupported locales, including IT, resolve to English and declare `lang=en`.
Missing active Spanish text fails packaging instead of presenting English as Spanish.

Every published entry requires complete ES/EN title, excerpt, headings, prose,
list/callout text, category labels and alt text. Executable code stays canonical.
Only code blocks explicitly marked `presentation: "diagram"` may translate their
natural-language labels. Preserve technical values, units, warnings and source truth.
Never renumber existing section IDs when inserting/reordering sections. English
category values are stable category identities; translated labels keep their order.

The packager publishes the canonical module, resolver and locale resources under
`Frontend/generated/notebooks/`. Never edit generated output. Validate both languages
and unsupported-language fallback before publication. Adding IT requires complete
reviewed content, shared UI resources and explicit global activation; no placeholders.
The global preference is owned by `Frontend/data/locale.js`, independently of progress.
