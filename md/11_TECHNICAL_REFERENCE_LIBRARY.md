# Digital2Real --- Technical Reference Library

**Document:** 11\
**Role:** Governance for manuals, datasheets, application notes, and
engineering references

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## 1. Purpose

The technical reference library supports verifiable engineering
decisions across Notebook, Experiences, and asset validation.

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
