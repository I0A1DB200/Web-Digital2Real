# Experience Build Pipeline

| Field | Value |
|---|---|
| Document ID | D2R-BUILD-001 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Deterministic build of one approved Experience |

# 1. Purpose

A Digital2Real Experience is built through deterministic compilation of governed content. It is not implemented as a manually authored page. The build converts an approved Blueprint, verified information, approved media, Authoring, and localization into validated outputs consumed by the generic Experience Lab.

This pipeline coordinates existing responsibilities. It does not redefine Authoring, Runtime, Projection, Web Artifact, Player, Packaging, or Frontend contracts.

# 2. Inputs

Canonical inputs are:

- an approved Blueprint;
- an Authoring Definition within the current contract;
- complete Spanish and English localization;
- governed Provider Instances;
- canonical Artifact bindings;
- approved multimedia masters and permitted web derivatives;
- canonical Capability and Competency references;
- the current technical-review state and its evidence.

Missing required input remains an explicit build blocker. Generated outputs never replace an input authority.

# 3. Canonical Pipeline

```text
Blueprint
→ Provider instantiation
→ Artifact validation
→ Authoring completion
→ Localization
→ Authoring validation
→ Normalization
→ Runtime validation
→ Projection
→ Web Artifact validation
→ Packaging
→ Catalog
→ Player
→ Experience Lab
→ Tests
→ Publication gate
```

Every stage consumes the approved output of the preceding stage. A failed stage stops affected downstream work without changing shared architecture.

# 4. Responsibilities

## Product Owner / Engineering Director

- owns engineering decisions and the approved Blueprint;
- approves multimedia and pedagogical intent;
- resolves governed Capability and Competency references;
- authorizes technical review and publication.

## ChatGPT Architect

- prepares narrative, decisions, feedback, Provider parameters, Debrief, source localization, and the approved construction prompt;
- preserves the Blueprint's engineering and pedagogical intent;
- records uncertainty rather than inventing technical facts.

## Codex

- implements only authorized files and existing contracts;
- validates Provider and Artifact bindings;
- binds approved assets and generates permitted derivatives;
- executes validation, packaging, integration, tests, and the final build report.

Codex does not make unrecorded pedagogical or engineering decisions and does not approve publication.

# 5. Build Rules

- The approved Blueprint is the design authority for the build.
- `experience.yaml` is the contractual Authoring authority.
- `locales/` owns declared localization overlays.
- Approved masters remain unchanged and retain provenance.
- Web derivatives may be regenerated from approved masters.
- Runtime and Web Artifact are generated products, never editable authorities.
- The Player remains generic and presentation-independent.
- Experience-specific branches, selectors, routes, and ID lists are prohibited.
- Preview and Production use the existing lifecycle and validation rules.
- Private diagnostic information must never enter the Web Artifact.
- Missing facts, mappings, or support must not receive implicit defaults or fallbacks.

# 6. Quality Gates

| Gate | Required result |
|---|---|
| Gate 1 — Blueprint | Approved and structurally complete |
| Gate 2 — Capability | Canonical Capability and Competencies resolved |
| Gate 3 — Artifacts | Provider bindings, masters, derivatives, and references complete |
| Gate 4 — Localization | ES/EN complete with reviewed fallback |
| Gate 5 — Authoring | Authoring validation PASS |
| Gate 6 — Runtime | Normalization and Runtime validation PASS |
| Gate 7 — Web Artifact | Projection, validation, and private-leak checks PASS |
| Gate 8 — Packaging | Paths, assets, determinism, and catalog PASS |
| Gate 9 — Player | Navigation, reveal order, completion, and regression PASS |
| Gate 10 — Publication | Review complete and publication explicitly authorized |

Warnings preserve technical review. A failed or incomplete gate prevents dependent outputs from advancing.

# 7. Failure Policy

When a decision is absent, technical information contradicts another authority, or a current contract cannot represent an approved requirement:

- stop only the affected portion of the pipeline;
- identify the exact missing authority, input, or capability;
- preserve completed upstream work;
- do not invent content or create implicit fallbacks;
- do not modify shared architecture without approval;
- propose the smallest independently reviewable unblock package.

# 8. Outputs

A successful build produces:

- a validated Authoring Definition;
- complete locale documents;
- referenced web assets derived from approved sources;
- validated Runtime;
- validated Web Artifact;
- the corresponding generated catalog entry;
- generic Player navigation and Experience Lab availability;
- specific and regression test evidence;
- a build report recording gates, limitations, and publication state.

All generated outputs remain subordinate to their canonical inputs.

# 9. Out of Scope

D2R-BUILD-001 does not authorize:

- new APIs or dependencies;
- new Authoring, Runtime, or Web Artifact contracts;
- a second Runtime, Player, catalog, or packaging path;
- Experience-specific Frontend code;
- logic branching by Experience ID;
- automatic publication without approval;
- generative multimedia;
- local Competency IDs or speculative engineering content.

# 10. Relationship with Governance

D2R-BUILD-001 operationalizes, but does not replace:

- [D2R-SPEC-001 — Experience Information Model](D2R-SPEC-001-experience-information-model.md);
- [D2R-SPEC-002 — Provider Library](D2R-SPEC-002-provider-library.md);
- [D2R-SPEC-003 — Blueprint Schema](D2R-SPEC-003-blueprint-schema.md);
- [D2R-SPEC-004 — Engineering Artifact Library](D2R-SPEC-004-engineering-artifact-library.md);
- [D2R-FACTORY-001 — Experience Production Workflow](D2R-FACTORY-001-experience-production-workflow.md);
- [D2R-STD-001 — Experience Package](../02-standards/D2R-STD-001-experience-package.md);
- [D2R-GUIDE-001 — Experience Design Guide](D2R-GUIDE-001-experience-design-guide.md);
- [EXP-MODEL-001 — Experience Model Contract Decisions](decisions/EXP-MODEL-001-experience-model-contract-decisions.md).

The Experience Factory workflow governs the complete production lifecycle. This document governs the bounded compilation and validation sequence for one approved Experience.
