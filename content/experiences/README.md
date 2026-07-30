# Experience Content

This directory owns authored Experience material independently from Experience Engine.

## Allowed content

- Experience Briefs and their authoring contract;
- canonical and legacy Experience packages;
- Experience authoring templates;
- fault models, decision trees, debriefs, and review assets.

## Prohibited content

- YAML parsing or normalization logic;
- Headless Player runtime state;
- validation implementation;
- publication tooling;
- Experience Workspace UI;
- generated browser artifacts.

Experience Engine processes this content through its approved schemas, Adapter, validation rules, Player, workflows, and integration contracts. Generated browser packages remain disposable outputs.

Current Experience content remains under `experience-engine/` until its approved migration packages execute. There MUST NOT be two editable Experience sources of truth.

See [ADR-0001](../../docs/03-governance/decisions/ADR-0001-content-ownership.md) and the [Experience Design Standard](../../docs/02-standards/D2R-003-experience-design-standard.md).

