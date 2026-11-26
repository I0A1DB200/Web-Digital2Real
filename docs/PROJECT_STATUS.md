# Project Status

## Project Version

| Status | Value |
|---|---|
| Completed | v2.0.2 implementation baseline |
| Completed | D2R architecture baseline v1 |

## Current Phase

| Status | Value |
|---|---|
| In Progress | Repository physical migration |

## Production readiness workstream

| State | Work, evidence and next gate |
|---|---|
| Implemented on work branch | [Security hardening and audit](implementation/D2R-SECURITY-PRODUCTION-AUDIT.md), reconciled with current main, and delegated delivery in the [Development Workflow](DEVELOPMENT_WORKFLOW.md). |
| Draft PR under review | [PR #18](https://github.com/I0A1DB200/Web-Digital2Real/pull/18) builds and tests without deploying. Local packaging, all 598 tests, and Chromium routing/footer checks passed. |
| Implemented locally | API optativa, migración SQLite no destructiva, verificación de tokens firmados, cierre local, catálogo por derechos, tratamiento idempotente de suscripciones, marcadores de práctica, versiones legales y exportación. El Player canónico reproduce intentos de evaluación sintéticos. Se verificó una restauración local. |
| Next approved work | Validar en PR el API y las Actions fijadas. Revisar las reglas de main y Pages antes de integrar. El siguiente paquete técnico es la prueba de paridad y proyección privada para sesiones de evaluación, más el adaptador de IdP y facturación cuando se aprueben sus contratos. |
| Blocked on external evidence | El proxy devolvió HTTP 403 a las consultas de Pages, dominio y DNS sobre HTTPS. La resolución de los nombres tampoco respondió desde el entorno. La publicación real, las cabeceras, SPF, DKIM con selector confirmado y DMARC siguen sin verificación. |
| Blocked on owner decisions | Aprobar hosting y región, identidad, checkout y facturación, retención y textos legales. Definir aprobación de contenido acreditativo y emisión o revocación de certificados antes de activar producción. See [architecture](01-architecture/D2R-PRODUCTION-READINESS-PROPOSAL.md). |

## Current Sprint

- [x] **Completed:** Repository architecture audit
- [x] **Completed:** Remove tracked browser-validation profiles
- [x] **Completed:** Remove tracked temporary validation screenshots
- [ ] **In Progress:** Reconcile live documentation with D2R-000
- [ ] **Planned:** Establish physical Notebook and Experience Lab boundaries

## Architecture Status

| Status | Item |
|---|---|
| Completed | D2R-000 Digital2Real Blueprint |
| Completed | D2R-001 Industrial Capability Framework |
| Completed | D2R-002 through D2R-008 Standards and Governance |
| Completed | Experience Engine 2.0 authoring, adapter, Player and packaging boundaries |
| Planned | Physical repository alignment with the approved two-product model |

## Repository Status

| Status | Item |
|---|---|
| Completed | Architecture, dependency, asset and documentation audit |
| Completed | Browser-validation artifacts removed from the working tree |
| In Progress | Documentation reconciliation |
| Planned | Product-boundary migration |
| Blocked | None |

## Frontend Status

| Status | Item |
|---|---|
| Completed | Static vanilla JavaScript ES Modules application |
| Completed | Notebook, Experience Lab and About views |
| Completed | Experience Workspace consumes generated Player artifacts |
| Planned | Rename the physical Experience Lab presentation boundary |
| Planned | Consolidate Notebook-owned files |

## Backend Status

| Status | Item |
|---|---|
| Completed | Disconnected FastAPI prototype identified |
| Blocked | Retention and production role require a repository decision |

## Academy Status

| Status | Item |
|---|---|
| Completed | Historical runtime packages and Lab 001 preserved |
| Planned | Evaluate migration, archival or deprecation |
| Blocked | Academy is not an active Digital2Real product under D2R-000 |

## Engineering Notes Status

| Status | Item |
|---|---|
| Completed | Notebook content and article viewer operational |
| Planned | Consolidate under the Notebook product boundary |

## Labs Status

| Status | Item |
|---|---|
| Completed | Disconnected gallery data, components and styles identified |
| Planned | Isolate as legacy without activating it |
| Blocked | Missing media and final disposition require a repository decision |

## Assistant Status

| Status | Item |
|---|---|
| Blocked | Assistant is not an approved Digital2Real product |

## Completed RFCs

- [x] **Completed:** RFC-001 Repository Architecture

## Pending RFCs

- [ ] **In Progress:** RFC-002 Repository Refactor
- [ ] **Blocked:** Backend disposition decision
- [ ] **Blocked:** Legacy Academy runtime disposition decision

## Completed User Stories

- [x] **Completed:** Generic Experience Workspace vertical slice

## Current User Stories

- [ ] **In Progress:** No formally numbered User Story active

## Technical Debt

- [ ] **Planned:** Consolidate Notebook ownership
- [ ] **Planned:** Rename Experience Lab presentation boundary
- [ ] **Planned:** Isolate disconnected Labs code and CSS
- [ ] **Planned:** Decide ownership of the legacy Academy runtimes
- [ ] **Planned:** Implement executable full-schema validation before packaging
- [ ] **Planned:** Declare Backend dependencies if retained
- [ ] **Planned:** Establish CI and architecture enforcement

## Known Issues

- [ ] **Blocked:** Three legacy Labs video references are missing
- [ ] **Planned:** Inactive Labs CSS remains globally imported
- [ ] **Planned:** Unused and duplicated assets require ownership decisions
- [ ] **Planned:** One legacy Experience remains outside the canonical 2.0 schema

## Pending Product Decisions

- [ ] **Blocked:** Legacy Academy runtime migration, archival or deprecation
- [ ] **Blocked:** Legacy Labs gallery disposition
- [ ] **Blocked:** Backend prototype disposition
- [ ] **Blocked:** Unreferenced and duplicated asset disposition
- [ ] **Blocked:** Experience schema 1.0 migration

## Next Milestone

| Status | Milestone |
|---|---|
| Planned | Establish the physical Notebook and Experience Lab product boundaries |

## Recent Changes

- [x] **Completed:** D2R-000 through D2R-008 documentation baseline
- [x] **Completed:** Experience Engine YAML Adapter, Headless Player and deterministic packaging
- [x] **Completed:** Experience Workspace vertical slice
- [x] **Completed:** Full physical repository audit
- [x] **Completed:** Removal of tracked local browser profiles and validation screenshots

## Project Metrics
