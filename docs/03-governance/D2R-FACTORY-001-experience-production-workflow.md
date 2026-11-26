# Experience Production Workflow

| Field | Value |
|---|---|
| Document ID | D2R-FACTORY-001 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Official Experience Factory production workflow |

## Purpose

This document governs the complete production path from a verified industrial case to a published Digital2Real Experience. It coordinates existing design, Authoring, media, validation, and publication authorities without redefining their contracts or implementation.

The workflow uses the [Experience Information Model](D2R-SPEC-001-experience-information-model.md), [Provider Library](D2R-SPEC-002-provider-library.md), [Blueprint Schema](D2R-SPEC-003-blueprint-schema.md), and [Engineering Artifact Library](D2R-SPEC-004-engineering-artifact-library.md). Experience design remains governed by [D2R-GUIDE-001](D2R-GUIDE-001-experience-design-guide.md), and physical packages remain governed by [D2R-STD-001](../02-standards/D2R-STD-001-experience-package.md).

## Pipeline

```text
Industrial Case
→ Blueprint
→ Architect Review
→ Notebook and Provider planning
→ Media Production
→ Experience Factory build
→ Contract validation
→ Technical and pedagogical review
→ Publication approval
→ Deterministic publish
```

No stage may silently compensate for missing authority upstream. Failed gates return work to the source responsible for correction.

## Industrial Case

The Product Owner or Domain Engineer supplies a bounded, attributable industrial problem through an approved upstream record such as an Experience Brief. It identifies known facts, uncertainty, learning opportunity, constraints, references, and source authority.

The Industrial Case is not passed directly into build. It is reviewed and transformed into the canonical Blueprint so that Experience Factory has one manual production instruction.

## Blueprint

The Experience Architect prepares the Blueprint according to D2R-SPEC-003. It resolves learning intent, information flow, Root Cause, graphs, Provider requests, artifact requests, recovery, Debrief, localization scope, and known support gaps.

The approved Blueprint is immutable for a production attempt. Material changes require a new reviewed Blueprint version rather than untracked corrections in generated outputs.

## Architect Review

Architect Review confirms:

- alignment with one principal Capability and governed Competencies;
- coherent industrial case and causal chain;
- conformance with the EIM and Experience Design Guide;
- complete, finite, and traceable investigation, decision, and Evidence graphs;
- valid Provider and artifact IDs;
- public/private separation;
- compatibility with current Authoring, Runtime, Web Artifact, Player, packaging, and localization boundaries;
- explicit handling of every unsupported requirement.

Build authorization is withheld when architecture compatibility is ambiguous or requires an unapproved extension.

## Media Production

Media Production converts approved artifact requests into genuine masters and reviewed web derivatives. Provider information and Blueprint parameters remain authoritative; media producers must not add technical facts or reveal private information.

Masters are reviewed for technical fidelity, educational purpose, accessibility, localization, provenance, and visual consistency. Their storage and publication boundaries follow D2R-STD-001. Derivatives may be regenerated; approved masters must not be overwritten by automation.

## Experience Factory

Experience Factory coordinates approved inputs into a complete Experience Package. It may generate Authoring content, locale overlays, media briefs, web derivatives, review inventories, and other permitted package material.

The Factory is an orchestrated production process, not a new runtime platform. It must reuse existing validators, normalization, projection, Player, and packaging boundaries. It must stop rather than invent missing industrial facts, Competencies, Provider parameters, or assets.

## Codex Integration

Codex acts as a bounded implementation agent. It may:

- read the approved Blueprint and canonical references;
- create or update files explicitly authorized for the production package;
- derive outputs using existing contracts and tools;
- process approved masters without overwriting them;
- run validation and report gaps.

Codex must not approve its own technical claims, create governance implicitly, invent missing inputs, publish autonomously, or introduce Experience-specific logic into shared systems. Human approval remains required at the designated gates.

## Quality Gates

