# ADR-0001 — Content Ownership

| Field | Value |
|---|---|
| Decision reference | AD-001 |
| Status | accepted |
| Date | 2026-07-25 |
| Owner | Digital2Real Architecture |
| Scope | Ownership boundary between Platform, Products, Content, and Documentation |
| Governing documents | [D2R-000](../../00-blueprint/D2R-000-digital2real-blueprint.md), [D2R-008](../D2R-008-architecture-governance.md) |
| Supersedes | Earlier repository-location assumptions that assign authored content to Experience Engine |
| Superseded by | None |

## Context

Digital2Real distinguishes four architectural responsibilities:

- **Platform:** software that processes, validates, executes, packages, or delivers information;
- **Products:** user-facing interfaces;
- **Content:** authored industrial knowledge and learning material;
- **Documentation:** architecture, standards, governance, and operational guidance.

The current repository stores Experience content under `experience-engine/` and Notebook content under `Frontend/`. Those locations make software ownership appear equivalent to content ownership.

## Decision

Notebook entries, Capability definitions, Experiences, and Assessments are Content.

Experience Engine MUST process Experience content but MUST NOT own that content. Experience schema, validation, adaptation, runtime execution, integration contracts, workflows, and generation prompts remain Experience Engine responsibilities.

The canonical content boundaries are:

```text
content/
├── notebooks/
├── capabilities/
├── experiences/
└── assessments/
```

Product interfaces remain under `Frontend/products/`. Architecture and governance remain under `docs/`.

## Consequences

### Positive

- authored knowledge remains independent from its current processor or interface;
- Notebook and Experience content share a clear architectural category without sharing ownership;
- Experience Engine can evolve without becoming the content repository;
- generated Frontend artifacts remain derived and disposable.

### Negative

- existing content paths and their consumers require an incremental migration;
- packaging, tests, imports, documentation, and authoring references must change together;
- temporary repository locations may differ from the approved ownership model during migration.

### Compatibility and migration

- Content MUST move without changing its data shape or meaning.
- Experience IDs, Brief IDs, Capability IDs, slugs, versions, and publication states MUST remain unchanged.
- `Frontend/generated/experience-engine/` MUST remain the browser publication boundary.
- Historical documents MAY retain former paths when clearly historical.
- No content may exist as two editable sources of truth during migration.

## Alternatives considered

### Keep Experience content inside Experience Engine

- Benefit: no path migration.
- Rejected because it conflates software processing with authored-content ownership.

### Create a top-level Platform monorepo

- Benefit: visually groups software modules.
- Rejected because current runtime boundaries do not require independent projects or additional infrastructure.

## Validation

- Every content type has one canonical location.
- Experience Engine contains processing responsibilities only.
- Products consume Content directly or through approved generated contracts.
- Packaging remains deterministic.
- All tests, schema checks, imports, and Markdown links pass after each migration package.

## Affected documents

- [D2R-000 — Digital2Real Blueprint](../../00-blueprint/D2R-000-digital2real-blueprint.md)
- [D2R-001 — Industrial Capability Framework](../../01-architecture/D2R-001-industrial-capability-framework.md)
- [D2R-008 — Architecture Governance](../D2R-008-architecture-governance.md)

