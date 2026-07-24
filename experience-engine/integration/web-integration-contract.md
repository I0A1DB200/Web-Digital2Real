# Web Integration Contract

**Status:** Official  
**Owner:** Digital2Real Architect  
**Applies to:** Experience Engine content ingestion and future public web integration

## Purpose

This document defines the minimum boundary between Experience Engine and the Digital2Real web application.

It defines data ownership and consumption. It does not define an API, database, CMS, framework, build system, or Experience Player implementation.

## Source of truth

`experience.yaml` is the primary and authoritative source for an experience.

Markdown files are complementary assets for:

- human review;
- technical explanation;
- fault-model review;
- diagnostic-tree review;
- learner debrief;
- internal documentation.

The web application must not depend on Markdown file structure for runtime behavior. Markdown headings, ordering, and prose are not an application contract.

The schema in `experience-engine/schemas/experience-schema.yaml` defines the structured boundary. The web must not invent fields or infer missing behavior from auxiliary prose.

## Loading pipeline

```text
experience.yaml
→ schema validation
→ normalized experience model
→ Experience Player
```

The pipeline must reject an experience before normalization when:

- YAML cannot be parsed;
- the schema profile is unsupported;
- required references do not resolve;
- publication state is invalid;
- validation blocks ingestion.

Normalization may map an explicitly supported legacy profile to the current model for review. Legacy experiences must not reach production until they have been migrated and validated against the current canonical profile.

## Normalized experience model

The normalized model preserves the responsibilities of the schema:

- identity and publication metadata;
- classification;
- competencies and learning objectives;
- learner-facing scenario;
- private fault model;
- stages;
- evidence;
- decisions;
- diagnostic model;
- evaluation;
- debrief;
- references;
- technical validation.

Normalization must not change meaning, generate missing technical facts, or create a second persisted source of truth.

Private authoring data must be separable from learner-facing data before delivery to the Experience Player.

## Web data requirements

### Listing experiences

Required fields:

- `experience.id`;
- `experience.slug`;
- `experience.title`;
- `experience.summary`;
- `experience.difficulty`;
- `experience.estimated_duration`;
- `classification.platform`;
- `classification.domain`;
- `classification.industry`;
- `web.publication_status`;
- `web.tags`;
- `web.featured`.

Only records with `web.publication_status: published` may be listed in production.

### Experience card

Required fields:

- title;
- summary;
- difficulty;
- estimated duration;
- platform or domain label;
- cover-image disposition;
- route;
- featured state.

A missing optional cover image must use an approved web fallback. The ingestion layer must not invent an asset path.

### Cover and route

Required fields:

- `web.route`;
- `web.cover_image`;
- `experience.slug`.

Routes must be unique. Asset existence must be validated before publication.

### Starting a session

Required static fields:

- experience ID and version;
- competencies and learning objectives;
- initial stage ID;
- learner role;
- initial context;
- operational state;
- safety context;
- initial evidence;
- evaluation configuration.

Starting a session creates temporary state. It does not mutate the source model.

### Presenting context

Learner-facing context may include:

- initial context;
- operational state;
- initiating event as observable by the learner;
- learner role;
- safety controls;
- business impact;
- current stage situation.

Private root-cause, rejected-hypothesis, and debrief information must remain unavailable until allowed by experience state.

### Presenting stages

Required fields:

- stage ID;
- title;
- situation;
- objective when learner-visible;
- references to evidence currently available;
- references to permitted decisions.

The player must resolve references from the normalized model. It must not parse the decision-tree Markdown.

### Presenting decisions

Required fields:

- decision ID;
- stage ID;
- action.

Rationale, classification, consequence, scoring, safety effects, and future destination are evaluation data. They must not be exposed before selection unless the experience explicitly defines them as learner-visible feedback.

### Revealing evidence

Required fields:

- evidence ID;
- type;
- source;
- content;
- reliability when learner-visible;
- revealing decision or initial-availability rule.

Evidence becomes visible only through the structured reveal rules. The UI must not infer reveal order from list position.

### Recording choices

The session records:

- selected decision ID;
- originating stage ID;
- simulation or session timestamp;
- resulting stage;
- evidence revealed;
- score and safety effects.

These records are session state, not changes to `experience.yaml`.

### Calculating score

Required fields:

- evaluation dimensions;
- scoring bounds;
- decision score effects;
- completion conditions.

The web may calculate a session score from the validated rules. It must not redefine weights, decision effects, or thresholds.

### Evaluating safety

Required fields:

- safety context;
- decision safety effects;
- safety threshold;
- safety-related completion conditions;
- blocked terminal state.

Unsafe actions must never receive positive safety outcomes. A failed safety gate may block progression or completion according to the structured model.

### Completing an experience

Completion requires:

- a valid terminal transition;
- all completion conditions satisfied;
- safety threshold satisfied;
- required root-cause confirmation;
- required recovery and functional validation;
- a recorded completion status.

Reaching controller RUN or restarting a machine is not sufficient unless the structured completion conditions explicitly confirm recovery and validation.

### Presenting the debrief

Required fields:

- fault summary;
- correct reasoning;
- common errors;
- recovery;
- prevention;
- engineering lessons;
- Notebook references.

The debrief is available only after the configured completion or termination condition. The structured debrief is authoritative; the Markdown debrief may provide a richer human-readable rendering without changing its meaning.

## Static data and session state

### Static data

Static data comes from the normalized `experience.yaml` model:

- identity and version;
- classification;
- competencies and objectives;
- scenario;
- stages;
- evidence definitions;
- decision definitions;
- diagnostic model;
- evaluation rules;
- debrief;
- references;
- publication metadata.

Static data is immutable during a learner session.

### Temporary session state

Temporary state may include:

```text
currentStage
revealedEvidence
selectedDecisions
visitedStages
score
safetyScore
elapsedTime
completionStatus
```

Session state:

- belongs to the Experience Player or its future session owner;
- is initialized from the static model;
- must not be written into `experience.yaml`;
- must not redefine static rules;
- may be discarded when persistence is not required;
- requires a separate approved contract before any future persistence.

## Publication states

The only publication states are:

- `draft` — the experience is under construction;
- `technical_review` — technical review is pending or active;
- `approved` — technical validation has passed but the experience is not publicly visible;
- `published` — the experience is approved and visible in production;
- `archived` — the experience is withdrawn without deleting its history.

Only `published` may be shown in production.

The ingestion boundary must also enforce:

- `experience.status` equals `web.publication_status`;
- `published` requires `metadata.technical_validation.status: pass`;
- unresolved blocking uncertainty prevents `approved` and `published`;
- archived content is excluded from normal discovery;
- drafts and review content may appear only in explicitly separated development or review tooling.

## Notebook integration

The web resolves Notebook references as links to separately owned editorial content.

The Experience Player must not:

- copy Notebook article content into the experience model;
- require Notebook internals to execute diagnostic logic;
- modify Notebook state or content;
- treat a missing optional Notebook reference as permission to invent theory.

Broken required references block publication. Proposed Notebook topics remain editorial work outside Experience Engine generation.

## Future automation

The intended future sequence is:

```text
Industrial fault input
→ master generation prompt
→ generated experience files
→ automatic validation
→ technical review
→ approval
→ web ingestion
→ publication
```

Future automation may implement this sequence only through separately approved packages.

This contract does not implement:

- MCP;
- an API;
- a database;
- a CMS;
- publication CI;
- an Experience Player;
- transformation scripts;
- session persistence;
- authentication;
- analytics.

Any future implementation must preserve `experience.yaml` as the single structured source and keep generation, validation, ingestion, presentation, and session state as separate responsibilities.
