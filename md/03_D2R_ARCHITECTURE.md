# Digital2Real --- Architecture

**Document:** 03\
**Version:** 1\
**Date:** 2 October 2026\
**Role:** Canonical high-level architecture and ownership model\
**Governance:** Read with `01_ENGINEERING_DIRECTOR_PLAYBOOK.md` and
`02_AGENTS.md`

------------------------------------------------------------------------

## 1. Purpose

This document defines the high-level architecture of Digital2Real and
establishes which layer owns each responsibility.

Its purpose is to prevent:

-   duplicated sources of truth;
-   Experience-specific architectural patches;
-   content logic leaking into the Engine;
-   Engine behavior being duplicated in content;
-   assets becoming detached from engineering meaning;
-   Codex making product or architecture decisions implicitly.

When a defect or new requirement appears, use this document to identify
the owning layer before implementation.

------------------------------------------------------------------------

## 2. Product definition

Digital2Real is an industrial automation engineering platform.

It exists to develop:

-   technical knowledge;
-   engineering judgement;
-   industrial troubleshooting;
-   practical diagnostic reasoning;
-   reusable engineering knowledge.

Digital2Real has two canonical content products:

``` text
NOTEBOOK
→ structured reusable engineering knowledge
→ permanent technical SSOT

EXPERIENCES
→ interactive industrial diagnosis and troubleshooting
→ teach engineers how to think
```

Everything else in the repository exists to create, govern, execute,
validate, or deliver these products.

------------------------------------------------------------------------

## 3. System architecture

``` text
                         DIGITAL2REAL
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ↓                               ↓
          NOTEBOOK                      EXPERIENCES
              │                               │
      Technical knowledge             Engineering cases
              │                               │
              │                         Experience packages
              │                               │
              │                        Experience Engine
              │                               │
              │                        Experience Lab / ENV
              │                               │
              └───────────────┬───────────────┘
                              ↓
                           WEBSITE
                              │
                              ↓
                           LEARNER
```

Governance surrounds the delivery architecture:

``` text
ARCHITECT
→ defines architecture, standards, quality, and invariants

CODEX
→ inspects, implements, tests, validates, and reports
→ does not decide product architecture implicitly

QA
→ verifies technical, semantic, runtime, and learner behavior
```

------------------------------------------------------------------------

## 4. Ownership model

  -----------------------------------------------------------------------
  Layer                   Owns                    Does not own
  ----------------------- ----------------------- -----------------------
  **Notebook**            Permanent reusable      Interactive diagnostic
                          engineering knowledge   state

  **Experience content**  Incident, decisions,    Shared player behavior
                          evidence, engineering   
                          reasoning,              
                          localization, media     
                          references              

  **Experience Engine**   Generic runtime         Experience-specific
                          semantics, projection,  engineering facts
                          player state, Result    
                          behavior, persistence   
                          contracts               

  **Experience Lab /      Discovery, environment  Canonical Experience
  ENV**                   context,                reasoning
                          hotspot-to-Experience   
                          access, environment     
                          progress presentation   

  **Asset system**        Media registry,         Evidence unlock
                          provenance, semantic    authority
                          suitability, reusable   
                          engineering media       

  **QA**                  Verification of         Product design by test
                          authored and runtime    side effect
                          behavior                

  **Architect**           Governance,             Routine implementation
                          architecture, quality   
                          boundaries              

  **Codex**               Implementation within   Unapproved
                          approved contracts      architecture/product
                                                  decisions

  **Website**             Delivery and            Permanent engineering
                          presentation surface    SSOT
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Notebook architecture

Notebook is the permanent technical knowledge layer.

Its canonical role is:

> **Structured, reusable engineering knowledge / technical SSOT.**

Notebook content should capture knowledge that remains useful outside a
single troubleshooting scenario.

Canonical Notebook structure:

1.  Industrial problem
2.  Limitation / current issue
3.  Technology
4.  Architecture
5.  Data / behavior
6.  Industrial example
7.  Engineering decisions
8.  Common mistakes
9.  PLC / implementation architecture
10. Conclusions

