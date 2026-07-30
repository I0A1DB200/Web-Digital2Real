# EXP-MODEL-001 — Experience Model Contract Decisions

| Field | Value |
|---|---|
| Document ID | EXP-MODEL-001 |
| Status | Accepted |
| Decision owner | Digital2Real Architecture |
| Approval owner | Product Owner |
| Scope | Experience Model contracts preceding the definition of Experience Schema v1 |
| Applies to | Content, Experience Engine, generated Experience artifacts, Experience Player, and Experience Lab |

## 1. Purpose

This document defines the contract boundaries that must be approved before Digital2Real specifies Experience Schema v1.

It does not define the final schema, generate YAML, prescribe a rendering implementation, or modify an existing Experience. Its responsibility is to prevent the authoring model, runtime model, public artifact, and presentation model from becoming one coupled structure.

## 2. Context

The repository currently has:

- canonical Experience content under `content/experiences/`;
- a declarative Experience schema identified as version 2.0.0;
- a YAML Adapter that parses source content into an immutable object;
- a Headless Player that validates and consumes a runtime subset;
- deterministic packaging that creates a catalog, Experience JSON, and browser-consumable Player;
- an Experience Workspace that renders only public Player state;
- one canonical Experience 2.0 vertical slice;
- one legacy Experience 1.0 package excluded from browser packaging;
- an approved requirement, EXP-SPEC-001, that makes animation a mandatory educational element of new Experiences.

The current parsed object, normalized model, and generated Experience JSON have substantially the same structure. This creates implicit coupling and makes private diagnostic content available in the generated browser artifact even though the Player excludes it from learner-facing state.

## 3. Decision Classification

This document uses three decision states:

- **Established:** already required by approved architecture or implemented contracts.
- **Recommended:** the Architecture Director's proposed direction for Experience Model v1; Product Owner approval is required before it becomes normative.
- **Deferred:** intentionally excluded from Experience Model v1 unless a later decision changes the scope.

## 4. Established Decisions

### 4.1 Content ownership

**State:** Established

`content/experiences/` is the only canonical authoring root for Experiences.

Experience Engine processes Experience content but does not own it. Frontend consumes generated artifacts and must not import or interpret authoring YAML.

### 4.2 Headless runtime

**State:** Established

Experience Player remains deterministic, presentation-independent, and free from filesystem, browser, network, vendor, and UI ownership.

The Player owns temporary session state. It does not own authoring, publication, persistent progress, analytics, or presentation.

### 4.3 Player state as the UI authority

**State:** Established

Experience Lab renders immutable public Player state and submits supported actions to the Player.

Frontend must not:

- parse YAML;
- infer transitions;
- reveal future evidence;
- calculate score or safety outcomes;
- interpret completion;
- expose private diagnosis;
- reconstruct debrief logic.

### 4.4 Deterministic packaging

**State:** Established

Browser artifacts are generated deterministically from validated canonical content. Generated artifacts are disposable and must never become editable sources of truth.

Preview and production publication remain separate gates.

### 4.5 Markdown boundary

**State:** Established

Markdown files support technical review and human explanation. Runtime behavior is not inferred from Markdown structure or prose.

## 5. Contract Separation

### 5.1 Authoring Experience Definition

**State:** Approved

The Authoring Experience Definition is the complete structured content contract written and reviewed under `content/experiences/`.

It owns:

- identity and authoring version;
- Experience class;
- capability and competency references;
- learning objectives;
- scenario and safety context;
- fault and diagnostic models;
- stages;
- evidence;
- decisions and consequences;
- feedback content;
- evaluation configuration where approved;
- debrief;
- references;
- publication intent;
- technical-review metadata;
- animation intent and source-asset references.

It may contain private technical information that must never be exposed to the learner before the appropriate runtime state.

### 5.2 Normalized Runtime Contract

**State:** Recommended

The Normalized Runtime Contract is a validated, immutable, engine-owned representation derived from the Authoring Experience Definition.

It must:

- have an explicit contract version;
- contain only fields required for deterministic execution or approved runtime projection;
- resolve authoring references before Player construction;
- use stable normalized names and terminal semantics;
- distinguish learner-visible data from private execution data;
- contain no unresolved authoring shorthand;
- introduce no technical facts;
- remain independent from Frontend layout and media-renderer implementation.

It is derived state and must not be persisted as a second editable source of truth.

### 5.3 Generated Web Artifact

**State:** Approved

The Generated Web Artifact is a versioned public delivery contract produced from the validated runtime model and publication policy.

It must not be a complete serialization of private authoring content.

It may contain:

