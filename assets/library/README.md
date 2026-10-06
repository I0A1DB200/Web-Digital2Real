# Digital2Real --- Reusable Asset Library

**Role:** Canonical index and governance entry point for the reusable
industrial media library

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## 1. Purpose

The reusable asset library stores validated industrial media that may
support multiple Notebook entries or Experiences.

This integration creates the catalog authority only. Existing production binaries remain in their established Frontend, Notebook, ENV and Experience-owned locations until an explicitly approved asset migration establishes provenance and ownership.

## 2. Preferred logical domains

``` text
assets/library/
├── plc/
├── drives/
├── sensors/
├── io-link/
├── industrial-networks/
├── hmi-scada/
├── safety/
├── electrical/
└── mechanical/
```

Codex must adapt this to the repository's existing asset architecture
during integration.

## 3. Search-before-create rule

``` text
media need
→ search library
→ inspect candidate pixels/metadata
→ semantic validation
→ reuse if valid
→ otherwise create NEW ASSET SPEC
```

## 4. Metadata

Each reusable asset should have traceable metadata for:

-   ID;
-   domain;
-   equipment/model where relevant;
-   source/provenance;
-   technical description;
-   semantic limitations;
-   allowed roles;
-   licensing/copyright notes;
-   known Experience uses.

Future machine-readable records use `catalog.yaml` and may declare `source_ids: []`. A source relationship establishes traceability only; it does not transfer rights, approve production use, or turn an external image into learner evidence.

## 5. Naming

Use repository naming conventions.

Names should be stable, descriptive, and independent of temporary UI
wording.

## 6. Relationship to Experience assets

The reusable library is a source/reuse system.

Experience-local published packages retain their required asset
structure.

Do not make an Experience depend on an unstable external working path.

## 7. Validation

An asset enters approved reuse only after technical and semantic review.

## 8. Indexing

Maintain a searchable index or metadata mechanism so Codex can find
assets by engineering meaning, not only filename.

Useful search dimensions include:

-   device type;
-   manufacturer/model;
-   protocol;
-   signal type;
-   symptom;
-   diagnostic state;
-   semantic role.

## 9. Governing rule

> Search by engineering need, validate by pixels and context, then
> reuse.
