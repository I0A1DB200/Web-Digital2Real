# Codex Contract --- Remap Experience

**Mode:** INSPECT → CONFIRM DESIGN → IMPLEMENT → TEST → PREVIEW → REPORT

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## INPUT

Target: `<EE-ID/path>`\
Approved audit/design: `<reference or supplied design>`

## OBJECTIVE

Implement the approved semantic remap with the minimum correct
repository delta.

## BEFORE EDITING

Read governance and standards.

Inspect current repository state and confirm the approved audit still
matches source.

If new repository evidence invalidates the design, update the audit
reasoning before implementation.

## AUTHORIZED TARGET SCOPE

Modify only target Experience content, localization, target
documentation, and focused tests required by the remap.

Shared Engine changes require explicit architectural authorization.

Image binaries require explicit authorization.

## IMPLEMENT

Preserve:

-   evidence authority;
-   correct media timing;
-   Result/direct flow;
-   intervention/verification boundary;
-   recovery timing;
-   ES/EN equivalence;
-   safety;
-   repository conventions.

## VALIDATE

Run:

1.  target focused tests;
2.  relevant shared tests;
3.  classify every shared failure A--F;
4.  `git diff --check`;
5.  preview generation;
6.  generated ES inspection;
7.  generated EN inspection;
8.  automatic learner flow where available.

Browser QA remains pending unless this task explicitly includes
real-browser execution.

## REPORT

Return:

-   files modified;
-   final counts;
-   final flow;
-   evidence map;
-   media map;
-   hidden/reused assets;
-   intervention/verification/completion timing;
-   focused tests;
-   shared tests + classifications;
-   preview/generated validation;
-   automatic learner flow;
-   Engine changes;
-   other Experience changes;
-   binary changes;
-   pre-existing worktree;
-   browser QA status;
-   commit;
-   push.

Do not commit or push unless explicitly authorized.
