# Digital2Real --- Codex Prompt Contracts

**Document:** 12\
**Role:** Index for reusable Codex execution contracts

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## 1. Purpose

Prompt files are implementation contracts. They execute governance; they
do not duplicate or replace it.

## 2. Governance order

``` text
02_AGENTS.md
→ 01_ENGINEERING_DIRECTOR_PLAYBOOK.md
→ architecture/standards
→ task prompt
→ repository evidence
```

## 3. Contracts

  -----------------------------------------------------------------------
  Prompt                              Use
  ----------------------------------- -----------------------------------
  `13_AUDIT_EXPERIENCE.md`            Inspect and design semantic
                                      remediation without implementation

  `14_REMAP_EXPERIENCE.md`            Implement an approved semantic
                                      remap

  `15_CREATE_EXPERIENCE.md`           Produce a new Experience

  `16_AUTONOMOUS_REMEDIATION.md`      Sequential audit/remediation
                                      campaign

  `17_BROWSER_QA.md`                  Final real-browser QA

  `18_CREATE_NOTEBOOK_ENTRY.md`       Create Notebook knowledge

  `19_REVIEW_NOTEBOOK_ENTRY.md`       Technical/structural Notebook
                                      review

  `20_ASSET_AUDIT.md`                 Audit existing media

  `21_CREATE_ASSET_SPEC.md`           Specify a missing learning asset
  -----------------------------------------------------------------------

## 4. Prompt rule

A task prompt must define:

-   target;
-   objective;
-   authorized scope;
-   required inspection;
-   applicable standards;
-   validation;
-   final report;
-   commit/push policy.

## 5. Execution rule

Read canonical standards from the repository instead of copying large
governance blocks into every prompt.

## 6. Final rule

> Prompts tell Codex what job to execute; standards define what correct
> means.
