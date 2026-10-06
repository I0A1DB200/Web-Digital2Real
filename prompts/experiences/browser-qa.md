# Codex Contract --- Browser QA

**Mode:** REAL BROWSER VALIDATION

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## INPUT

Targets: `<Experience(s)>`

## OBJECTIVE

Validate the learner-visible runtime behavior in a real supported
browser after automated QA.

## PRECONDITION

Confirm target has completed automated validation.

## FOR EACH EXPERIENCE

Validate:

1.  Experience Lab/ENV navigation as applicable.
2.  Incident Brief.
3.  Cover.
4.  Begin investigation.
5.  Stage media before each decision.
6.  Representative wrong decisions.
7.  Retry.
8.  Correct decisions.
9.  Evidence unlock order.
10. Result media/text.
11. Continue.
12. Intervention.
13. Verification.
14. Completion timing.
15. Debrief.
16. Progress/persistence.
17. ES.
18. EN.
19. Desktop.
20. Mobile/responsive.
21. Console errors.
22. Network/resource errors.
23. Every asset at intended pedagogical moment.

## FAILURE CLASSIFICATION

Distinguish:

``` text
PRODUCT DEFECT
CONTENT DEFECT
ENGINE DEFECT
GENERATED/STale ARTIFACT
AUTOMATION / INFRASTRUCTURE FAILURE
```

Do not infer a product defect from automation failure alone.

## INFRASTRUCTURE BLOCK

If independent automation failures prevent reliable browser interaction:

``` text
BROWSER QA
STATUS: INFRASTRUCTURE BLOCKED
```

Record exactly what was successfully observed before failure.

Do not repeatedly consume execution budget attempting the same broken
infrastructure path.

## REPORT

Per target:

-   browser/device/viewport;
-   locale;
-   steps executed;
-   wrong paths tested;
-   correct path;
-   media timing;
-   completion/persistence;
-   console/network;
-   defects;
-   screenshots/evidence where available;
-   final PASS / FAIL / INFRASTRUCTURE BLOCKED.

No product edits unless the QA task explicitly authorizes remediation.
