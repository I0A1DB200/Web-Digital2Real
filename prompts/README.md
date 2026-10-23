# Digital2Real --- Codex Prompt Contracts

**Role:** Index for reusable Codex execution contracts

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## 1. Purpose

Prompt files are implementation contracts. They execute governance; they
do not duplicate or replace it.

## 2. Governance order

``` text
AGENTS.md
→ docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md
→ architecture/standards
→ task prompt
→ repository evidence
```

## 3. Contracts

| Contract | Use |
|---|---|
| [Audit Experience](experiences/audit.md) | Inspect and design semantic remediation without implementation |
| [Remap Experience](experiences/remap.md) | Implement an approved semantic remap |
| [Create Experience](experiences/create.md) | Produce a new Experience |
| [Autonomous Remediation](experiences/autonomous-remediation.md) | Run a sequential audit/remediation campaign |
| [Browser QA](experiences/browser-qa.md) | Perform final real-browser QA |
| [Create Notebook Entry](notebook/create-entry.md) | Create reusable Notebook knowledge |
| [Review Notebook Entry](notebook/review-entry.md) | Perform technical and structural Notebook review |
| [Asset Audit](assets/audit.md) | Audit existing engineering media |
| [Create Asset Specification](assets/create-spec.md) | Specify a missing learning asset |
| [Register Source](sources/register.md) | Normalize and register a source without self-approval |
| [Resolve Source](sources/resolve.md) | Resolve technical questions through governed sources |
| [Audit Source Library](sources/audit.md) | Audit source integrity, applicability, rights and relationships |

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
