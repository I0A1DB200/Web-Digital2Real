# Codex Contract --- Audit Experience

**Document:** 13\
**Mode:** INSPECT → AUDIT → DESIGN → REPORT\
**Implementation:** No production changes

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## INPUT

Target Experience: `<EE-ID or path>`

## OBJECTIVE

Produce an engineering-semantic audit and an implementation-ready remap
design.

## REQUIRED READING

Read repository governance plus:

-   Experience Design Standard;
-   Evidence & Media Semantics;
-   Asset Governance;
-   QA Standard.

## INSPECT

Inspect:

-   canonical YAML;
-   ES/EN;
-   asset registry;
-   actual asset pixels where accessible;
-   package/source notes;
-   focused tests;
-   relevant Engine contract only as needed;
-   generated preview only if needed to understand current behavior.

## REPORT CURRENT STATE

State:

-   editorial/technical ID;
-   contract/content version;
-   publication status;
-   locales;
-   system;
-   incident;
-   private root cause;
-   decisions/options;
-   evidence;
-   assets;
-   current stage/evidence/completion media maps.

## CLASSIFY EVIDENCE

Separate:

``` text
INITIAL / CONTEXT
INTERACTIVE / ACQUIRED
```

Validate reciprocal authority for acquired evidence.

## BUILD LEARNING-MOMENT MATRIX

For every decision:

| Moment \| Known before \| Action \| Class \| Evidence \| Media \|
  Conclusion \| Direct/Result \|

Classify action as Diagnosis, Intervention, Verification, or defensible
Combined.

## AUDIT ASSETS

For every asset record:

-   pixels;
-   proves;
-   does not prove;
-   current use;
-   earliest legitimate disclosure;
-   proposed role;
-   cross-asset compatibility;
-   final status.

## CHECK

-   spoilers;
-   safety timing;
-   root-cause timing;
-   intervention vs verification;
-   recovery criteria;
-   static-image overclaiming;
-   ES/EN equivalence;
-   Engine capability.

## OUTPUT

Return:

1.  Experience identity
2.  Current flow
3.  Engineering findings
4.  Evidence classification
5.  Learning-moment matrix
6.  Asset semantic map
7.  Proposed stage media map
8.  Proposed evidence media map
9.  Proposed completion media
10. Hidden/reused assets
11. Safety/spoiler changes
12. Engine capability assessment
13. Minimum implementation delta
14. Expected files
15. Test plan
16. Blockers/uncertainty

Do not modify production files. Do not commit. Do not push.
