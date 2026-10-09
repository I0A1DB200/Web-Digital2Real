# Codex Contract --- Create Experience

**Mode:** RESEARCH/INSPECT → DESIGN → IMPLEMENT → VALIDATE → REPORT

> **D2R Engineering OS**
>
> This document is governed by `docs/03-governance/ENGINEERING-DIRECTOR-PLAYBOOK.md`,
> `AGENTS.md`, and `docs/01-architecture/D2R-ENGINEERING-OS-ARCHITECTURE.md`. Canonical repository paths are authoritative.

## INPUT

Experience brief: `<brief>`\
Editorial ID: `<EE-XXXX>`\
Target ENV: `<ENV-ID if known>`

## OBJECTIVE

Create a complete Engineering Experience that teaches defensible
industrial diagnostic judgement and conforms to D2R architecture.

## 1. READ

Read governance and all Experience, Evidence/Media, Asset, and QA
standards.

Inspect representative repository Experiences and actual package
conventions.

## 2. ESTABLISH ENGINEERING CASE

Define:

-   system;
-   incident;
-   root cause;
-   initial facts;
-   diagnostic boundaries;
-   corrective action;
-   recovery criteria;
-   verification.

Expose uncertainty. Do not invent missing technical facts.

## 3. DESIGN INFORMATION FLOW

Build the learning-moment matrix before YAML.

For each moment define:

``` text
known before
→ action
→ action class
→ evidence acquired
→ media
→ justified conclusion
→ DIRECT or RESULT
```

## 4. EVIDENCE

Classify initial/context vs acquired.

Define reciprocal authority.

## 5. MEDIA

Follow the resolution order in `D2R-STD-003-asset-governance.md`: current Experience assets, reusable D2R assets, technically compatible earlier Experience assets, Source Library references, then governed creation.

Audit candidate assets semantically.

If no suitable asset exists, produce a `NEW ASSET REQUIRED`
specification using the Asset Spec contract.

Where physical industrial reality contributes to learner judgement, use realistic industrial imagery by default. Use diagrams or overlays as support when the learning moment is primarily mathematical, architectural or conceptual. Inspect every generated or edited image against its Asset Spec, technical constraints, disclosure timing and Experience truth model, and iterate before integration.

Classify each learning moment as physical or abstract. Produce a realistic industrial image for physical moments and a designed technical image for abstract/data/software moments. Follow Asset Governance for reuse, sources and review, then integrate a finished raster learner-facing asset. Vector, code or diagram sources may be internal production tools; avoid raw learner-facing SVG and redundant player-like framing unless an architectural exception is recorded.

Do not distort the Experience to fit existing media.

## 6. SAFETY

Place supported safety prerequisites before relevant actions.

## 7. IMPLEMENT

Create canonical package content using repository conventions:

-   YAML;
-   ES;
-   EN;
-   docs/source notes;
-   asset references;
-   focused tests;
-   required indexes/associations.

## 8. ENGINE GATE

If the valid design requires unsupported reusable runtime behavior,
classify `ENGINE` and stop before shared architecture changes unless
authorized.

## 9. VALIDATE

Run:

-   focused tests;
-   relevant shared tests;
-   A--F failure classification;
-   `git diff --check`;
-   preview generation;
-   generated ES/EN inspection;
-   automatic learner flow.

## 10. STATUS

Do not claim final completion until real Browser QA passes.

## 11. REPORT

Return engineering case, flow, counts, evidence, media, asset
provenance, files, tests, shared failures, preview, learner flow,
Browser QA status, Engine changes, binary changes, commits and push.

Do not commit or push unless explicitly authorized.