- discovery metadata;
- learner-safe initial context;
- runtime data required by the browser Player;
- approved public media references;
- artifact and contract versions;
- integrity and publication metadata required by the loader.

It must exclude or technically protect:

- unrevealed root cause;
- private hypotheses;
- critical-path answers;
- unearned evidence;
- decision outcomes not yet selected;
- terminal debrief before completion;
- private scoring or assessment criteria where disclosure would compromise integrity;
- internal review notes;
- unpublished technical uncertainty.

### 5.4 Public Player State

**State:** Established

Public Player State remains a separate runtime projection. The existence of learner-safe generated assets does not transfer transition or session-state ownership to Frontend.

## 6. Versioning

### 6.1 Independent contract versions

**State:** Approved

The following versions must be independent:

- Experience Model version;
- Authoring Schema version;
- Normalized Runtime Contract version;
- Generated Artifact format version;
- individual Experience content version;
- Player public-state contract version.

A change to one contract does not automatically require the same version number in every other contract.

### 6.2 Current 2.0.0 schema

**State:** Recommended

The existing declarative schema identified as 2.0.0 must be treated as an approved baseline and migration input, not silently relabelled as Experience Schema v1.

The relationship between the current 2.0.0 profile and the future executable Authoring Schema requires an explicit compatibility decision before implementation.

## 7. Experience Classes

### 7.1 Required classification

**State:** Approved

Every new Experience should declare exactly one class:

- Learning;
- Practice;
- Assessment.

The class determines permitted guidance, disclosure, feedback, evidence, and assessment behavior. It must not change the underlying technical truth of the scenario.

### 7.2 Assessment isolation

**State:** Established by D2R-004; runtime contract remains pending

Assessment Experiences must not expose teaching guidance, private fault information, known solution paths, hidden criteria, or debrief content during evaluation.

The detailed Assessment Definition is outside this document.

## 8. Capability References

### 8.1 Governed external references

**State:** Approved

Experiences should reference approved Capability and competency identifiers rather than redefine independent capability taxonomies inside each Experience.

Experience-local learning objectives may remain local, but their competency references must resolve to governed definitions once the related Capability is approved.

### 8.2 Provisional capabilities

**State:** Established

Current `capability.yaml` manifests are provisional planning indexes and are not stable runtime APIs.

Experience Model v1 must not depend on their current shape until a Capability schema is separately approved.

## 9. Scoring

### 9.1 Current behavior

**State:** Established implementation

The current Player applies:

- an initial score;
- minimum and maximum score bounds;
- per-decision score effects;
- per-decision safety effects;
- a safety threshold for terminal completion.

### 9.2 Model v1 scope

**State:** Approved

Experience Model v1 should preserve the existing deterministic score behavior for compatibility, but must classify it as session feedback rather than capability validation.

Weighted evaluation dimensions must not be presented as executable while no approved calculation consumes them.

Scoring must never override:

- a blocked safety condition;
- a failed critical assessment criterion;
- invalid assessment integrity;
- incomplete root-cause or recovery evidence where those are required.

## 10. Relationship Authority

### 10.1 Stage and decision ownership

**State:** Recommended

One normalized relationship must be authoritative for decision availability. Authoring may offer review-friendly cross-references, but normalization must reject contradictions and produce one unambiguous stage-to-decision mapping.

### 10.2 Evidence reveal ownership

**State:** Recommended

One normalized relationship must be authoritative for evidence reveal. Authoring references from decisions and evidence may coexist only when executable validation proves exact consistency.

The Player remains the owner of the temporary revealed-evidence set.

## 11. Validation Contract

### 11.1 Executable validation result

**State:** Recommended

Packaging should consume an explicit immutable Validation Result rather than infer validity from a small set of metadata fields.

The result must identify:

- Experience ID and version;
- authoring schema profile;
- validation-contract version;
- global outcome;
- structural outcome;
- technical-review outcome;
- safety outcome;
- publication eligibility;
- warnings and blocking findings;
- evidence for each finding.

The validation history remains separate from Experience content.

### 11.2 Publication gate

**State:** Established

Production publication requires:

- published content status;
- matching publication state;
- successful technical validation;
- supported schema and runtime contracts;
- no blocking technical uncertainty;
- valid public artifact generation.

## 12. Legacy Compatibility

### 12.1 Legacy authoring content

**State:** Established

Legacy Experiences may remain in `content/experiences/` for authoring history and technical review.

They are not eligible for browser packaging until normalized to an approved canonical authoring profile.

### 12.2 No implicit fallback

**State:** Established

Experience Engine must not search an alternative authoring root or silently reinterpret unsupported legacy content.

