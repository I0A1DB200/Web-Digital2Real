# Digital2Real --- Experience Engine

**Document:** 04\
**Role:** Canonical shared-runtime architecture

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## 1. Purpose

The Experience Engine is the generic runtime that executes authored
Engineering Experiences. It owns reusable interaction semantics and must
remain independent of the engineering facts of any specific Experience.

## 2. Ownership boundary

The Engine owns:

-   contract/schema interpretation;
-   normalization and projection;
-   generic stage/decision flow;
-   attempt handling;
-   evidence unlocking;
-   Result presentation;
-   Continue transitions;
-   completion registration;
-   generic progress/persistence contracts;
-   shared rendering and localization mechanics;
-   graceful handling of missing presentation media.

Experience content owns:

-   incident and system context;
-   private root cause;
-   decisions and options;
-   evidence meaning;
-   which action reveals which evidence;
-   intervention and verification;
-   recovery criteria;
-   media references;
-   learner-facing ES/EN text.

## 3. Core runtime flow

``` text
Incident Brief
→ Stage
→ Decision
   ├─ incorrect → Retry → same diagnostic moment
   └─ correct
       → register action/evaluation
       → unlock authored evidence
       ├─ useful newly unlocked media → Result → Continue
       └─ no Result needed → next Stage
→ final verification
→ completion earned
→ optional final Result
→ Debrief
```

`Result` is a presentation mode, not an authored lifecycle stage.

## 4. Evidence authority

The Engine must preserve the distinction between authored context
evidence and projected interactive evidence.

``` text
INITIAL / CONTEXT
→ may use revealed_by: []
→ need not appear in interactive projection

INTERACTIVE / ACQUIRED
→ earned through authored action
→ unlock authority comes from the decision/evidence relationship
```

Media never becomes evidence authority.

## 5. Result semantics

A Result exists only to present newly acquired evidence/media after a
correct action.

A Result:

-   may group several related evidence items acquired in one engineering
    moment;
-   preserves evidence ordering from the authored unlock relationship;
-   preserves media ordering inside each evidence item;
-   does not create a new attempt;
-   does not unlock additional evidence;
-   does not own a destination independently of the action;
-   does not own score/mastery;
-   does not register completion;
-   hides the next stage until Continue.

## 6. Continue semantics

`Continue` is presentation-only.

It performs the already-determined transition after Result presentation.

It must not mutate:

-   attempts;
-   evidence;
-   evaluation;
-   mastery;
-   score;
-   completion.

## 7. Completion semantics

Completion is earned when authored recovery criteria are satisfied.

``` text
corrective action performed ≠ recovery verified
```

If intervention and verification are separate authored actions,
intervention cannot register recovery.

If one authored action defensibly performs intervention and verifies
recovery, a combined action may complete the Experience.

If final verification unlocks media:

``` text
verification
→ register completion
→ Result
→ Continue
→ Debrief
```

Completion therefore exists before final Continue.

## 8. Cover semantics

`public.visual.cover_asset_id` belongs to Incident Brief presentation.

Cover must not affect:

-   evidence;
-   attempts;
-   score;
-   mastery;
-   progress;
-   completion;
-   retry.

Missing cover media must degrade gracefully rather than corrupt
diagnostic state.

## 9. Media resolver requirements

Shared media resolution must:

-   preserve requested order;
-   resolve registered assets consistently;
-   support intentional reuse;
-   avoid global deduplication that destroys authored meaning;
-   handle missing physical files predictably;
-   keep evidence text and learner controls usable when an image fails.

## 10. Persistence boundary

Persisted completion/progress and active interaction-session restoration
are separate capabilities.

Do not infer active-session restoration merely because completion is
persisted.

The current authored/runtime contract must be documented explicitly
before changing persistence semantics.

## 11. Engine capability gate

Classify a requirement as `ENGINE` only when all are true:

1.  the desired behavior is semantically valid;
2.  the behavior is reusable across Experiences;
3.  current content contracts cannot represent it correctly;
4.  a content workaround would duplicate logic or corrupt meaning.

Required response:

``` text
CLASSIFICATION: ENGINE
MISSING CAPABILITY:
WHY CONTENT CANNOT SOLVE IT:
SHARED COMPONENTS AFFECTED:
BACKWARD-COMPATIBILITY RISK:
TESTS REQUIRED:
```

Then stop before shared Engine modification unless explicitly
authorized.

## 12. Anti-patterns

Do not implement:

-   Experience-ID conditionals in the player;
-   asset-ID conditionals in shared renderers;
-   hidden special cases for one YAML package;
-   completion based on image presence;
-   Result-specific evidence authority;
-   duplicated content semantics inside renderer code;
-   automatic media filtering that changes authored timing.

## 13. Backward compatibility

Shared Engine changes must be additive or explicitly migrated.

Validation must include representative legacy Experiences and
new-contract Experiences.

A new optional content field must not break packages that omit it.

## 14. Generated artifacts

Generated preview/player output is derived.

When source and generated output disagree:

``` text
inspect source
→ inspect generator/projector
→ classify stale artifact vs Engine defect
→ regenerate or fix owner
```

Do not manually patch generated artifacts as the canonical repair.

## 15. Engine Definition of Done

An Engine change is complete only when:

-   architecture ownership is documented;
-   schema/normalizer/projector/player behavior agrees;
-   backward compatibility is validated;
-   focused Engine tests pass;
-   representative Experience tests pass;
-   generated preview is regenerated;
-   learner flow is validated;
-   real browser QA is completed when required;
-   no Experience-specific hack was introduced.

## 16. Governing rule

> Keep the Engine generic and Experiences declarative. If a behavior is
> reusable runtime semantics, implement it once in the Engine; if it is
> engineering meaning, keep it in content.
