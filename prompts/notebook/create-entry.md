# Codex Contract --- Create Notebook Entry

**Mode:** RESEARCH → STRUCTURE → WRITE → VALIDATE

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## INPUT

Topic: `<engineering topic>`\
Sources: `<repository references / supplied sources>`

## OBJECTIVE

Create reusable engineering knowledge for the permanent D2R technical
SSOT.

## REQUIRED STRUCTURE

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

## METHOD

1.  Inspect existing Notebook conventions and index.
2.  Search approved technical reference library.
3.  Establish source-supported facts.
4.  Expose uncertainty.
5.  Separate vendor-specific behavior from general engineering
    principles.
6.  Write for engineering understanding and reuse.
7.  Specify diagrams/assets only where they improve understanding.
8.  Link related Notebook knowledge rather than duplicate it.

## TECHNICAL RULES

Do not invent:

-   register/address values;
-   protocol behavior;
-   limits;
-   safety requirements;
-   vendor behavior;
-   code semantics.

Use examples as examples, not universal rules.

## VALIDATE

Check:

-   technical traceability;
-   structure;
-   internal consistency;
-   diagrams/assets;
-   repository links;
-   terminology;
-   index integration;
-   `git diff --check`.

## REPORT

Return files, sources used, uncertainties, assets, links/index changes,
validation, commit/push status.

No commit/push unless authorized.
