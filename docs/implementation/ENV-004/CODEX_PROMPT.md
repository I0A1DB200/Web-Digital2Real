# CODEX IMPLEMENTATION CONTRACT — ENV-004 full text-first implementation

## Objective and classification
D2R CONTENT integration, plus existing Environment configuration. Implement **ENV-004 Industrial Electrical Systems** as an integrated Environment with the user-approved cover, **exactly ten hotspots**, **25 Notebook knowledge entries grouped in five learning blocks**, and **ten fully authored Engineering Experiences**. This is **TEXT-FIRST**: experience-specific visual evidence (approximately 6–7 assets per EXP, subject to actual contract) will be supplied later. Do not generate, invent, or substitute fake evidence images. This replaces the narrower cover-only contract from the earlier ZIP.

## Authoritative package inputs
- `content/ENV-004_Master_Content_ES.md`: full Spanish editorial specification, five blocks, NB-EL-01..25, EXP-EL-01..10, 50 editorial decisions and 150 options with technical rationale. Treat as SOURCE content, not automatically as validated production schema or final EN translation.
- `assets/ENV-004_Cover_Approved.png`: approved ORIGINAL cover; preserve bytes/pixels and aspect ratio (1672 x 941).
- `config/ENV-004_Hotspots_10_Map.json`: user-approved H01..H10 coordinates and editorial EXP targets.
- `config/ENV-004_Hotspots_10_Spec.md`: hotspots mapping and UX notes.
- `assets/ENV-004_Hotspots_Review_Only.png`: for QA comparison only; never use as production cover.

## Inspect FIRST — before edits
1. Inspect repository status, branch, local changes and existing ENV-001, ENV-002 and most recent completed Environment: metadata, cover paths, hotspot schema, ordering, routing, locale conventions, UI for Notebook/Experience, responsive positioning, accessibility and tests. Never overwrite unrelated edits.
2. Inspect two recent **complete** Experiences (prefer the latest and one electrical/PLC example): actual YAML schema, stages, decisions, correct/incorrect option feedback, asset references, state transitions, locales ES/EN, registration/index, QA tooling. Read Engine contract and validators, **do not modify Engine**.
3. Inspect Notebook canonical model, category/index/navigation, translation handling and linking rules. Determine whether five blocks can be represented as existing Notebook collections or navigation metadata without inventing a third content product.
4. Inspect current design conventions for missing/pending assets: placeholders must be explicit and non-deceptive, not broken images. Determine if Experience is playable without image evidence; if not, implement draft/nonpublished status and report the blocker rather than faking media.
5. Compare editorial identifiers (EXP-EL-01..10, NB-EL-01..25) with existing repository canonical IDs and allocate nonconflicting canonical IDs under existing conventions. The source IDs are editorial references, **not necessarily deployable routes**. Produce a mapping table in final report.

