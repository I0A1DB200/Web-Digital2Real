# Experience Briefs

**Status:** Official  
**Owner:** Digital2Real Architect  
**Applies to:** Manual industrial knowledge input for Experience Engine

## Purpose

An Experience Brief is the minimum structured input from which Experience Engine generates a complete industrial learning experience.

It captures the technical problem known by an engineer before generation begins. It is not an experience and must not attempt to design one.

The Experience Brief is the only file an engineer needs to write manually.

## Workflow

```text
Industrial Knowledge
  ↓
Experience Brief
  ↓
Generator Prompt
  ↓
Experience
  ↓
Validation
  ↓
Publication
```

The formal data flow is:

```text
Experience Brief
  ↓
Experience Generator
  ↓
experience.yaml
  ↓
Web
```

The public web never consumes an Experience Brief directly.

## Content

A Brief contains only:

- brief identity, title, and version;
- platform, vendor, industry, and machine classification;
- proposed difficulty or `unknown`;
- observed technical problem;
- known root cause or `unknown`;
- applied resolution or `unknown`;
- intended learning goals;
- intervention, safety, and technical constraints;
- references available to the engineer.

Unknown information must remain explicit. A Brief must not invent manufacturer behavior to appear complete.

## Excluded responsibilities

An Experience Brief must not contain:

- stages;
- decisions;
- evidence;
- hypotheses;
- a diagnostic tree;
- consequences or scoring;
- session state;
- evaluation logic;
- debrief content;
- web publication metadata;
- learner-facing narrative;
- generated Markdown assets.

These responsibilities belong to the generated experience and its validation process.

## Source-of-truth boundary

The Brief and the experience have different ownership:

- the Brief is the structured source of truth for the engineer's original technical input;
- `experience.yaml` is the structured source of truth for the generated experience;
- derived experience Markdown must agree with `experience.yaml`;
- the web consumes only a validated normalized experience model.

The Brief does not override `experience.yaml` after generation, and `experience.yaml` must not be edited back into the Brief automatically.

When the original industrial knowledge changes, update the Brief and run generation again through a controlled review. Generated changes remain Draft until validation passes.

## File contract

Every Brief must:

- be a YAML file in `experience-engine/briefs/`;
- validate against `experience-brief-schema.yaml`;
- use a stable `EE-0000` identifier;
- contain only fields defined by the Brief schema;
- preserve unknown values explicitly;
- provide references when a manufacturer-specific claim requires verification.

Brief validation confirms input structure only. It does not establish that a generated experience is technically approved or publishable.
