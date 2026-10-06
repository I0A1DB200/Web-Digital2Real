# Codex Contract --- Asset Audit

**Document:** 20\
**Mode:** INVENTORY → PIXEL/SEMANTIC REVIEW → MAP → REPORT

> **D2R Engineering OS**
>
> This document is governed by `01_ENGINEERING_DIRECTOR_PLAYBOOK.md`,
> `02_AGENTS.md`, and `03_D2R_ARCHITECTURE.md`. During staging, files
> may live under `./md/`. After integration, canonical repository paths
> are authoritative.

## INPUT

Target assets: `<Experience, directory, or asset IDs>`

## OBJECTIVE

Determine the technical and pedagogical validity of existing media.

## FOR EACH ASSET

Inspect the actual media where accessible.

Record:

-   ID;
-   path;
-   provenance;
-   visible equipment/state;
-   text/tags/addresses;
-   what it proves;
-   what it does not prove;
-   current usage;
-   earliest legitimate disclosure;
-   cross-asset compatibility;
-   allowed roles;
-   reuse restrictions;
-   final recommendation.

## FINAL STATUS

Use:

-   APPROVED REUSE
-   EXPERIENCE-LOCAL
-   INTENTIONAL REUSE
-   REGISTERED BUT NOT PRESENTED
-   REPLACEMENT RECOMMENDED
-   NEW ASSET REQUIRED
-   PROVENANCE REVIEW REQUIRED

## CROSS-ASSET CHECK

Compare:

-   master/device;
-   channel/port;
-   PLC/DB/block/address;
-   topology;
-   protocol;
-   machine state;
-   pre/post-correction state.

## OUTPUT

Produce an asset semantic matrix and list any Experience/content
implications.

Do not modify binaries. Do not invent reconciliation. No commit/push.