Any future legacy normalization must be explicit, deterministic, tested, and versioned.

## 13. Animation Boundary

### 13.1 Educational requirement

**State:** Established by EXP-SPEC-001

Animation is a mandatory educational element for new Experiences.

Animation must communicate industrial behavior, evidence, causality, state change, or diagnostic reasoning. Decorative motion alone does not satisfy the requirement.

### 13.2 Authoring ownership

**State:** Approved

Content owns animation intent, including:

- educational purpose;
- scene identity;
- industrial component identity;
- relevant normal and fault states;
- observable movements;
- evidence or stage bindings;
- required signals or alarms;
- source-asset references;
- poster and thumbnail intent.

### 13.3 Engine ownership

**State:** Approved

Experience Engine owns:

- validation of animation references;
- normalization of animation intent;
- binding to Experience states;
- deterministic generation orchestration;
- publication eligibility;
- generated asset manifests.

It does not own the industrial knowledge expressed by the storyboard.

### 13.4 Frontend ownership

**State:** Established

Frontend renders approved generated media or animation state. Rendering must remain read-only with respect to Player decisions, evidence, scoring, safety, and completion.

### 13.5 Generated media

**State:** Recommended

Poster, thumbnail, MP4, WebM, GIF, and any future delivery formats are Generated Artifacts when produced from canonical source assets or storyboards.

The required formats, resolutions, codecs, aspect ratios, accessibility alternatives, timeline semantics, coordinate model, and rendering technology remain:

**TBD — Requires architecture decision**

## 14. Deferred Work

The following are excluded from Experience Model v1 unless separately approved:

- persistent learner profiles;
- cross-device progress;
- authentication;
- analytics;
- certification;
- proctoring;
- psychometric scoring;
- multiplayer;
- collaborative sessions;
- real PLC connectivity;
- OPC UA execution;
- cloud execution;
- automatic media generation implementation;
- 3D rendering technology;
- backend platform selection.

## 15. Product Owner Decision Status

### 15.1 Approved for Experience Definition v1

The Product Owner approved the following decisions on 2026-07-30, exactly within the boundaries defined by this document:

1. contractual public/private separation;
2. mandatory Experience classes;
3. governed Capability references;
4. the approved authoring-scoring scope;
5. unknown-property handling only to the extent already defined by this decision, without introducing an additional policy or default;
6. the minimum animation boundary;
7. independent Authoring Definition versioning;
8. the explicit legacy compatibility policy.

This approval authorizes Package 5A. It does not authorize normalization, Generated Web Artifact implementation, Player changes, runtime scoring development, a complete animation model, Capability System implementation, or Assessment Engine implementation.

### 15.2 Decisions that remain pending

The following decisions remain subject to separate approval:

- the Normalized Runtime Contract implementation;
- the detailed treatment of the existing declarative schema 2.0.0;
- normalized relationship authority beyond the authoring validation boundary;
- Generated Web Artifact implementation;
- the complete executable Validation Result contract beyond Package 5A preparation;
- detailed animation and media formats, resolutions, codecs, timelines, coordinates, accessibility alternatives, and rendering technology;
- whether Assessment Experience runtime support belongs to an initial runtime contract or a later extension;
- every item explicitly marked `TBD — Requires architecture decision`.

## 16. Acceptance Criteria for This Decision

This decision is ready for approval when:

- each contract has one owner;
- authoring and runtime responsibilities cannot be confused;
- the generated artifact cannot become an editable source;
- private diagnostic content has a defined publication boundary;
- compatibility terminology matches actual behavior;
- Capability and Assessment dependencies are explicit;
- EXP-SPEC-001 has a minimum architectural boundary without selecting a speculative renderer;
- deferred work is clearly excluded.

## 17. Consequences

If approved:

- Experience Schema v1 can be designed against an explicit authoring boundary;
- adapter and validation responsibilities become independently testable;
- Player no longer needs to depend directly on the complete authoring shape;
- public artifacts can be minimized without weakening the headless runtime;
- animation can evolve without coupling rendering technology to Experience logic;
- Assessment Experiences can impose stricter disclosure rules without redesigning Learning Experiences.

If not approved, the current vertical slice may continue operating, but its implicit contracts must not be treated as a stable platform model.

## 18. Approval Record

| Decision | Status | Approver | Date |
|---|---|---|---|
| Decisions 1–8 required for Experience Definition v1 | Approved | Product Owner | 2026-07-30 |

- **Approved by:** Product Owner
- **Approval date:** 2026-07-30
- **Approval scope:** Decisions 1–8 required for Experience Definition v1
- **Implementation authorization:** Package 5A may proceed within the approved boundaries
