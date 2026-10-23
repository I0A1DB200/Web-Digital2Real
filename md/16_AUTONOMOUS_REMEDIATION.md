# Codex Contract --- Autonomous Experience Remediation

**Document:** 16\
**Mode:** Sequential autonomous campaign

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## INPUT

Targets: `<single EE, explicit list, or range>`

## OBJECTIVE

Audit and remediate each target Experience sequentially using D2R
standards.

## CAMPAIGN RULE

Complete one Experience before editing the next:

``` text
AUDIT
→ DESIGN
→ IMPLEMENT
→ FOCUSED TEST
→ SHARED TEST
→ CLASSIFY FAILURES
→ PREVIEW
→ GENERATED ES/EN
→ AUTOMATIC LEARNER FLOW
→ EXPERIENCE REPORT
→ NEXT EXPERIENCE
```

## AUTONOMY

Within each target, Codex may correct target content defects discovered
during implementation.

Codex may not autonomously:

-   change shared Engine architecture;
-   change unrelated Experiences;
-   modify image binaries;
-   invent technical facts;
-   repair unrelated production content to green a suite.

## ENGINE BLOCKER

If an Experience requires missing Engine capability:

-   classify `ENGINE`;
-   document blocker;
-   do not implement an incorrect content workaround;
-   continue to another target only if doing so is independent and safe.

## SHARED FAILURES

Classify A--F.

A failure outside the current target does not authorize editing that
other Experience.

## CAMPAIGN REPORT

For each Experience report:

-   audit summary;
-   final flow;
-   files;
-   tests;
-   media;
-   hidden/reused assets;
-   Engine status;
-   browser status.

Then report:

-   total targets;
-   automated pass count;
-   blocked count;
-   unique files changed;
-   Engine changes;
-   binaries;
-   unrelated changes;
-   shared debt;
-   reusable Playbook findings.

Browser QA is a separate final campaign unless explicitly included.

No commit/push unless authorized.