| Gate | Required outcome |
|---|---|
| Case gate | Source, scope, uncertainty, and learning opportunity accepted |
| Blueprint gate | Architecture review PASS and no unresolved build blocker |
| Notebook gate | Required knowledge exists or has an owned delivery plan |
| Provider gate | Requests use canonical Providers with complete parameters |
| Artifact gate | Masters and derivatives satisfy approved requests |
| Authoring gate | Authoring v1 validation PASS |
| Runtime gate | Normalization and Runtime validation PASS |
| Projection gate | Web Artifact validation and private-data security PASS |
| Player gate | Intended and reviewed alternative paths are navigable |
| Localization gate | Declared locales and fallback PASS |
| Packaging gate | D2R-STD-001, paths, assets, catalog, and determinism PASS |
| Review gate | Technical, pedagogical, safety, and Product Owner approval recorded |
| Publication gate | Lifecycle and validation state satisfy production rules |

Warnings preserve review status. Blocking uncertainty, missing masters, incomplete localization, private leakage, or failing tests prevents publication.

## Publication

Publication occurs only through the existing deterministic packaging boundary. Preview may contain eligible review content; production contains only Experiences satisfying the approved published state and technical validation requirements.

Generated Runtime, Web Artifact, catalog, and web assets are disposable outputs. Canonical authoring remains under `content/experiences/`, and no generated file becomes an editable authority.

## Responsibility Matrix

| Responsibility | Product Owner | Experience Architect | Domain Engineer | Media Producer | Codex | Reviewer |
|---|---:|---:|---:|---:|---:|---:|
| Accept industrial case | A | C | R | — | — | C |
| Define and version Blueprint | C | A/R | C | C | C | C |
| Verify industrial claims | C | C | A/R | C | — | R |
| Map Capability and Competencies | A | R | C | — | — | C |
| Define Provider and artifact requests | C | A/R | C | C | C | C |
| Produce and preserve masters | C | C | C | A/R | C | C |
| Build authorized package | — | A | C | C | R | C |
| Execute automated validation | — | A | C | C | R | C |
| Technical and pedagogical review | C | R | R | C | — | A |
| Approve publication | A | R | C | C | — | C |

`A` means accountable, `R` responsible, `C` consulted, and `—` no assigned responsibility. One role may be fulfilled by the same person, but the responsibilities and approval evidence remain distinct.

## Deliverables

Each production attempt delivers, as applicable:

- approved Industrial Case reference;
- approved Blueprint and architecture review;
- Capability, Competency, and Notebook traceability;
- Provider request inventory;
- Engineering Artifact inventory and media briefs;
- approved masters and web derivatives;
- complete D2R-STD-001 Experience Package;
- valid Authoring Definition and locale documents;
- generated Runtime and Web Artifact validation evidence;
- Player, security, packaging, and regression results;
- technical, pedagogical, safety, media, localization, and publication review record.

Deliverables remain owned by their established authorities. The workflow does not consolidate them into a new source of truth.

## Success Criteria

An Experience Factory production attempt succeeds when:

- one approved Blueprint accounts for every generated responsibility;
- the Experience develops governed Competencies through credible evidence-led reasoning;
- Provider information and artifacts are traceable, consistent, and technically approved;
- Notebook knowledge is referenced without duplication;
- masters, derivatives, accessibility, and localization are complete;
- Authoring, Runtime, Projection, Web Artifact, Player, security, packaging, and regression checks pass;
- no private diagnostic authority leaks into public output;
- human review and Product Owner publication approval are recorded;
- production packaging publishes the Experience without Experience-specific shared logic.

## Canonical Workflow

```text
Industrial knowledge or Experience Brief
→ Industrial Case acceptance
→ Blueprint authoring
→ Architect Review
→ Notebook requirements
→ Provider requests
→ Artifact and media production
→ Approved masters
→ Codex build
→ Authoring validation
→ Normalization and Runtime validation
→ Projection and Web Artifact validation
→ Player and security validation
→ Technical, pedagogical, safety, and localization review
→ Product Owner approval
→ Deterministic production packaging
→ Experience Lab
```

