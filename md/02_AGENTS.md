# Digital2Real --- Agent Instructions

**Repository:** Digital2Real\
**Role:** Root operating instructions for coding agents\
**Authority:** Repository governance entry point

Digital2Real is an **industrial automation engineering platform**.

Its purpose is to strengthen:

-   technical knowledge;
-   engineering judgement;
-   industrial troubleshooting;
-   practical experience;
-   reusable engineering knowledge.

Digital2Real is not a generic blog, tutorial collection, or course
library.

------------------------------------------------------------------------

## 1. Read before editing

Before making repository changes, inspect the repository and read the
canonical documentation relevant to the task.

Start with:

1.  `ENGINEERING_DIRECTOR_PLAYBOOK.md`
2.  `D2R_ARCHITECTURE.md`

Then read the applicable standard:

-   Experience work → `EXPERIENCE_DESIGN_STANDARD.md`
-   Evidence/media work → `EVIDENCE_MEDIA_SEMANTICS.md`
-   Asset work → `ASSET_GOVERNANCE.md`
-   QA work → `QA_STANDARD.md`
-   Experience Engine work → `EXPERIENCE_ENGINE.md`
-   Content architecture → `CONTENT_MODEL.md`

During the temporary Engineering OS staging phase, these files may exist
under `./md/`.

After repository integration, follow their canonical repository paths.

Do not assume a path when the repository provides a canonical location.

------------------------------------------------------------------------

## 2. Classify the work

Before editing, classify the request as one of:

-   `NOTEBOOK`
-   `EXPERIENCE`
-   `ARCHITECTURE`
-   `NON-D2R`

If the task does not strengthen the D2R platform, do not integrate it
into D2R architecture.

For implementation defects, classify the problem before choosing the
fix:

-   `ENGINE`
-   `CONTENT`
-   `INTENTIONAL REUSE`
-   `UNUSED`
-   `TECHNICAL DEBT`

The fix must belong to the layer that owns the defect.

------------------------------------------------------------------------

## 3. Product model

Digital2Real has two content products:

### Notebook

Structured, reusable engineering knowledge.

Canonical role:

> Permanent technical SSOT.

### Experiences

Interactive industrial diagnosis, decisions, and troubleshooting.

Canonical role:

> Teach engineers how to think.

Core ownership:

``` text
Notebook
→ permanent engineering knowledge / SSOT

Experience Engine / Experience Lab
→ interactive industrial learning

Architect
→ governance, architecture, quality control

Codex
→ implementation executor

Website
→ final delivery surface
```

------------------------------------------------------------------------

## 4. Non-negotiable engineering invariants

Preserve these principles in every task:

-   Engineering over marketing.
-   Understanding and judgement over memorization.
-   Reusable systems over isolated fixes.
-   Accuracy and maintainability over speed.
-   SSOT over duplicated knowledge.
-   Never invent technical information.
-   Expose uncertainty when evidence is insufficient.
-   Inspect before editing.
-   Validate before reporting completion.
-   Fix architecture once instead of patching every Experience.
-   Fix content defects in content.
-   Fix Engine capability defects in the Engine, after architectural
    approval.
-   Do not use renderer hacks to repair content semantics.
-   Do not edit unrelated production content merely to make a test suite
    green.
-   Do not present an asset merely because it is registered.
-   Preserve intentional reuse when technically and pedagogically
    justified.

------------------------------------------------------------------------

## 5. Experience invariants

For Experience work, preserve the semantic learner flow.

Typical reasoning sequence:

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

This is a semantic model, not a mandatory screen count.

Every learner-visible item must have:

1.  a defensible information purpose;
2.  a defensible moment of disclosure.

Preserve:

> **Corrective action performed ≠ recovery verified.**

Do not register completion until the authored recovery criteria have
been established.

------------------------------------------------------------------------

## 6. Evidence and media invariants

Preserve the following semantic ownership:

``` text
public.visual.cover_asset_id
→ Incident Brief / presentation

stages[].media_ids
→ information legitimately available before a decision

evidence[].media_ids
→ information acquired through an action

completion.media_ids
→ final synthesis / verified-recovery context

Result
→ presentation of newly acquired evidence/media
```

Preserve:

> **Authored context evidence ≠ projected interactive evidence.**

Initial/context evidence may legitimately use:

``` yaml
revealed_by: []
```

and may be absent from interactive evidence projection.

A Result may contain multiple related evidence items when they were
acquired in the same engineering moment.

