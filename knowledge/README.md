# Digital2Real --- Technical Reference Library

**Role:** Governance for manuals, datasheets, application notes, and
engineering references

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## 1. Purpose

The technical reference library supports verifiable engineering
decisions across Notebook, Experiences, and asset validation.

This integration creates the reference catalog authority only. It does not move existing repository documents or publish private source material to the website.

The implemented foundation separates [`source-library/`](source-library/README.md), which owns external source identity and governance, from [`references/`](references/README.md), which owns reviewed D2R interpretation linked to source IDs. Notebook remains the permanent published technical SSOT.

## 2. Logical categories

``` text
knowledge/
├── manuals/
├── datasheets/
├── application-notes/
└── references/
```

Final paths must follow repository conventions.

## 3. What belongs here

-   manufacturer manuals;
-   datasheets;
-   official application notes;
-   protocol references;
-   internally authored technical references;
-   other traceable engineering source material.

## 4. Provenance record

For each source capture where practical:

-   title;
-   manufacturer/author;
-   document number/version;
-   publication/revision date;
-   source location;
-   access date if relevant;
-   equipment applicability;
-   licensing/copyright notes.

## 5. Use by Codex

Codex may use the library to:

-   verify technical claims;
-   design Notebook content;
-   validate Experience reasoning;
-   validate asset semantics;
-   expose uncertainty.

Codex must not silently extrapolate beyond the source.

## 6. Public/private distinction

A technical source in the repository is not automatically public website
content.

Reference storage, authored knowledge, and published content are
separate layers.

## 7. Conflicting sources

When sources conflict:

1.  identify version/equipment applicability;
2.  prefer the source applicable to the actual system;
3.  document unresolved ambiguity;
4.  do not invent reconciliation.

## 8. Governing rule

> Technical claims should remain traceable to engineering evidence or a
> defensible source.
