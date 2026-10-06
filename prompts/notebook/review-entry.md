# Codex Contract --- Review Notebook Entry

**Mode:** INSPECT → TECHNICAL REVIEW → STRUCTURAL REVIEW → REPORT

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## INPUT

Notebook target: `<path/id>`

## OBJECTIVE

Audit a Notebook entry as reusable technical SSOT.

## REVIEW

Check:

-   industrial problem is explicit;
-   scope is defined;
-   claims are source-supported;
-   vendor-specific and general claims are distinguished;
-   architecture is coherent;
-   data/behavior is precise;
-   example does not masquerade as universal behavior;
-   engineering decisions are explained;
-   common mistakes are technically plausible;
-   PLC/implementation architecture is maintainable;
-   conclusions match evidence;
-   duplicated knowledge is minimized;
-   links and references are valid;
-   assets/diagrams are semantically useful.

## CLASSIFY FINDINGS

-   TECHNICAL ERROR
-   UNSUPPORTED CLAIM
-   AMBIGUITY
-   DUPLICATED SSOT
-   STRUCTURAL ISSUE
-   ASSET ISSUE
-   LINK/INDEX ISSUE
-   STYLE ONLY

## OUTPUT

Return:

1.  summary;
2.  blocking technical findings;
3.  non-blocking findings;
4.  source gaps;
5.  duplication/SSOT issues;
6.  asset findings;
7.  recommended minimum delta;
8.  validation plan.

Do not rewrite production content unless implementation is explicitly
requested.
