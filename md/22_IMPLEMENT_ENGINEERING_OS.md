# Codex Contract --- Implement D2R Engineering OS

**Document:** 22\
**Mode:** INSPECT → MAP → INTEGRATE → VALIDATE → REPORT

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## SOURCE STAGING DIRECTORY

``` text
./md/
```

Treat `./md/` as the approved staging package prepared for Engineering
OS integration.

Expected numbered source documents:

``` text
01_ENGINEERING_DIRECTOR_PLAYBOOK.md
02_AGENTS.md
03_D2R_ARCHITECTURE.md
04_EXPERIENCE_ENGINE.md
05_CONTENT_MODEL.md
06_EXPERIENCE_DESIGN_STANDARD.md
07_EVIDENCE_MEDIA_SEMANTICS.md
08_ASSET_GOVERNANCE.md
09_QA_STANDARD.md
10_ASSET_LIBRARY_README.md
11_TECHNICAL_REFERENCE_LIBRARY.md
12_PROMPTS_README.md
13_AUDIT_EXPERIENCE.md
14_REMAP_EXPERIENCE.md
15_CREATE_EXPERIENCE.md
16_AUTONOMOUS_REMEDIATION.md
17_BROWSER_QA.md
18_CREATE_NOTEBOOK_ENTRY.md
19_REVIEW_NOTEBOOK_ENTRY.md
20_ASSET_AUDIT.md
21_CREATE_ASSET_SPEC.md
22_IMPLEMENT_ENGINEERING_OS.md
```

## OBJECTIVE

Integrate the approved D2R Engineering OS into the real repository so
governance, architecture, standards, libraries, and Codex contracts
become discoverable repository-native SSOT.

## 1. INSPECT BEFORE EDITING

Inspect:

-   repository tree;
-   existing root `AGENTS.md`;
-   README files;
-   docs;
-   architecture docs;
-   Engine docs;
-   content docs;
-   prompt/instruction files;
-   asset/media directories;
-   Notebook structure;
-   technical-reference directories;
-   QA docs/tests;
-   changelog;
-   repository naming/link conventions;
-   current working tree.

Also inspect representative production packages only as needed to
validate documentation against reality.

## 2. BUILD SSOT MAP

For each domain identify:

| Domain \| Existing source \| Staged source \| Final canonical source
  \| References to update \|

Domains:

-   product architecture;
-   Experience Engine;
-   content model;
-   Engineering Director governance;
-   Experience design;
-   Evidence/Media semantics;
-   Asset governance;
-   QA;
-   prompt contracts;
-   reusable asset library;
-   technical reference library.

## 3. INTEGRATION PRINCIPLE

The numbered files are staging artifacts.

Integrate them into repository-native canonical locations.

Preferred logical structure when compatible:

``` text
AGENTS.md

docs/
  architecture/
  engineering/

prompts/
  experiences/
  notebook/
  assets/

assets/
  library/

knowledge/
```

Use existing equivalent structures instead of creating unnecessary
parallel trees.

Remove staging numbering from final canonical filenames where
appropriate.

## 4. ROOT AGENTS

Install/update the repository root `AGENTS.md` as the concise agent
entry point.

Update its links to final canonical paths.

## 5. GOVERNANCE AND ARCHITECTURE

Integrate:

-   Engineering Director Playbook;
-   D2R Architecture;
-   Experience Engine;
-   Content Model.

Resolve overlap through SSOT ownership and links.

Do not create competing canonical documents.

## 6. STANDARDS

Integrate:

-   Experience Design Standard;
-   Evidence & Media Semantics;
-   Asset Governance;
-   QA Standard.

Ensure cross-links point to final paths.

## 7. LIBRARIES

Integrate the Asset Library and Technical Reference Library governance.

Create only the directory/index structure required by the real
repository.

Preserve existing assets and references.

Do not move binaries merely for cosmetic structure.

## 8. PROMPT CONTRACTS

Integrate prompt index and task contracts into a discoverable prompt
structure.

Update each contract to final canonical documentation paths.

Prompts should reference standards instead of duplicating them.

## 9. DOCUMENTATION INDEX

Create or update the appropriate documentation index so a developer or
agent can discover:

``` text
What is D2R?
Where is architecture?
How is an Experience designed?
How do Evidence and Media work?
How are assets governed?
How does QA work?
Which Codex contract should I run?
Where are reusable assets?
Where are technical references?
```

## 10. REPOSITORY REALITY CHECK

Compare staged documentation with the actual repository.

If a staged statement conflicts with inspected implementation:

-   do not silently rewrite production;
-   classify the discrepancy;
-   correct documentation when it is merely a path/name mismatch;
-   report architectural/semantic conflicts that require a product
    decision.

The current repository is evidence; the Engineering OS is governance.
Reconcile explicitly.

## 11. PROTECT PRODUCTION

This task is governance integration.

Do not change:

-   Experience Engine runtime behavior;
-   production Experience semantics;
-   production YAML;
-   Experience learner content;
-   image binaries;
-   website behavior.

Any required production change is a separate task.

## 12. PRESERVE WORKTREE

Record pre-existing changes before implementation.

Do not revert, overwrite, or claim unrelated work.

## 13. VALIDATION

Validate:

-   all final Markdown paths;
-   internal relative links;
-   duplicate canonical documents;
-   obsolete references;
-   naming consistency;
-   Markdown readability;
-   discoverability from root;
-   prompt-to-standard links;
-   library indexes;
-   no production runtime changes;
-   `git diff --check`.

Run documentation/repository tests affected by path/index changes where
applicable.

## 14. STAGING DIRECTORY

After successful integration, report which `./md/` files have canonical
destinations.

Do not delete the staging directory unless explicitly authorized.

## 15. FINAL REPORT

Return exactly these sections:

1.  REPOSITORY INSPECTION
2.  PRE-EXISTING WORKTREE STATE
3.  SSOT MAP
4.  GOVERNANCE ARCHITECTURE IMPLEMENTED
5.  FILES CREATED
6.  FILES MODIFIED
7.  FINAL CANONICAL PATHS
8.  AGENTS.md BEHAVIOR
9.  PROMPT LIBRARY
10. ASSET LIBRARY
11. TECHNICAL REFERENCE LIBRARY
12. DOCUMENTATION INDEX
13. LINK VALIDATION
14. TESTS / VALIDATION
15. PRODUCTION FILES CHANGED
16. ENGINE CHANGES
17. EXPERIENCE CHANGES
18. IMAGE BINARY CHANGES
19. GIT DIFF CHECK
20. STAGING FILE DISPOSITION
21. COMMITS
22. PUSH
23. FINAL DIRECTORY TREE
24. BLOCKERS / DEBT

Finish with these lines only if supported by the validation:

``` text
D2R ENGINEERING OS IMPLEMENTED
REPOSITORY GOVERNANCE ACTIVE
CODEX PRODUCTION CONTRACTS READY
```

## 16. COMMIT POLICY

Do not commit. Do not push.
