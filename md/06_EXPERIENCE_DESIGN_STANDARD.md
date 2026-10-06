# Digital2Real --- Experience Design Standard

**Document:** 06\
**Role:** Canonical method for designing Engineering Experiences

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## 1. Objective

An Engineering Experience teaches diagnostic judgement through a
realistic industrial case.

The learner should not merely recall the answer. The learner should
progressively establish what is true.

## 2. Production sequence

``` text
IDEA
→ ENGINEERING CASE
→ INFORMATION ARCHITECTURE
→ DECISIONS
→ EVIDENCE AUTHORITY
→ MEDIA SPECIFICATION
→ YAML / LOCALES
→ IMPLEMENTATION
→ AUTOMATED QA
→ BROWSER QA
→ PUBLICATION
→ MAINTENANCE
```

## 3. Engineering case

Define before writing learner content:

-   industrial system;
-   symptom/incident;
-   actual root cause;
-   relevant healthy subsystems;
-   diagnostic boundaries;
-   safe intervention boundary;
-   corrective action;
-   recovery criteria;
-   verification method;
-   facts that are known initially;
-   facts that must be acquired.

If the root cause or technical mechanism is uncertain, research or
expose uncertainty before authoring.

## 4. Information architecture

For every learner-visible item answer:

1.  What does the learner know?
2.  When may they know it?
3.  What action produced that knowledge?
4.  What evidence was acquired?
5.  What media represents it?
6.  What conclusion becomes justified?

Build the learning sequence from information disclosure, not from
available screenshots.

## 5. Decision design

A decision should represent a real engineering choice.

Good options:

-   are plausible;
-   differ in diagnostic quality;
-   reflect common troubleshooting errors;
-   are safe within the authored context;
-   move or fail to move the diagnosis for a reason.

Avoid trivia and obviously absurd distractors.

## 6. Evidence design

Classify every evidence item:

``` text
INITIAL / CONTEXT
or
INTERACTIVE / ACQUIRED
```

For acquired evidence define:

``` text
ACTION
→ EVIDENCE
→ ENGINEERING CONCLUSION
```

Ensure bidirectional authority between action unlocks and evidence
provenance.

## 7. Diagnostic moment matrix

Before implementation create a matrix:

  --------------------------------------------------------------------------------
  Moment     Known      Action     New        Media      Conclusion   Transition
             before                evidence                           
  ---------- ---------- ---------- ---------- ---------- ------------ ------------
  D1         ...        ...        ...        ...        ...          DIRECT /
                                                                      RESULT

  --------------------------------------------------------------------------------

This matrix is the semantic design.

## 8. Root-cause timing

Do not reveal root cause before sufficient evidence supports it.

A learner may localize a subsystem before establishing the physical
cause.

``` text
logical relationship
≠
physical cause
```

Physical inspection may require its own moment.

## 9. Intervention classification

Classify correct actions as:

-   `DIAGNOSIS`
-   `INTERVENTION`
-   `VERIFICATION`
-   `COMBINED INTERVENTION + VERIFICATION`

Use combined classification only when one action genuinely performs
correction and establishes recovery.

## 10. Recovery

Define recovery criteria explicitly.

Examples of categories, only when supported by the case:

-   expected signal/state restored;
-   command accepted;
-   physical motion observed;
-   safety chain restored;
-   repeated cycle succeeds;
-   process value returns to expected behavior.

Do not invent numerical or normative criteria.

## 11. Completion

Completion is earned at verification, not merely at repair.

``` text
repair completed
→ verification pending
→ no recovery yet
```

## 12. Media design

Specify media after the reasoning flow exists.

For each asset state:

-   what pixels show;
-   what it proves;
-   what it does not prove;
-   earliest legitimate disclosure;
-   semantic role;
-   compatibility with other assets.

An available image is not a reason to create a learner moment.

## 13. Result design

Use Result when a correct action has acquired useful media/evidence
worth presenting before the next decision.

Several related evidence items may share one Result if acquired
together.

Text-only evidence may advance directly.

## 14. Safety

Place required safety prerequisites before the action that depends on
them.

Do not add unsupported procedures.

## 15. Localization

Design technical meaning first, then produce ES/EN equivalents.

Validate equivalence for:

-   options;
-   evidence;
-   safety;
-   spoilers;
-   root cause;
-   recovery.

## 16. Experience audit package

Before implementation the design should state:

-   IDs/status/locales;
-   decision and option counts;
-   evidence classification;
-   asset inventory;
-   stage media map;
-   evidence media map;
-   completion media;
-   hidden assets;
-   root-cause timing;
-   intervention/verification boundary;
-   Engine capability assessment;
-   expected file scope;
-   tests.

## 17. Acceptance rule

> A good Experience reveals only the information an engineer could
> legitimately have at that moment and makes recovery depend on
> evidence, not narrative convenience.