The approved Blueprint is the sole manual instruction entering the build portion of Experience Factory. Upstream records provide source knowledge; downstream outputs are derived and validated. Any material inconsistency returns to the responsible canonical source rather than being patched in a generated layer.


## Operational annex — Existing canonical Experience visual production (2026-11-26)

Annex status: operational draft from the EE-0037 execution, pending human review; the approved baseline above is unchanged.

This annex records an implementation method within the existing pipeline; it changes no contract, approval authority or publication gate. Existing canonical decisions, evidence acquisition and correctness are the SSOT. New projects still follow the pipeline above.

1. Discover all available ZIPs, extracted packages, media-source, manifests, canonical sources and QA reports. Record hashes and actual states separately: visually accepted, technically approved within scope, pending, rejected, registered-hidden, published. Publication is not proof of technical approval. Never reuse known defects as valid examples.
2. Select the next visually pending canonical Experience in the active Environment; verify IDs, ES/EN, hotspot, source, private logic, Notebook links. Missing source blocks only dependent production. Snapshot existing tracked/untracked work; isolate scope before edits.
3. Write the technical master before images. Separate source facts, unknowns and illustrative choices. Record connections before deterministic SVG. No fabricated ratings, addresses, models, measurements or safety procedures. Uc may remain symbolic. Process STOP is not E-stop. Permission is not START.
4. Plan normally 5–7 meaningful assets with explicit role, disclosure moment, visible state, hidden information, localization and limits. Do not add meters, PLCs or software to fill slots. Intended schematic can precede diagnosis; installed fault follows its canonical acquisition; repair is not verified recovery.
5. Use ImageGen for actual synthetic photographs and localized photo edits; preserve first-photo continuity and originals. No decorative brand headings or answer overlays. Inspect every output before proceeding. Correct local defects up to three reasonable attempts per defect. Persisting critical faults remain hidden. Deterministic SVG establishes electrical geometry; export PNG for runtime, inspect raster and check netlist including return and parallel branches. Check terminal metal contact, meter mode and units where applicable. Synthetic software is never called a real capture.
6. Record original/final hashes, tool, correction history, individual QA, sources, ES/EN alt/caption, purpose, timing, what pixels do/do not establish. Keep experience-local assets and sources under the canonical package. Do not copy assets to unrelated collections or infer manufacturer approval from appearance.
7. Integrate final verified media directly through existing cover/stage/evidence contracts; retain private logic, feedback, IDs, routes and Engine. Place safety prerequisites visibly before invasive actions. Use key-aware localized edits, then compare manifest alt and caption individually against each runtime locale.
8. Run meaningful focused checks, complete existing suite, preview generation and real ES/EN desktop/mobile browser flows including incorrect retries, no early media requests, zoom, language continuity, reset, Notebook links and console/network. Inspect screenshots. Classify failures before fixing their owning layer; never patch unrelated Experiences for green tests.
9. ZIP contains real final assets, canonical source snapshot, technical master, runnable reproduction/check tools, manifest, QA and pending human gates. Manifest paths/hashes must match archive members; test ZIP opens and CRC is sound. Store ZIP SHA externally to avoid self-reference. Provide a contact sheet and browser captures without altering final media.
10. Completion means local production, reviewed media, integration, tested preview, validated archive and factual report. Human technical review and explicit publication authorization remain required. Keep technical_review/pending; never self-approve, push, merge or deploy to imply closure. Record blocked assets and next candidate.

Lessons: reject unexplained electrical patterns, reversed supply or floating return, return bypasses, inconsistent coil ratings and measuring-mode mistakes. A green LED or one voltage image alone cannot establish functional recovery. Ordinary STOP must not become a mushroom safety redesign. An unwired reference specimen must not be presented as installed-wiring evidence. No numeric operating voltage should be introduced when the canonical case does not define it.
