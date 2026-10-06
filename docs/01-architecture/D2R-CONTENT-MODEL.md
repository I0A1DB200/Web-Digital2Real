# Digital2Real --- Content Model

**Role:** Canonical model for D2R authored content and relationships

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

Physical content ownership remains governed by [ADR-0001](../03-governance/decisions/ADR-0001-content-ownership.md); executable Experience fields remain governed by the [Experience Engine](../../experience-engine/README.md). This document owns the semantic relationships among Notebook, Experience, ENV, Evidence, Media and Result.

## 1. Content products

D2R has two canonical content products:

``` text
Notebook → reusable engineering knowledge / technical SSOT
Experience → interactive engineering judgement
```

ENV is a delivery/discovery structure for Experiences, not a third
content product.

Technical source support has separate ownership:

``` text
Notebook → published technical knowledge
D2R technical reference → reviewed internal interpretation linked to source IDs
Source Library record → external authority, provenance, applicability and rights
Reusable asset record → D2R-controlled asset optionally linked to source IDs
```

A source record is not learner content, an Experience Provider, a production asset, or runtime data.

## 2. Notebook

A Notebook entry captures reusable engineering knowledge.

Canonical sections:

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

## 3. Experience

An Experience is a bounded engineering case with:

-   identity;
-   system context;
-   incident;
-   private root cause;
-   stages/diagnostic moments;
-   decisions;
-   options;
-   evidence;
-   intervention;
-   verification;
-   recovery criteria;
-   media registry/references;
-   completion/debrief;
-   localization;
-   editorial/publication metadata.

## 4. Identity

Keep technical and editorial identity distinct when both exist.

``` text
editorial_id → learner/catalog identity, e.g. EE-0012
technical_id → stable technical/package identity
```

References must use the repository's canonical identifier for that
relationship. Do not substitute one identifier for another casually.

## 5. Stage

A stage represents the current engineering moment before a learner
action.

It may contain:

-   context legitimately known at that moment;
-   `media_ids` already available to the learner;
-   the current decision.

A stage must not contain future evidence.

## 6. Decision and option

A decision asks the learner to choose an engineering action.

Each option must be technically meaningful.

Incorrect options should represent plausible diagnostic errors rather
than arbitrary distractors.

The correct option owns the authored action that advances reasoning and
may unlock evidence.

## 7. Evidence

Evidence represents engineering knowledge established in the case.

Classes:

-   `INITIAL / CONTEXT`
-   `INTERACTIVE / ACQUIRED`

Interactive evidence authority must be reciprocal between authored
evidence and the action that reveals it.

## 8. Media

Media is referenced, not treated as the source of evidence authority.

Roles:

-   cover;
-   stage;
-   evidence;
-   completion;
-   intentional reuse;
-   registered but not presented.

## 9. Result

Result is runtime presentation for newly acquired evidence/media.

It is not a third content product, not a diagnostic action, and not a
new evidence authority.

## 10. Intervention and verification

Intervention changes the system.

Verification proves whether recovery criteria are satisfied.

They may be separate or combined only when the engineering case supports
that combination.

## 11. Completion

Completion is authored recovery success executed by the Engine.

Completion should identify final synthesis/debrief media where useful.

## 12. Localization

ES and EN must be structurally equivalent and semantically equivalent.

Localization may adapt natural wording but must preserve:

-   technical meaning;
-   evidence timing;
-   safety prerequisites;
-   correct/incorrect logic;
-   spoiler boundaries;
-   recovery criteria.

## 13. ENV

Canonical hierarchy:

``` text
Experience Lab
→ ENV selector
→ ENV
→ hotspots / associations
→ Engineering Experience
```

Current product rule: one ENV contains exactly 10 Engineering
Experiences.

ENV progress is derived from canonical Experience completion state.

## 14. References between content types

Notebook may explain reusable knowledge used by an Experience.

Experience should exercise that knowledge through a concrete case.

``` text
Notebook → reusable explanation
Experience → applied judgement
```

Avoid copying large technical explanations into every Experience.

## 15. Source and derived content

Canonical authored source is SSOT.

Generated previews, packaged runtime data, indexes, and projections are
derived unless the repository explicitly declares otherwise.

## 16. Publication status

Publication metadata must remain explicit.

Technical readiness, automated QA, Browser QA, and public publication
are different states.

Do not infer publication merely from the presence of a package.

## 17. Content-model invariant

> Engineering meaning belongs in authored content; reusable runtime
> behavior belongs in the Engine; reusable technical explanation belongs
> in Notebook.
