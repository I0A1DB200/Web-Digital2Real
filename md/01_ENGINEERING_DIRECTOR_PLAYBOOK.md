# Digital2Real --- Engineering Director Playbook

**Version:** 2\
**Date:** 2 October 2026\
**Scope:** Architecture · Codex contracts · Experience Engine · Media
semantics · QA\
**Status:** Canonical engineering governance for Digital2Real

> Digital2Real is an industrial automation engineering platform. It is
> not a blog, generic course library, or tutorial collection.

------------------------------------------------------------------------

## 1. Purpose and product boundary

This document is the operating reference for creating, reviewing,
implementing, validating, and maintaining Digital2Real work.

Its purpose is to preserve the reasoning behind the platform so future
Notebook entries, Engineering Experiences, assets, architecture changes,
and Codex executions follow one coherent engineering system.

Digital2Real produces two content products:

  -----------------------------------------------------------------------
  Product                 Purpose                 Canonical role
  ----------------------- ----------------------- -----------------------
  **Notebook**            Structured, reusable    Permanent technical
                          engineering knowledge.  SSOT.

  **Experiences**         Interactive diagnosis,  Teach engineers how to
                          decisions, and          think.
                          troubleshooting.        
  -----------------------------------------------------------------------

### Core architecture

``` text
Notebook → permanent engineering knowledge / SSOT
Experience Engine / Experience Lab → interactive industrial learning
Architect → governance, architecture, and quality control
Codex → implementation executor, not product decision-maker
Website → final delivery surface
```

------------------------------------------------------------------------

## 2. Engineering principles

These principles are invariants:

-   Engineering over marketing.
-   Understanding and judgement over memorization.
-   Reusable systems over isolated fixes.
-   Accuracy and maintainability over speed.
-   Single source of truth over duplicated knowledge.
-   Never invent technical information; expose uncertainty.
-   Fix architecture once instead of patching every Experience.
-   Do not solve content problems with renderer hacks.
-   Do not solve Engine problems by editing every Experience YAML.
-   A registered asset has no right to be presented merely because it
    exists.
-   Static media illustrates evidence; it does not automatically prove
    the engineering claim.

------------------------------------------------------------------------

## 3. Work classification before editing

Before modifying the repository, classify the work.

### 3.1 Product/work type

-   `NOTEBOOK`
-   `EXPERIENCE`
-   `ARCHITECTURE`
-   `NON-D2R`

### 3.2 Implementation problem

-   `ENGINE`
-   `CONTENT`
-   `INTENTIONAL REUSE`
-   `UNUSED`
-   `TECHNICAL DEBT`

### 3.3 Evidence

-   `INITIAL / CONTEXT`
-   `INTERACTIVE / ACQUIRED`

### 3.4 Correct action

-   `DIAGNOSIS`
-   `INTERVENTION`
-   `VERIFICATION`
-   `COMBINED INTERVENTION + VERIFICATION` when technically defensible

### 3.5 Asset role

-   `COVER`
-   `STAGE`
-   `EVIDENCE`
-   `COMPLETION`
-   `INTENTIONAL MULTI-ROLE`
-   `REGISTERED BUT NOT PRESENTED`

Classification occurs before editing because the correct fix belongs to
the layer that owns the defect.

------------------------------------------------------------------------

## 4. Experience design model

The canonical model is semantic, not a mandatory screen template.

``` text
INCIDENT CONTEXT
→ INVESTIGATION
→ DECISION / ACTION
→ EVIDENCE ACQUIRED
→ RESULT when useful post-action media exists
→ CONTINUE
→ NEXT ENGINEERING MOMENT
→ INTERVENTION
→ VERIFICATION
→ DEBRIEF
```

For every learner-visible information item, answer:

1.  **WHAT** does the learner know?
2.  **WHEN** may the learner legitimately know it?
3.  **WHAT action** produced that knowledge?
4.  **WHAT evidence** was acquired?
5.  **WHAT media** represents it, if any?
6.  **WHAT engineering conclusion** becomes justified?

### Critical invariant

