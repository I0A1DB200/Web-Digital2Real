# Digital2Real --- Asset Governance

**Role:** Canonical governance for industrial media assets

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

The reusable catalog is indexed at [`assets/library/`](../../assets/library/README.md). [D2R-SPEC-004](../03-governance/D2R-SPEC-004-engineering-artifact-library.md) retains its bounded engineering-artifact specification; this standard owns media lifecycle, semantic validity, disclosure timing and reuse decisions.

## 1. Asset lifecycle

``` text
LEARNING NEED
→ SEARCH EXISTING LIBRARY
→ SEMANTIC VALIDATION
→ REUSE

or

LEARNING NEED
→ NO SUITABLE ASSET
→ NEW ASSET SPEC
→ CREATE / ACQUIRE
→ TECHNICAL VALIDATION
→ REGISTER
→ USE
```

## 2. Asset-first design is prohibited

Do not build diagnostic logic around images merely because they exist.

Reasoning defines the media need.

## 2.1 Realistic asset first for Engineering Experiences

When learner judgement depends on physical industrial reality, realistic industrial representation is the default visual language. Device recognition, installation, wiring, cabinet layout, mechanical condition, indicators, connectors, terminals, measurement setup and operator-interface state should normally be shown through physically plausible imagery.

Diagrammatic SVGs, schematics and overlays remain supporting media for signal flow, mathematical scaling, architecture, conceptual relationships and simplified comparison. They must not replace physical observation when that observation is part of the diagnosis. The direction is approximately 95% realistic or physical representation where physical reality contributes materially; this is editorial direction, not a validator threshold.

Experience engineering assets prioritize technical truth, diagnostic timing, learner judgement and traceability. Notebook and technical-reference visuals choose realism or abstraction by explanatory value. Marketing, website and social visuals may prioritize brand and composition, but that freedom does not lower Experience standards.

Before creating media, resolve candidates in this order: current Experience assets, the reusable D2R Asset Library, technically compatible assets from earlier Experiences, Source Library references, then governed creation. Cross-Experience candidates must be classified as intentional reuse, reusable D2R asset, Experience-specific, reference only or unsuitable after checking state, identity, timing, context and provenance.

## 2.2 Finished learner-facing media

Experience media delivered to the learner should be a finished raster image asset unless a strong architectural exception is documented. Physical learning moments use realistic industrial images. Abstract, data, software, scaling and signal-flow moments use designed technical images. Annotated images may combine either base with restrained callouts.

SVG, canvas, code and diagram tools may be used internally as production methods. A raw SVG diagram is not the preferred final Experience asset. Designed media must also avoid “UI inside UI”: the Experience player owns the Experience number, title, Result or stage heading, navigation, outer card shell and product framing. The visual contains only the engineering information needed for its learning moment. Experience identifiers, D2R branding and editorial titles are not burned into assets by default.

This raster-first delivery rule applies to Engineering Experience media. It does not impose the same constraint on marketing, website or social workflows.

## 3. Required asset record

For every reusable or Experience-critical asset capture:

-   asset ID;
-   filename;
-   equipment/domain;
-   source/provenance;
-   what pixels show;
-   what it proves;
-   what it does not prove;
-   allowed roles;
-   earliest disclosure moment;
-   technical compatibility;
-   reuse restrictions;
-   licensing/copyright status where relevant.

## 4. Semantic validation

Validate:

-   correct equipment;
-   correct model/family where material;
-   correct master/device relationship;
-   correct channel/port;
-   correct PLC block/tag/address;
-   correct topology;
-   correct machine state;
-   correct pre/post-intervention state.

## 5. Provenance

Record whether an asset is:

-   original D2R capture;
-   generated;
-   derived;
-   vendor/public reference;
-   Experience-local;
-   reusable library asset.

Do not treat unknown provenance as approved reusable provenance.

Reusable asset records may reference Source Library records through `source_ids`. This preserves traceability and does not transfer copyright, licensing, transformation permission, technical approval, or production authority. External manufacturer imagery remains `ASSET_REFERENCE` until a separate asset review approves a D2R-controlled production asset.

## 6. Reuse

Reuse is preferred when the existing asset is technically and
semantically valid.

Reuse must not:

-   create false topology;
-   reveal future evidence;
-   show obsolete machine state after correction;
-   imply proof the pixels do not support.

## 7. Experience-local assets

Experience-local assets remain with the Experience package according to
repository conventions.

A reusable library does not replace published package requirements.

## 8. Registered but hidden

`REGISTERED BUT NOT PRESENTED` is valid.

Document why.

Do not delete or present an asset solely to achieve symmetry.

## 9. New asset specification

When a new asset is required, specify:

``` text
LEARNING MOMENT:
ENGINEERING INFORMATION REQUIRED:
SYSTEM/EQUIPMENT:
VISIBLE STATE:
MUST SHOW:
MUST NOT SHOW:
TECHNICAL CONSTRAINTS:
SEMANTIC ROLE:
LOCALIZATION/TEXT CONSTRAINTS:
ACCEPTANCE CRITERIA:
```

For realistic assets, also record the physical scene, observable state, critical geometry or interfaces, information that must remain hidden, and whether a supporting diagram or overlay is justified. Generated imagery requires inspection against the Asset Spec and Experience truth model; the first generation is not accepted automatically.

## 10. Binary authority

If duplicate binary collections exist, determine source authority before
synchronization.

Semantic remapping and binary-source reconciliation are separate tasks.

## 11. Quality gate

An asset is approved only when:

``` text
technical validity
+
semantic validity
+
provenance acceptability
+
correct timing
```

## 12. Governing rule

> An industrial image is engineering evidence only when its content,
> provenance, system context, and disclosure timing are defensible.