`REGISTERED BUT NOT PRESENTED` is a valid asset state.

------------------------------------------------------------------------

## 7. Asset discipline

Treat media as engineering information.

For relevant assets, determine:

-   what the pixels show;
-   what the asset proves;
-   what it does not prove;
-   when the learner may see it;
-   whether it is consistent with the canonical system;
-   whether reuse is intentional;
-   whether it should remain registered but hidden.

Check cross-asset consistency where relevant:

-   device/master;
-   channel;
-   PLC block;
-   address;
-   network;
-   topology;
-   machine state.

Do not invent technical explanations to reconcile contradictory assets.

Search the approved reusable asset library before specifying a new
asset.

------------------------------------------------------------------------

## 8. Safety and realism

Safety prerequisites required for an action must be visible before that
action.

Do not invent:

-   isolation procedures;
-   LOTO sequences;
-   PPE;
-   normative limits;
-   timings;
-   manufacturer procedures;
-   measurements or observations not supported by the engineering case.

Do not allow a static image to prove more than its pixels support.

------------------------------------------------------------------------

## 9. Engine capability gate

Before modifying shared Engine architecture, determine whether the
problem is genuinely an Engine capability problem.

If the required learning behavior cannot be represented correctly by the
current Engine:

1.  classify it as `ENGINE`;
2.  document the missing capability;
3.  explain why content changes cannot solve it correctly;
4.  stop before modifying shared architecture unless the current task
    explicitly authorizes Engine changes.

Do not silently expand task scope.

------------------------------------------------------------------------

## 10. Shared-test failure classification

A failing shared test must be classified before remediation:

-   `A — TARGET EXPERIENCE REGRESSION`
-   `B — PRE-EXISTING TEST / FIXTURE DEBT`
-   `C — SHARED ENGINE REGRESSION`
-   `D — STALE GENERATED ARTIFACT`
-   `E — INVALID / OUTDATED TEST EXPECTATION`
-   `F — INFRASTRUCTURE FAILURE`

A shared-suite failure does not automatically authorize changes outside
the target scope.

------------------------------------------------------------------------

## 11. Validation

Use the validation level required by the applicable standard and
execution contract.

For Experience work, expect validation to include as applicable:

``` text
focused tests
→ relevant shared tests
→ failure classification
→ git diff --check
→ preview generation
→ generated ES inspection
→ generated EN inspection
→ automatic learner-flow validation
→ real browser QA
```

Automated PASS is not equivalent to final Browser QA PASS.

Infrastructure failure must not be reported as a product defect.

------------------------------------------------------------------------

## 12. Repository hygiene

Always:

-   inspect repository state before editing;
-   preserve pre-existing working-tree changes;
-   distinguish existing changes from changes made by the current task;
-   inspect the final diff;
-   respect authorized file scope;
-   report unexpected repository state;
-   report any blocker instead of bypassing architecture.

Do not commit or push unless explicitly authorized.

Do not modify image binaries unless explicitly authorized by the task.

------------------------------------------------------------------------

## 13. Codex execution contracts

When a task references a reusable contract under `prompts/`, treat that
contract as the execution procedure for the task.

The governance hierarchy is:

``` text
AGENTS.md
    ↓
ENGINEERING_DIRECTOR_PLAYBOOK.md
    ↓
canonical architecture / engineering standards
    ↓
task-specific prompt contract
    ↓
repository evidence
    ↓
implementation
    ↓
validation
    ↓
final report
```

Task-specific prompts may specialize the workflow.

They must not override repository governance unless the task explicitly
authorizes an architectural change and identifies its scope.

------------------------------------------------------------------------

## 14. Final reporting

Every implementation report must clearly distinguish:

-   inspected state;
-   classification;
-   files changed;
-   files created;
-   tests executed;
-   tests passed/failed;
-   shared failures and their classification;
-   generated artifacts;
-   Engine changes;
-   production Experience changes;
-   binary changes;
-   pre-existing worktree state;
-   browser QA status;
-   commits;
-   push status;
-   unresolved debt or blockers.

Never report work as fully complete when a required validation gate
remains pending.

------------------------------------------------------------------------

## 15. Governing rule

When repository evidence conflicts with assumptions:

> **Trust inspected repository evidence, classify the discrepancy, and
> repair the layer that owns the defect.**

When technical evidence is insufficient:

> **Expose uncertainty. Do not invent the missing engineering fact.**