> **Corrective action performed ≠ recovery verified.**

Completion is earned only when the authored recovery criteria are
sufficiently established.

------------------------------------------------------------------------

## 5. Evidence authority

### 5.1 Authored evidence versus projected interactive evidence

Authored context evidence and projected interactive evidence are
different concepts.

An initial incident fact may legitimately use:

``` yaml
revealed_by: []
```

and may be absent from the runtime collection generated from interaction
unlocks.

``` text
INITIAL / CONTEXT evidence
→ validated through Incident Brief / initial context
→ interactive projection is not required

INTERACTIVE / ACQUIRED evidence
→ must be earned by a learner action
→ revealed_by and decision unlock authority must agree bidirectionally
```

Therefore:

> **Authored evidence ≠ projected interactive evidence.**

Audits and tests must validate initial/context evidence separately from
acquired evidence.

### 5.2 Multiple evidence items

One engineering action may acquire several related evidence items.

If those evidence items belong to the same engineering acquisition
moment, they may appear in one Result.

Do not create artificial decisions merely to force a
one-evidence-per-Result structure.

------------------------------------------------------------------------

## 6. Media semantics

  --------------------------------------------------------------------------------
  Location                         Canonical semantic role Must not do
  -------------------------------- ----------------------- -----------------------
  `public.visual.cover_asset_id`   Incident Brief /        Create evidence,
                                   incident identity       attempts, score,
                                                           progress, or completion

  `stages[].media_ids`             Information available   Reveal information the
                                   before the current      learner has not
                                   decision                acquired

  `evidence[].media_ids`           Information acquired by Act as unlock authority
                                   the correct action      by itself

  `completion.media_ids`           Final synthesis /       Substitute for authored
                                   verified-recovery       functional verification
                                   context                 

  `Result`                         Presentation state for  Become a decision,
                                   newly acquired          attempt, unlock
                                   evidence/media          authority, or second
                                                           completion event
  --------------------------------------------------------------------------------

### 6.1 Cover

The cover belongs inside the Incident Brief.

It is presentation and context only. It must not:

-   create diagnostic progress;
-   unlock evidence;
-   create attempts;
-   affect score or mastery;
-   complete an Experience;
-   create an additional learner lifecycle stage.

### 6.2 Stage media

`stages[].media_ids` contains information the learner is legitimately
allowed to know **before** making the current decision.

A stage must not reveal evidence that should only exist after an action.

### 6.3 Evidence media

`evidence[].media_ids` represents information obtained through an
action.

Evidence authority remains defined by the authored evidence/decision
relationship. Media references do not become unlock authority.

### 6.4 Completion media

`completion.media_ids` provides final synthesis or verified-recovery
context.

Completion media does not itself prove recovery. Recovery must already
have been established by the authored verification.

### 6.5 Static-media discipline

Always separate what the pixels show from what the authored observation
or test establishes.

Examples:

-   A green indicator does not prove stable recovery.
-   A static PLC screen does not prove complete PLC/network health.
-   A connector image does not prove continuity, torque, or correct
    functional operation.
-   A safety status bit does not constitute physical authorization to
    intervene.
-   A post-repair image does not prove repeatability unless the authored
    verification establishes it.
-   A plausible screenshot may still be semantically incompatible with
    the canonical system.

------------------------------------------------------------------------

## 7. Result and player semantics

### Correct decision with newly unlocked evidence and useful media

``` text
stage
→ register action / evidence / evaluation
→ Result
→ Continue
→ next stage
```

### Correct decision with textual evidence only

``` text
stage
→ register action / evidence / evaluation
→ direct next stage
```

### Incorrect decision

``` text
wrong option
→ Retry
```

No advance. No evidence unlock. No completion.

### Final correct decision with media

``` text
verification succeeds
→ register evidence / evaluation / completion
→ Result
→ Continue
→ Debrief
```

### Continue invariant

`Continue` is presentation-only.

It must not:

-   create an attempt;
-   unlock evidence;
-   mutate evaluation or mastery;
-   register completion a second time;
-   change the authored destination logic.