Notebook knowledge may support Experiences.

Experiences should not duplicate large Notebook explanations when a
reusable knowledge source is more appropriate.

The relationship is:

``` text
NOTEBOOK
→ explains engineering knowledge

EXPERIENCE
→ exercises engineering judgement using a concrete case
```

------------------------------------------------------------------------

## 6. Experience architecture

An Experience is an authored engineering case.

It owns:

-   incident context;
-   system context;
-   private root cause;
-   diagnostic decisions;
-   correct and incorrect options;
-   evidence;
-   evidence authority;
-   intervention;
-   verification;
-   recovery criteria;
-   localized learner-facing content;
-   references to media;
-   completion/debrief content.

An Experience does not own generic runtime behavior.

### 6.1 Semantic learner model

``` text
INCIDENT CONTEXT
→ INVESTIGATION
→ DECISION / ACTION
→ EVIDENCE ACQUIRED
→ RESULT when useful
→ NEXT ENGINEERING MOMENT
→ INTERVENTION
→ VERIFICATION
→ DEBRIEF
```

The exact number of decisions, Results, and stages depends on the
engineering case.

There is no requirement that every Experience use the same count or
shape.

------------------------------------------------------------------------

## 7. Experience Engine architecture

The Experience Engine is shared infrastructure.

Its job is to execute valid Experience content consistently.

It owns generic capabilities such as:

-   schema/contract interpretation;
-   content normalization;
-   runtime projection;
-   decision handling;
-   evidence unlocking;
-   Result presentation behavior;
-   completion transitions;
-   generic persistence/progress contracts;
-   shared rendering behavior.

The Engine must remain content-agnostic.

It must not contain rules such as:

``` text
if EE-0010 → special behavior
if sensor Experience → special result
if this asset → hide it
```

Experience-specific engineering behavior belongs in Experience content.

### 7.1 Engine change rule

An Engine change is justified when:

1.  the required behavior is reusable;
2.  the current Engine cannot represent the required semantics
    correctly;
3.  content-only changes would be incorrect or create duplication;
4.  the architectural effect is understood;
5.  shared validation can protect the new behavior.

Then:

``` text
fix Engine once
→ keep Experiences declarative
```

------------------------------------------------------------------------

## 8. Experience package architecture

Each production Experience is a self-contained authored package within
the repository's canonical content structure.

A package may contain, according to the repository contract:

-   canonical Experience YAML;
-   localized ES content;
-   localized EN content;
-   Experience-local assets;
-   asset/media registry information;
-   README/source notes;
-   focused tests or references to focused tests.

The repository's real package conventions are authoritative.

Do not invent a parallel package format.

### 8.1 Source versus generated artifacts

Authored source and generated runtime/preview artifacts have different
roles.

``` text
AUTHORED SOURCE
→ authority

GENERATION / PACKAGING
→ transformation

GENERATED PREVIEW / RUNTIME DATA
→ derived artifact
```

When generated output disagrees with canonical source:

1.  classify the discrepancy;
2.  determine whether generation is stale or incorrect;
3.  regenerate where appropriate;
4.  do not manually patch generated output as the primary fix.

------------------------------------------------------------------------

## 9. Environment architecture

Experience Lab organizes Experiences into industrial environments.

Canonical hierarchy:

``` text
Experience Lab
→ Environment Selector
→ ENV
→ interactive environment/map
→ Engineering Experiences
```

Current product rule:

> **Each ENV contains exactly 10 Engineering Experiences.**

Environment progress derives from canonical Experience completion state.

Do not create a second independent ENV progress truth.

### 9.1 ENV responsibility

An ENV may own:

-   environment identity;
-   representative industrial image;
-   localized title/description;
-   engineering skills/knowledge presentation;
-   hotspot configuration;
-   Experience association;
-   environment-level presentation.

An ENV does not own the diagnostic logic of an Experience.

### 9.2 Experience association

Experience association must use the repository's canonical Experience
identifiers and environment configuration.

The relationship should remain declarative:

``` text
ENV
→ hotspot / association
→ Experience editorial identity
→ canonical Experience package
```

------------------------------------------------------------------------

## 10. Experience Lab presentation

The selector is the discovery layer above the existing environment
renderer.

Canonical navigation:

``` text
Experience Lab
→ ENV selector
→ ENV detail / map
→ hotspot
→ Experience
```

Returning to all environments returns to the selector.

Environment cards may present:

-   ENV identifier;
-   representative image;
-   title;
-   short technical description;
-   `10 Engineering Experiences`;
-   segmented progress;
-   completed count;
-   contextual menu.

Presentation must derive from canonical environment and completion data.

------------------------------------------------------------------------

## 11. Evidence architecture

Evidence is authored engineering meaning.

Evidence answers:

> What has the learner legitimately established?

Two evidence classes exist:

``` text
INITIAL / CONTEXT
INTERACTIVE / ACQUIRED
```

Initial/context evidence can exist before learner interaction.

Interactive/acquired evidence must be earned by an action.

Evidence ownership is not transferred to media.

``` text
DECISION / ACTION
→ unlock authority

EVIDENCE
→ engineering meaning

MEDIA
→ representation of that evidence
```

For full semantics, follow `07_EVIDENCE_MEDIA_SEMANTICS.md`.

------------------------------------------------------------------------

## 12. Media architecture

Media is a semantic presentation layer.

Canonical roles:

``` text
COVER
→ incident identity / presentation

STAGE MEDIA
→ information already available before decision

EVIDENCE MEDIA
→ information acquired through action

COMPLETION MEDIA
→ final synthesis / recovery context
```

A media file can be technically valid yet semantically unsuitable for a
specific learning moment.

Therefore asset validity has at least two dimensions:

``` text
TECHNICAL VALIDITY
+
SEMANTIC VALIDITY
```

Both are required for presentation.

Asset governance is defined in `08_ASSET_GOVERNANCE.md`.

------------------------------------------------------------------------

## 13. Asset library architecture

Digital2Real should maintain a reusable industrial media library
alongside Experience-local assets.

Logical reusable domains include:

``` text
PLC
DRIVES
SENSORS
IO-LINK
INDUSTRIAL NETWORKS
HMI / SCADA
SAFETY
ELECTRICAL
MECHANICAL
```

The reusable library exists to reduce duplicate asset creation and
improve consistency.

The workflow is:

``` text
MEDIA NEED
→ SEARCH LIBRARY
→ SEMANTIC VALIDATION
→ REUSE

or

MEDIA NEED
→ NO VALID EXISTING ASSET
→ NEW ASSET SPECIFICATION
→ CREATION / ACQUISITION
→ TECHNICAL VALIDATION
→ REGISTRATION
→ USE
```

Experience-local published assets remain associated with their
Experience package according to repository conventions.

------------------------------------------------------------------------

## 14. Technical reference architecture

Engineering source material must be distinguishable from public product
content.

Logical reference categories:

``` text
manuals
datasheets
application notes
technical references
```

References support:

-   engineering verification;
-   asset validation;
-   Notebook research;
-   Experience design;
-   technical traceability.

A reference existing in the repository does not automatically mean it
should be published on the website.

------------------------------------------------------------------------

## 15. Governance architecture

The repository governance hierarchy is:

``` text
AGENTS.md
    ↓
ENGINEERING DIRECTOR PLAYBOOK
    ↓
ARCHITECTURE
    ↓
DOMAIN STANDARDS
    ↓
EXECUTION CONTRACTS
    ↓
REPOSITORY EVIDENCE
    ↓
IMPLEMENTATION
    ↓
QA
```

### 15.1 SSOT rule

A rule should have one canonical owner.

Other documents should:

-   link to it;
-   summarize only what is necessary for local execution;
-   avoid maintaining competing versions of the same rule.

### 15.2 Conflict resolution

When documents appear to conflict:

1.  inspect the canonical owner;
2.  inspect current repository implementation;
3.  classify whether the mismatch is documentation debt, implementation
    debt, or an intentional change;
4.  resolve the conflict explicitly.

