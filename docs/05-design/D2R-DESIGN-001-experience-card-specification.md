# D2R-DESIGN-001 — Experience Card Specification

| Field | Value |
|---|---|
| Status | Official |
| Scope | Experience Lab listing |
| Product area | Experience Lab |
| Design authority | Digital2Real Product Design |

# Purpose

This specification defines the official visual presentation of an Experience in the Experience Lab listing.

An Experience must appear as an editorial technical case: a credible industrial situation that invites investigation. It must not resemble an e-learning card, course tile, quiz entry, achievement panel, or dashboard widget. The listing introduces the case; it does not expose the complete briefing or summarize the learning system behind it.

# Design Principles

## Editorial First

Composition, image, typography, rhythm, and whitespace must communicate the character of a technical publication. Interface chrome must remain subordinate to the case.

## Content First

The industrial situation is the primary subject. Every visible element must help identify, understand, or enter that situation.

## Minimalism

The listing must contain only the information required to recognize the case and begin the investigation. Additional metadata must not compete with the title or summary.

## Engineering Identity

Photography, terminology, and composition must feel precise, credible, and grounded in industrial engineering. Decorative treatment must never replace technical clarity.

## No Visual Noise

Cards must avoid ornamental icons, competing labels, dense metadata, and unnecessary controls. Repetition across multiple Experiences must produce calm editorial rhythm rather than dashboard density.

# Official Layout

Each Experience is presented as one horizontal, fully interactive row:

```text
┌──────────────────────┐     Title
│                      │
│        COVER         │     Summary
│                      │
└──────────────────────┘

                             → Begin Investigation
```

The intended proportional relationship is:

- Cover: approximately 30% of the row width.
- Content: approximately 70% of the row width.

These proportions express hierarchy rather than a rigid pixel contract. Responsive adaptations must preserve the same relationship: the cover identifies the case while the content explains why it merits investigation.

# Cover

The cover is a visual identifier, not a condensed information panel.

It may contain exclusively:

- the editorial Experience ID in the format `EE-XXXX`;
- one editorial image;
- minimal contextual information, such as `Packaging Line / ST03`, only when it materially improves identification of the industrial setting.

It must not contain:

- title;
- summary;
- call to action;
- difficulty;
- duration;
- Capability;
- evidence information;
- decision information.

The Experience ID belongs to the cover and must not be repeated elsewhere in the row.

# Content

The content area contains only:

- the Experience title;
- an editorial summary occupying approximately three to four lines;
- the official textual call to action.

The official call to action is:

```text
→ Begin Investigation
```

The call to action must remain textual. Large buttons, filled controls, promotional treatments, and competing actions are not permitted. The whole row is clickable, so the textual CTA communicates intent rather than defining the only interaction target.

# Information Hierarchy

The visual reading order is:

1. Cover.
2. Title.
3. Summary.
4. CTA.

Size, spacing, contrast, and alignment must reinforce this sequence. Metadata must not interrupt it.

# Removed Elements

The Experience listing must not display:

- `CASE`;
- a duplicate Experience ID outside the cover;
- chips;
- badges;
- decorative icons;
- `Foundation` or another difficulty label;
- duration;
- evidence count;
- decision count;
- Capability labels.

These values belong to the initial Experience briefing or its governed internal definition. They are not part of the editorial listing.

# UX Behaviour

## Hover

Hover may introduce a slight illumination and a smooth transition. The effect must remain restrained and must not alter layout, obscure content, or introduce decorative motion.

## Click

The complete row opens the Experience. Cover, title, summary, and CTA form one interaction target. Keyboard focus and activation must follow the same unified behavior.

# Consistency

Experience Lab and Engineering Notes share one editorial language because both belong to the same technical publication.

Engineering Notes teach and organize reusable knowledge. Experiences present industrial cases that require observation, evidence, judgment, and action. Their purposes differ, but their typography-led composition, visual restraint, whitespace, and engineering credibility must remain recognizably Digital2Real.
