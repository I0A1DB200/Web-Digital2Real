# Digital2Real --- QA Standard

**Document:** 09\
**Role:** Canonical QA and Definition of Done

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## 1. QA layers

``` text
SOURCE / ENGINEERING QA
→ AUTOMATED CONTRACT QA
→ GENERATED ARTIFACT QA
→ AUTOMATIC LEARNER FLOW
→ REAL BROWSER QA
```

## 2. Source/engineering QA

Validate:

-   technical reasoning;
-   root cause;
-   initial/acquired evidence classification;
-   reciprocal evidence authority;
-   spoiler boundaries;
-   safety prerequisites;
-   diagnosis/intervention/verification classification;
-   recovery criteria;
-   media semantics;
-   cross-asset coherence;
-   ES/EN equivalence.

## 3. Automated QA

Validate as applicable:

-   exact decisions;
-   exact options;
-   correct/incorrect counts;
-   evidence counts;
-   stage media map;
-   evidence media map;
-   completion media;
-   Result/direct flow;
-   wrong → Retry;
-   no wrong-path evidence unlock;
-   completion timing;
-   Continue side-effect invariants;
-   localization;
-   package validity;
-   `git diff --check`.

## 4. Generated artifact QA

Regenerate preview/runtime artifacts.

Inspect generated ES and EN against canonical source.

Check projection semantics, especially initial/context evidence.

## 5. Automatic learner flow

Exercise the complete logical path where tooling permits:

-   wrong options;
-   Retry;
-   correct options;
-   Result;
-   Continue;
-   final verification;
-   completion;
-   Debrief.

## 6. Browser QA

Real browser QA must validate:

-   Incident Brief;
-   cover;
-   navigation into Experience;
-   correct and representative wrong decisions;
-   Retry;
-   evidence order;
-   Result media;
-   Continue;
-   intervention;
-   verification;
-   completion;
-   Debrief;
-   progress/persistence;
-   asset timing;
-   ES/EN;
-   desktop/mobile;
-   console/network.

## 7. Browser infrastructure failure

After independent infrastructure failures, classify:

``` text
BROWSER QA / AUTOMATION
STATUS: INFRASTRUCTURE BLOCKED
```

Do not classify as product defect without product evidence.

Do not lower Definition of Done.

## 8. Shared-suite failure classification

  -----------------------------------------------------------------------
  Class                   Meaning                 Response
  ----------------------- ----------------------- -----------------------
  A                       Target Experience       Repair target
                          regression              

  B                       Pre-existing            Document/isolate
                          test/fixture debt       

  C                       Shared Engine           Stop and escalate
                          regression              architecture

  D                       Stale generated         Regenerate
                          artifact                

  E                       Invalid/outdated        Document then correct
                          expectation             test if authorized

  F                       Infrastructure failure  Record; do not alter
                                                  product
  -----------------------------------------------------------------------

## 9. Status vocabulary

Use precise status:

``` text
AUDITED
DESIGNED
IMPLEMENTED
AUTOMATED PASS
BROWSER QA PENDING
BROWSER QA PASS
PUBLISHED
BLOCKED
```

`AUTOMATED PASS` does not mean final certified.

## 10. Definition of Done

A production Experience is Done only when:

-   engineering source is defensible;
-   automated required checks pass or unrelated debt is classified;
-   generated output is validated;
-   full browser learner run passes;
-   assets appear at intended moments;
-   ES/EN passes;
-   desktop/mobile passes;
-   console/network checks pass;
-   repository scope is clean;
-   unresolved debt is explicitly recorded.

## 11. Report

Final QA report states:

-   target;
-   source status;
-   tests and counts;
-   failures and classifications;
-   generated validation;
-   browser validation;
-   product defects;
-   infrastructure defects;
-   file scope;
-   Engine changes;
-   binary changes;
-   final status.

## 12. Governing rule

> QA verifies the product contract; it does not rewrite the product
> architecture merely to make tests pass.