Do not silently choose whichever version is convenient.

------------------------------------------------------------------------

## 16. Codex architecture

Codex operates inside D2R as an implementation executor.

Expected flow:

``` text
READ GOVERNANCE
→ INSPECT REPOSITORY
→ CLASSIFY TASK
→ IDENTIFY OWNER
→ DESIGN MINIMUM CORRECT DELTA
→ IMPLEMENT
→ TEST
→ INSPECT DIFF
→ REPORT
```

Codex may be given autonomous implementation authority inside an
explicitly defined target.

Autonomy does not imply authority to redefine architecture.

### 16.1 Architecture escalation

If Codex discovers that a target task requires a shared architectural
change:

``` text
STOP TARGET IMPLEMENTATION IF NECESSARY
→ classify ENGINE
→ document evidence
→ describe reusable capability required
→ describe affected shared components
→ propose validation
→ request/await architectural authorization
```

------------------------------------------------------------------------

## 17. QA architecture

QA is layered.

``` text
SOURCE / ENGINEERING QA
→ semantic correctness

AUTOMATED CONTRACT QA
→ structural/runtime invariants

GENERATED ARTIFACT QA
→ packaging/projection correctness

AUTOMATIC LEARNER FLOW
→ interaction-path correctness

REAL BROWSER QA
→ final learner behavior
```

Automated PASS is not equivalent to final certification.

Browser QA remains a required final gate for production completion.

Full QA rules are defined in `09_QA_STANDARD.md`.

------------------------------------------------------------------------

## 18. Change ownership decision matrix

  -----------------------------------------------------------------------
  Problem                 Owner                   Normal response
  ----------------------- ----------------------- -----------------------
  Wrong engineering       Experience / Notebook   Correct source content
  statement               content                 

  Evidence revealed too   Experience content      Correct
  early because YAML                              evidence/decision
  authority is wrong                              mapping

  Valid YAML cannot       Experience Engine       Architectural Engine
  express required                                change
  reusable behavior                               

  Image contradicts       Asset/content           Hide, remap, or replace
  canonical topology      governance              asset

  Generated preview       Generation/package      Regenerate or repair
  differs from valid      layer                   generator
  source                                          

  Shared test fixture is  Test infrastructure     Correct fixture after
  stale                                           classification

  Browser automation      QA infrastructure       Record infrastructure
  cannot click stable UI                          failure

  ENV progress disagrees  ENV/aggregation         Derive from canonical
  with Experience         implementation          completion state
  completion                                      

  Same engineering        Knowledge architecture  Move reusable knowledge
  explanation duplicated                          to Notebook SSOT
  across products                                 
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 19. Architecture invariants

The following must remain true:

``` text
ONE reusable engineering knowledge authority
→ Notebook

ONE Experience engineering authority
→ canonical Experience source

ONE generic runtime authority
→ Experience Engine

ONE evidence authority model
→ authored evidence + interaction relationship

ONE asset semantic governance model
→ Asset Governance

ONE QA definition
→ QA Standard

ONE repository entry point for agents
→ AGENTS.md
```

Derived artifacts may exist.

Competing canonical truths should not.

------------------------------------------------------------------------

## 20. Current implementation direction

The architecture supports the following production direction:

``` text
Notebook
→ reusable technical knowledge

Experience Lab
→ industrial environment discovery

ENV
→ 10 Engineering Experiences

Experience
→ incident + diagnosis + evidence + intervention + verification

Experience Engine
→ generic execution

Asset Library
→ reusable validated industrial media

Technical Reference Library
→ reusable engineering source material

Codex contracts
→ repeatable implementation workflows

QA
→ engineering + automated + browser validation
```

This architecture is intended to support the next tens or hundreds of
Experiences without turning each new Experience into a new software
architecture problem.

------------------------------------------------------------------------

## 21. Final architecture rule

> **Put knowledge, behavior, media, and validation in the layer that
> owns them. Keep Experiences declarative, keep the Engine generic, keep
> Notebook reusable, and keep the repository as the operational source
> of truth.**
