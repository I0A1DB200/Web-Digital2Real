# Digital2Real --- Evidence & Media Semantics

**Role:** Semantic SSOT for Evidence, Media, Result, and disclosure
timing

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

The implemented V2 contract and its evolution record remain in [EXP-MODEL-001](../03-governance/decisions/EXP-MODEL-001-experience-model-contract-decisions.md). This standard owns semantic authoring rules; schemas and Player tests own executable enforcement.

## 1. Fundamental separation

``` text
ACTION → determines what is acquired
EVIDENCE → expresses engineering meaning
MEDIA → represents information
RESULT → presents newly acquired information
```

Do not collapse these concepts.

## 2. Initial/context evidence

Initial evidence is already part of the incident context.

It may legitimately use:

``` yaml
revealed_by: []
```

It may be absent from the runtime interactive evidence projection.

Validate it through Incident Brief/context semantics.

## 3. Interactive/acquired evidence

Acquired evidence must result from a learner action.

Authority must agree in both directions:

``` text
decision/action says it unlocks EVID-X
EVID-X says it is revealed by that action
```

Media references do not replace this authority.

## 4. Cover

``` text
public.visual.cover_asset_id
```

Role: Incident Brief presentation and incident identity.

Cover is not evidence and has no diagnostic side effects.

## 5. Stage media

``` text
stages[].media_ids
```

Role: information already available before the current decision.

If an image contains several values, commands, addresses, or states, it
cannot appear until all learner-relevant information visible in it is
legitimately available.

## 6. Evidence media

``` text
evidence[].media_ids
```

Role: media obtained through the evidence-producing action.

Ordering:

``` text
interaction unlock order
→ newly unlocked evidence only
→ evidence media_ids order
```

Do not globally deduplicate an asset when intentional reuse across
distinct evidence is semantically valid.

## 7. Completion media

``` text
completion.media_ids
```

Role: final synthesis / verified-recovery context.

It is presented after recovery is earned.

It does not establish recovery by itself.

## 8. Result

Result is a presentation mode.

Correct + new useful evidence media:

``` text
Stage → correct action → register evidence → Result → Continue → next
```

Correct + no useful new media:

``` text
Stage → correct action → register evidence → next
```

Final correct + media:

``` text
verification → register completion → Result → Continue → Debrief
```

## 9. Multi-evidence Result

A single Result may present multiple evidence items when one engineering
action acquired them in the same moment.

Do not split an Experience solely to create one Result per evidence
item.

## 10. Intentional reuse

The same asset may appear:

-   as acquired evidence;
-   later as stage context;
-   in Debrief;

when the information remains legitimate and the reuse has pedagogical
purpose.

Reuse must not imply a false current machine state.

## 11. Registered but not presented

An asset may remain registered and unused when:

-   topology conflicts with canonical case;
-   address/block/channel conflicts;
-   provenance is unclear;
-   timing would create a spoiler;
-   state is obsolete after intervention;
-   it adds no learning value.

This is a valid outcome.

## 12. Static-media limits

A static screenshot can show a state at a captured moment.

It normally cannot alone prove:

-   stable recovery;
-   repeated operation;
-   physical movement;
-   continuity;
-   complete network health;
-   exact physical root cause;
-   safety authorization.

Use authored observations/tests for claims beyond pixels.

## 13. Cross-asset coherence

Compare assets as a system, not independently.

Check where relevant:

-   PLC/controller identity;
-   master/device identity;
-   IO-Link master and port;
-   network;
-   channel;
-   PLC block;
-   DB/tag/address;
-   machine state;
-   pre/post-intervention state.

## 14. Missing media

If a runtime image fails:

-   preserve evidence text;
-   preserve Continue/navigation;
-   keep the action earned;
-   show a localized warning where supported;
-   do not roll back evidence or completion because presentation media
    failed.

## 15. Semantic audit table

For every asset:

  ----------------------------------------------------------------------------
  Asset      Pixels     Proves     Does not   Earliest   Role       Status
                                   prove      moment
  ---------- ---------- ---------- ---------- ---------- ---------- ----------

  ----------------------------------------------------------------------------

## 16. Governing rule

> Media may illustrate only information the learner is entitled to know,
> at the moment they are entitled to know it.
