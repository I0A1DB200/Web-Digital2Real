# Foundation Pack v1

# 1. Purpose

The Foundation Pack v1 is the first official Digital2Real content-production portfolio. It is a deliberately small set of Experiences used to validate the complete path from governed industrial capability to reviewed publication.

Its objective is to prove that Digital2Real can repeatedly produce technically credible, educationally effective, bilingual Experiences with reusable knowledge and media. It does not attempt to cover the whole field of industrial automation, complete the target portfolios in the [Industrial Capability Framework](../01-architecture/D2R-001-industrial-capability-framework.md), or validate a learner's professional capability through completion alone.

The pack inaugurates RC2 — Content Production. Platform contracts and implementation remain governed by their existing authorities; this roadmap defines production intent only.

# 2. Success Criteria

The Foundation Pack is complete when:

- all eleven Experiences conform to [D2R-STD-001](../02-standards/D2R-STD-001-experience-package.md);
- every Experience references or commissions associated canonical Notebook knowledge without duplicating it;
- all learner-facing content is available in Spanish and English with reviewed fallback behaviour;
- all required multimedia has genuine, traceable premium masters and reviewed web derivatives;
- every Experience passes the applicable Authoring, Runtime, Web Artifact, packaging, localization, Player, security, and repository regression checks;
- every Experience develops one declared principal ICF Capability through a bounded set of governed competencies;
- every technical, pedagogical, safety, multimedia, localization, and publication review is complete;
- production packaging includes the Experiences through the approved `published` boundary.

The pack validates the production system and its repeatability. It does not by itself validate or certify any learner Capability.

# 3. Experience List

The initial portfolio assigns one principal Capability to each Experience. Titles define planning boundaries, not approved Experience content. Detailed competency mapping, fault models, evidence, decisions, and technical claims are established only during design and review.

| ID | Capability | Title | Status |
|---|---|---|---|
| EE-0008 | ICF-01 — PLC Diagnostics | IO-Link Device Offline | Technical review |
| EE-0009 | ICF-02 — Industrial I/O | Sensor Signal Missing | Planned |
| EE-0010 | ICF-03 — Motion Control | Drive Fails to Reach Commanded Speed | Planned |
| EE-0011 | ICF-04 — Industrial Communications | Remote Station Unavailable | Planned |
| EE-0012 | ICF-05 — Functional Safety | Guard Circuit Will Not Reset | Planned |
| EE-0013 | ICF-06 — Electrical Troubleshooting | Intermittent 24 V Control Supply | Planned |
| EE-0014 | ICF-07 — Pneumatic Systems | Cylinder Fails to Extend | Planned |
| EE-0015 | ICF-08 — Hydraulic Systems | Axis Drifts Under Load | Planned |
| EE-0016 | ICF-09 — HMI & SCADA Diagnostics | HMI Value Frozen During Production | Planned |
| EE-0017 | ICF-10 — PLC Architecture | Sequence State Lost After Restart | Planned |
| EE-0018 | ICF-11 — Advanced Industrial Troubleshooting | Intermittent Multi-System Production Stop | Planned |

EE-0008 retains its current governed references and review state. The principal Capability in this roadmap identifies the pack's primary production objective; it does not replace the complete Capability and competency references owned by each future Experience definition.

# 4. Deliverables

Each Experience must deliver:

- **Experience Package:** one canonical package conforming to D2R-STD-001;
- **Notebook:** associated reusable knowledge, referenced rather than copied into the Experience;
- **Media Brief:** the approved educational purpose, required observations, and evidence boundary for each asset;
- **Masters:** genuine, traceable premium source media governed by EXP-SPEC-001;
- **Web Assets:** reviewed publication derivatives referenced by the Experience Package;
- **Runtime:** the validated generated Runtime representation;
- **Web Artifact:** the validated generated browser-consumable representation;
- **Tests:** applicable content, contract, localization, packaging, security, Player, and regression evidence;
- **Review:** recorded technical, pedagogical, safety, multimedia, internationalization, and Product Owner approval.

Runtime and Web Artifact are generated outputs. They do not become editable content sources or additional package responsibilities.

# 5. Media Library Growth

Each Experience should add technically reusable industrial components, states, and evidence patterns to the available media body. Reuse reduces production cost and improves visual consistency, but it must preserve provenance, technical meaning, localization, and the authoritative source of each master.

```text
EE-0009
↓
Photoelectric sensor
↓
Reusable media library
```

A reusable component may support later Experiences when its physical state and educational meaning remain valid. Reuse must never cause one Experience's fault, evidence, or narrative to be copied as a universal model. New media is justified by a learning requirement, not by a target asset count.

# 6. Production Workflow

The Foundation Pack follows the process defined by the [Digital2Real Experience Design Guide](../03-governance/D2R-GUIDE-001-experience-design-guide.md):

```text
Capability
↓
Blueprint
↓
Experience Design
↓
Notebook
↓
Media Brief
↓
Masters
↓
Codex Build
↓
Review
↓
Publish
```

- **Capability:** selects the principal governed professional ability and its relevant competencies.
- **Blueprint:** bounds the industrial problem, learning objective, safety context, and technical model.
- **Experience Design:** establishes the evidence-led learning flow, decisions, consequences, verification, and debrief.
- **Notebook:** supplies or commissions the reusable knowledge required by the design.
- **Media Brief:** defines what must be observable and why.
- **Masters:** provide authoritative production sources.
- **Codex Build:** creates the governed package from approved inputs without inventing technical facts.
- **Review:** verifies the complete Experience across all required disciplines.
- **Publish:** releases only approved content through the production catalog boundary.

Work may iterate between adjacent stages when review identifies a genuine gap. Iteration must update the responsible source rather than introduce duplicated corrections downstream.

# 7. Completion

Foundation Pack v1 is complete only when all eleven planned Experiences satisfy every success criterion and deliverable in this roadmap, are individually approved, and are available through the production catalog in Spanish and English.

Completion also requires evidence that the production workflow is repeatable: Notebook relationships resolve, media provenance is retained, generated outputs remain deterministic, private information does not enter public artifacts, full tests pass, and production publication contains only approved Experiences.

Partial publication may occur as individual Experiences become ready, but it does not complete the Foundation Pack. Unresolved technical uncertainty, missing Notebook ownership, absent masters, incomplete localization, failing validation, or a non-published lifecycle state keeps the affected Experience—and therefore the pack—open.