## Implementation work
A. Register ENV-004 in existing Environment catalog with bilingual title and description consistent with existing style, approved cover and ten hotspots; preserve existing image pixels. Reuse existing hotspot overlay UI and map the 10 points to the **real** canonical Experience IDs created below. No 6-hotspot legacy config. Keep coordinates unchanged unless a real visual collision is found; if collision occurs, report and request review instead of silently moving them.
B. Implement the **five theory blocks** as existing Notebook content/navigation, comprising exactly NB-EL-01..25. Transfer the complete explanations, examples, checks and answers from source, not short summaries. Maintain technical SSOT in Notebook; Experiences reference it rather than duplicating chapters. If existing Notebook model cannot support self-check interactions, represent them using the existing static content pattern, preserving question, choices, answer and explanation; no new quiz engine.
C. Implement all **ten** Experiences, not empty shells. For each, preserve scenario, system assumptions, observed values, specific root cause, D1..D5, A/B/C options, correct choice, feedback/rationale for incorrect choices, E1..E4 textual evidence requirements, safe resolution, post-fix verification and Notebook references. This yields **50 editorial decisions and 150 option texts**, unless current Engine's real schema requires an explicitly documented faithful structural adaptation. Never silently discard a decision, option, technical distinction, or feedback. If schema cannot express them faithfully without Engine change, stop the affected EXP and report exact blocker; do not hack Engine or create misleading choices.
D. Produce EN localization for all user-facing strings (ENV, Notebook, 10 EXP, hotspots) as a technical translation of Spanish source. Preserve electrical designations, terminal references, quantities, formulas, units, diagnostic logic and option correctness. Mark translation for human technical review; do not claim it was previously approved.
E. Wire H01→EXP-EL-01 ... H10→EXP-EL-10 by mapping editorial IDs to real IDs; ensure all ten resolve, or remain explicitly disabled/draft under existing behavior if content cannot be published without required evidence. Never link a hotspot to an invented URL.
F. Create a **per-EXP evidence manifest** from E1..E4 in the source: evidence ID, purpose, data values/expected visual, stage/decision, intended file naming/path, safety and validation criteria. The user will provide ~6–7 approved images per EXP later; do not interpret E1..E4 as a mandate to produce only four images, and do not add unapproved visuals. If existing schema requires six/seven asset slots, use legitimate draft/pending metadata only if supported; otherwise maintain manifest separately and defer publication. No broken file references or fabricated measurements.
G. Apply technical content QA: preserve the exact scenario distinctions (e.g. supply voltage collapse at source vs cable voltage drop; motor phase loss vs imbalance; protective earth vs neutral; NO/NC logic). Electrical readings are simulated/previously obtained by authorized staff, not instructions for live intervention. No bypassing safety or protections, no resistance measurement on energized equipment, no megohmmeter connected to electronics. Review editorial risk notes, especially EXP-04 and EXP-10; flag uncertainties rather than inventing regulatory thresholds.

## Invariants / out of scope
- Notebook remains permanent SSOT; Experience Engine remains diagnosis/decisions. No third content product, no Engine/renderer hacks, no global CSS patches, no edits to existing ENV/EXP to accommodate ENV-004.
- Preserve all current routes, asset contracts, locales, accessibility, state semantics, analytics and tests. No marketing copy or visual redesign.
- Do not create the 60–70 later evidence images, wiring diagrams, photos, synthetic meter readings, or pretend assets have been validated. Do not publish incomplete Experiences as production-ready.
- Do not commit, push, merge or deploy without explicit authorization.

## Validation (execute, do not just propose)
1. Run relevant existing lint, typecheck, build, Notebook validators, Experience schema validators, translation consistency checks and automated tests. Add focused tests for ENV-004 counts: 5 theory blocks, 25 Notebook entries, 10 distinct Experiences, 10 hotspots, and source-to-implementation mapping for all 50 decisions / 150 options or documented adaptation.
2. Check that every correct answer is backed by evidence available at that decision; every wrong option has useful feedback; root cause is not revealed prematurely. Check cross-reference integrity and ES/EN parity, all hotspots resolve or explicitly show pending state.
3. Verify cover checksum against package; no production reference to review-only PNG. Inspect desktop and mobile hotspot alignment, image ratio, keyboard/touch and ES/EN switching using browser if available. If unavailable, report visual QA NOT RUN.
4. Verify no missing asset paths or broken media placeholders; verify status correctly reflects assets pending and technical/editorial review.
5. Provide exact command outputs and counts; never claim tests passed if not executed.

## Final report REQUIRED
- Repository branch/status and complete changed file list.
- Reused ENV/Notebook/Experience patterns, and confirmation no Engine change.
- Table of 25 Notebook canonical IDs; five block groupings.
- Table of 10 Experiences with editorial→canonical ID, stage/decision counts, locale status, evidence pending status.
- Table of 10 hotspots with x/y %, resolved destination, active/draft status.
- ES/EN completeness and technical review flags.
- Per-EXP evidence manifest paths and missing asset count (not invented assets).
- Tests performed with pass/fail and visual QA evidence/limitation.
- Explicit remaining blockers and next steps for user-provided assets.
- Explicit confirmation: no commit, push, merge or deployment.

## Execution policy
Work through the entire task in this one implementation pass. Do not ask for intermediate approvals when existing repository patterns resolve the choice. When a critical schema/safety conflict prevents faithful implementation, preserve the source and report the specific blocker rather than guessing. Never treat editorial status as final production approval.