Completion is registered when the recovery criteria are earned, even if
the final interaction presents a Result before Debrief.

------------------------------------------------------------------------

## 8. Diagnosis, intervention, and verification

Every correct action must be classified by engineering function.

Do not force every Experience into the same shape.

  -----------------------------------------------------------------------
  Pattern                             When valid
  ----------------------------------- -----------------------------------
  Diagnosis → Intervention →          Corrective work and proof of
  Verification                        recovery are separate engineering
                                      actions.

  Diagnosis → Combined intervention + One authored action genuinely
  verification                        performs both and its evidence
                                      establishes recovery.

  Logical proof → Physical inspection Logic localizes the fault domain
  → Intervention                      but does not establish the physical
                                      cause.
  -----------------------------------------------------------------------

### 8.1 Intervention does not imply recovery

If the authored case separates intervention from verification, recovery
evidence belongs to verification.

### 8.2 Logical relationship does not necessarily establish physical cause

A demonstrated logical relationship can localize a fault without
establishing its physical cause.

Physical inspection may therefore require an independent diagnostic
moment.

This distinction is especially important when PLC logic identifies a
blocked condition but the actual physical obstruction, misalignment,
wiring defect, or mechanical cause has not yet been observed.

------------------------------------------------------------------------

## 9. Asset governance and authority

Assets are engineering information, not decoration.

Rules:

-   Inspect actual image pixels; never infer semantics from filenames
    alone.
-   Validate cross-image coherence.
-   Check device/master, channel, PLC block, address, network, topology,
    and machine state where relevant.
-   Do not reconcile contradictory screenshots by inventing
    architecture.
-   `REGISTERED BUT NOT PRESENTED` is a valid final state.
-   Intentional reuse is valid when the same acquired information
    remains legitimate context.
-   Do not reuse a pre-repair image after correction if it communicates
    a false current state.
-   Binary authority and semantic presentation timing are separate
    concerns.
-   Do not synchronize duplicate binary collections until source
    authority is explicitly established.

### 9.1 Asset semantic audit record

For every relevant asset record:

  Field             Required judgement
  ----------------- --------------------------------------------------------
  ART ID / file     Exact registry identity and file
  Pixels            What is actually visible
  Proves            Claims defensibly supported
  Does not prove    Claims that remain unsupported
  Current moment    Where it is shown now
  Proposed moment   Where it should be shown
  Role/status       COVER / STAGE / EVIDENCE / COMPLETION / REUSE / HIDDEN

------------------------------------------------------------------------

## 10. Safety and engineering realism

Safety prerequisites required for an action must be visible **before**
that action.

Use only constraints supported by the authored case.

Do not invent:

-   LOTO sequences;
-   PPE requirements;
-   isolation procedures;
-   normative limits;
-   timings;
-   test methods;
-   manufacturer-specific procedures.

For every technical conclusion verify:

1.  Which observation supports it?
2.  Which learner action acquired that observation?
3.  Was the observation legitimately known before the conclusion became
    visible?
4.  Is the conclusion stronger than the evidence?
5.  Is a static image being asked to prove dynamic or physical behavior
    it cannot establish?

------------------------------------------------------------------------

## 11. Codex operating contract

Codex is the implementation executor.

Once the Experience method is established, Codex may autonomously:

-   audit target content;
-   design a semantic remap;
-   modify target Experience YAML/locales/docs/focused tests;
-   run focused and relevant shared tests;
-   regenerate preview;
-   inspect generated ES/EN;
-   execute available automatic learner-flow validation;
-   correct defects introduced within the authorized target scope;
-   classify shared-suite failures;
-   leave semantically invalid assets registered but unpresented.

Codex must stop and report before:

-   changing Engine architecture;
-   changing shared renderer/player/schema/projector behavior;
-   changing unrelated Experiences;
-   changing image binaries unless explicitly authorized;
-   inventing technical facts or topology to rescue an asset;
-   editing unrelated production content merely to make a shared suite
    green.

### 11.1 Engine capability gate

If the authored learning design requires a capability the Engine cannot
represent:

1.  classify the issue as `ENGINE`;
2.  document the missing capability;
3.  explain why content-only changes cannot solve it correctly;
4.  stop before modifying shared architecture unless the task explicitly
    authorizes an Engine change.

------------------------------------------------------------------------

## 12. Standard Experience production pipeline

``` text
IDEA
→ ENGINEERING CASE
→ INFORMATION ARCHITECTURE
→ DECISIONS
→ EVIDENCE AUTHORITY
→ MEDIA SPECIFICATION
→ YAML / LOCALES
→ CODEX AUDIT + IMPLEMENTATION
→ FOCUSED TESTS
→ SHARED TEST CLASSIFICATION
→ git diff --check
→ PREVIEW GENERATION
→ GENERATED ES/EN INSPECTION
→ AUTOMATIC LEARNER FLOW
→ REAL BROWSER QA
→ PUBLICATION
→ MAINTENANCE
```

### 12.1 Audit gate

Before implementation, establish:

-   canonical source, identity, locales, and publication status;
-   exact decision/option/evidence/asset/Result counts;
-   initial versus acquired evidence;
-   learning-moment matrix;
-   asset-by-asset semantic map;
-   bidirectional evidence authority;
-   spoiler findings;
-   safety findings;
-   engineering-realism findings;
-   diagnosis/intervention/verification boundaries;
-   exact stage/evidence/completion media maps;
-   Engine capability assessment;
-   minimum implementation delta;
-   expected file scope;
-   automated test plan.

### 12.2 Implementation gate

Implementation follows the approved semantic design.

It must not silently redesign the Experience unless new repository
evidence invalidates the audit.

If that happens, document the new evidence and update the semantic
design before continuing.

------------------------------------------------------------------------

## 13. Automated QA gate

Automated validation must cover the relevant layers.

  ----------------------------------------------------------------------------------
  Layer                               Required validation
  ----------------------------------- ----------------------------------------------
  Structure                           Exact
                                      decisions/options/correct/incorrect/evidence
                                      counts

  Authority                           Reciprocal evidence authority; no premature
                                      unlocks

  Media                               Exact cover/stage/evidence/completion maps;
                                      hidden assets; reuse

  Wrong paths                         Retry; no advance; no unlock; no completion

  Results                             Correct Result/direct decisions;
                                      evidence/media ordering

  Timing                              Diagnosis, root cause, intervention,
                                      verification, recovery, completion

  Continue                            No attempts/evidence/evaluation
                                      mutation/duplicate completion

  Localization                        ES/EN structural, semantic, safety, and
                                      spoiler equivalence

  Repository                          `git diff --check`; no unauthorized scope

  Packaging                           Preview regenerated; generated ES/EN inspected

  Flow                                Complete automatic learner path where
                                      available
  ----------------------------------------------------------------------------------

### 13.1 Shared-suite failure classification

A failing shared test must be classified before remediation.

  -----------------------------------------------------------------------
  Class                               Meaning and required response
  ----------------------------------- -----------------------------------
  **A --- TARGET EXPERIENCE           Repair within the authorized target
  REGRESSION**                        scope.

  **B --- PRE-EXISTING TEST / FIXTURE Document it. Do not modify
  DEBT**                              unrelated production content.

  **C --- SHARED ENGINE REGRESSION**  Stop the content task and report
                                      the architectural blocker before
                                      Engine changes.

  **D --- STALE GENERATED ARTIFACT**  Regenerate and re-inspect.

  **E --- INVALID / OUTDATED TEST     Document the mismatch before
  EXPECTATION**                       changing the expectation.

  **F --- INFRASTRUCTURE FAILURE**    Record as infrastructure failure;
                                      do not classify it as a product
                                      defect.
  -----------------------------------------------------------------------

A failing shared test does not automatically block the target Experience
and does not automatically authorize edits elsewhere.

------------------------------------------------------------------------

## 14. Browser QA and Definition of Done

Automated PASS is not final certification.

A production Experience is complete only after a real browser learner
run validates the complete journey.

Browser QA must validate:

-   Incident Brief and cover;
-   all correct decisions;
-   representative incorrect decisions;
-   Retry behavior;
-   evidence unlock order;
-   Result timing;
-   Result media;
-   Continue behavior;
-   intervention;
-   verification;
-   completion;
-   Debrief;
-   progress and persistence;
-   every asset at its intended pedagogical moment;
-   ES/EN;
-   desktop/mobile;
-   console/network health.

### 14.1 Infrastructure-blocked browser QA

If browser automation infrastructure fails independently of product
behavior:

``` text
BROWSER QA
STATUS: INFRASTRUCTURE BLOCKED
```

Do not interpret infrastructure failure as a product defect.

Do not lower Definition of Done.

The Experience remains:

``` text
IMPLEMENTED / AUTOMATED PASS / BROWSER QA PENDING
```

until real browser validation succeeds.

------------------------------------------------------------------------

## 15. Reusable lessons from EE-0001 → EE-0011

  -----------------------------------------------------------------------
  Experience                          Reusable engineering lesson
  ----------------------------------- -----------------------------------
  **EE-0001**                         Evidence/media timing matters;
                                      final verification owns recovery;
                                      binary source authority can remain
                                      separate technical debt.

  **EE-0002**                         Registered assets may remain
                                      unpresented when provenance or
                                      semantics are unsuitable.

  **EE-0003**                         Initial/context evidence may be
                                      authored but absent from projected
                                      interactive evidence.

  **EE-0004**                         Intervention and verification
                                      should remain separate when
                                      corrective work does not itself
                                      establish recovery.

  **EE-0005**                         Recovery evidence belongs to
                                      functional verification when the
                                      authored flow separates correction
                                      from proof of recovery.

  **EE-0006**                         Multiple related evidence items may
                                      share one Result when acquired in
                                      the same engineering moment.

  **EE-0007**                         Shared-suite failure does not
                                      authorize unrelated fixes; classify
                                      regression ownership first.

  **EE-0008**                         Combined intervention +
                                      verification is valid when one
                                      authored action genuinely performs
                                      and proves both.

  **EE-0009**                         A plausible asset can contradict
                                      canonical tag/DB architecture and
                                      should remain hidden rather than
                                      reconciled through invention.

  **EE-0010**                         Logical causality does not
                                      necessarily establish physical
                                      cause; physical inspection can
                                      require an independent diagnostic
                                      moment.

  **EE-0011**                         Cross-asset master/channel/topology
                                      consistency must be audited;
                                      correction and verification remain
                                      distinct.
  -----------------------------------------------------------------------

### 15.1 Additional campaign findings

The EE-0008 → EE-0011 campaign established five reusable checks:

1.  A screenshot containing multiple commands or values should wait
    until all those values have legitimately been acquired.
2.  Demonstrated logical relationship does not yet establish physical
    cause.
3.  Cross-image consistency must include master, channel, blocks,
    addresses, topology, and machine state where relevant.
4.  After correction, reusing a pre-correction image may communicate a
    false state; a textual stage pending verification may be more
    accurate.
5.  Test fixtures that mutate YAML by textual substitution must account
    for keys already present, otherwise they can create unrelated
    shared-suite failures.

------------------------------------------------------------------------

## 16. Repository and implementation hygiene

-   Never commit or push unless explicitly authorized.
-   Do not overwrite or revert pre-existing dirty-worktree changes.
-   At campaign end distinguish campaign changes from pre-existing
    repository state.
-   Do not generate new images during remediation unless a genuinely
    essential learning asset is specified and approved.
-   If an essential asset is missing, report `NEW ASSET REQUIRED`.
-   A new-asset report must state the learning moment, required
    information, and minimum semantic specification.
-   Do not claim the shared suite is fully green when known unrelated
    test debt remains.
-   Inspect the final diff before reporting completion.

------------------------------------------------------------------------

## 17. Master Codex contract pattern

Every substantial Codex execution contract should define:

