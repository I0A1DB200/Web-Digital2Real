# Digital2Real Experience Engine

The Experience Engine is the Digital2Real product responsible for creating structured industrial learning experiences based on diagnosis, evidence, decision-making, and troubleshooting.

It does not replace the Notebook.

- **Notebook** explains reusable technical knowledge.
- **Experience Engine** trains engineering judgement through realistic situations.
- **Architect** governs both systems and protects their boundaries.

## Purpose

The Experience Engine transforms real industrial failure modes into reusable learning assets that train engineers and technicians to:

- observe symptoms without jumping to conclusions;
- distinguish symptoms, causes, consequences, and vulnerabilities;
- reduce uncertainty through proportionate tests;
- prioritize safe and non-invasive actions;
- reason from evidence;
- identify root cause;
- recover equipment safely;
- prevent recurrence.

## Repository structure

```text
experience-engine/
├── README.md
├── architecture/
│   └── experience-engine-principles.md
├── briefs/
│   ├── README.md
│   ├── experience-brief-schema.yaml
│   └── EE-0002-drive-reset.yaml
├── workflows/
│   ├── experience-creation-workflow.md
│   └── automatic-experience-generation-workflow.md
├── schemas/
│   └── experience-schema.yaml
├── prompts/
│   └── experience-generator-prompt.md
├── validation/
│   └── experience-validation-rules.md
├── integration/
│   └── web-integration-contract.md
├── templates/
│   └── experience-template.md
└── experiences/
    └── siemens/
        └── exp-sie-pn-001-cpu-stop-after-power-loss/
            ├── README.md
            ├── experience.yaml
            ├── fault-model.md
            ├── decision-tree.md
            └── debrief.md
```

## Core rule

An experience must never ask only whether the learner knows the correct answer.

It must reveal whether the learner knows:

> What should be checked next, why that check is appropriate, and how the evidence changes the diagnosis.

## Content model

An engineer begins with one Experience Brief containing the minimum known industrial problem. The generator expands that input into the complete model below.

Each experience contains:

1. a defined engineering competency;
2. an industrial scenario;
3. an internally consistent fault model;
4. progressive evidence;
5. decisions with consequences;
6. a controlled diagnostic tree;
7. a technically rigorous debrief;
8. reusable lessons linked to Notebook knowledge.

The generation boundary is:

```text
Experience Brief
→ Experience Generator
→ experience.yaml
→ Web
```

The Brief is the only file written manually by the engineer. `experience.yaml` and its supporting Markdown assets are generated and reviewed through the official workflow.

## Naming convention

Experience identifiers use:

```text
EXP-<PLATFORM>-<DOMAIN>-<SEQUENCE>
```

Example:

```text
EXP-SIE-PN-001
```

Where:

- `EXP` = Experience
- `SIE` = Siemens
- `PN` = PROFINET
- `001` = sequence number

Folder names use lowercase kebab-case.

## Source of truth

An Experience Brief is the structured source of truth for the engineer's original input.

The authoritative structured representation of an experience is `experience.yaml`, governed by `schemas/experience-schema.yaml`.

The Markdown files provide human-readable explanations and design rationale. They must remain consistent with the YAML source.

Existing schema 1.0 experiences remain supported for Draft and technical review. New experiences use the canonical schema 2.0 profile, and legacy experiences must be normalized before approval or publication.

## Status

This foundation includes the first reference experience:

`EXP-SIE-PN-001 — CPU STOP after power loss`