1.  MODE / TARGET / scope.
2.  Purpose and engineering question.
3.  Non-negotiable architectural boundaries.
4.  Inspection requirements.
5.  Evidence and media semantics.
6.  Safety and realism rules.
7.  Exact audit/design/implementation sequence.
8.  Engine capability gate.
9.  Authorized file scope.
10. Automated validation and shared-test classification.
11. Preview/generated-artifact validation.
12. Browser QA policy.
13. Repository hygiene.
14. Final report schema.
15. Success condition.

> Codex prompts are implementation contracts. They must state what to
> inspect, what problem is being solved, which invariants must survive,
> what is out of scope, how the work is validated, and what the final
> report must contain.

------------------------------------------------------------------------

## 18. Template --- new Experience semantic specification

``` yaml
EXPERIENCE:
EDITORIAL_ID:
TECHNICAL_ID:
SYSTEM:
INCIDENT:
PRIVATE_ROOT_CAUSE:

INITIAL_CONTEXT_EVIDENCE:
  - ...

DIAGNOSTIC_MOMENTS:
  D1:
    before:
    action:
    action_class: DIAGNOSIS
    evidence:
    media:
    conclusion:
    transition: DIRECT | RESULT

INTERVENTION:
  - ...

RECOVERY_CRITERIA:
  - ...

VERIFICATION:
  - ...

COMPLETION_EARNED_AT:

COVER:

STAGE_MEDIA_MAP:

EVIDENCE_MEDIA_MAP:

COMPLETION_MEDIA:

REGISTERED_BUT_NOT_PRESENTED:

SAFETY_PREREQUISITES:

UNCERTAINTIES_UNSUPPORTED_CLAIMS:

ENGINE_CAPABILITY:

EXPECTED_FILE_SCOPE:

TEST_PLAN:
```

------------------------------------------------------------------------

## 19. Definition of Done

### Source / engineering

-   [ ] Technical reasoning is defensible.
-   [ ] No technical facts were invented.
-   [ ] Evidence authority is coherent.
-   [ ] No premature spoilers exist.
-   [ ] Safety prerequisites are visible before relevant actions.
-   [ ] Diagnosis/intervention/verification semantics are defensible.

### Media

-   [ ] Cover is presentation only.
-   [ ] Stage media is legitimately known.
-   [ ] Evidence media appears only after acquisition.
-   [ ] Completion media does not substitute for verification.
-   [ ] Hidden/reused assets are explicitly justified.
-   [ ] Cross-asset system coherence is checked.

### Automated QA

-   [ ] Focused tests PASS.
-   [ ] Shared failures are classified.
-   [ ] `git diff --check` PASS.
-   [ ] Preview regenerated.
-   [ ] Generated ES PASS.
-   [ ] Generated EN PASS.
-   [ ] Automatic learner flow PASS where available.

### Browser QA

-   [ ] Full learner run completed.
-   [ ] Wrong → Retry behavior validated.
-   [ ] Correct evidence order validated.
-   [ ] Results / Continue validated.
-   [ ] Completion / Debrief validated.
-   [ ] Persistence/progress validated.
-   [ ] ES/EN validated.
-   [ ] Desktop/mobile validated.
-   [ ] Console/network validated.
-   [ ] Every asset appears at the intended pedagogical moment.

### Repository

-   [ ] No unauthorized Engine changes.
-   [ ] No unrelated Experience changes.
-   [ ] No unauthorized binary changes.
-   [ ] Pre-existing worktree state preserved.
-   [ ] Commit/push only when explicitly authorized.

------------------------------------------------------------------------

## 20. Governance decision rule

When implementation evidence conflicts with assumptions, classify the
problem before changing the system.

The correct fix belongs to the layer that owns the defect:

``` text
CONTENT defect
→ fix content

ENGINE capability defect
→ fix the Engine once, after architectural approval

MEDIA semantic defect
→ remap, hide, or replace through asset governance

STALE GENERATED ARTIFACT
→ regenerate

TEST / FIXTURE debt
→ isolate and document

INFRASTRUCTURE failure
→ treat as infrastructure, not product behavior
```

### Final rule

> **Every learner-visible asset and statement must have a defensible
> semantic purpose and a defensible moment of disclosure.**
