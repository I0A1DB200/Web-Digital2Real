# CODEX IMPLEMENTATION CONTRACT — EE-0031 / ENV-004 / SIX APPROVED VISUAL ASSETS

## Goal and scope
Integrate the six attached, user-approved visual evidence images into the **existing** Engineering Experience EE-0031 (the 24 VDC supply drops when the valves are activated) in the Digital2Real repository. This is a **CONTENT / MEDIA BINDING** task, not a renderer redesign. Preserve Notebook SSOT, all existing experiences, experience logic, localization and architecture. The user approved the visuals, NOT their engineering correctness. Do not claim technical approval or silently resolve technical contradictions.

## Repository inspection (mandatory before edits)
1. Inspect AGENTS.md, project engineering/asset standards, the current ENV-004 and EE-0031 definitions, Experience Engine schema, existing media manifest conventions, media resolution/paths, locale support, media stage/decision visibility, and QA tests.
2. Confirm the canonical ID: the public Experience is EE-0031, and any internal `EXP-EL-01` mapping is verified rather than assumed. Do not create a duplicate experience.
3. Locate a previously completed six-image Experience and use its existing naming, alt-text, licensing, and evidence binding conventions. Respect the actual schema. Classify issues ENGINE/CONTENT/INTENTIONAL REUSE/UNUSED/technical debt.
4. Inventory existing EE-0031 assets and references. Do not overwrite unrelated media. Identify the six corresponding evidence slots and existing decision sequence before changing it.

## Inputs
`ASSET_MANIFEST.json` is the canonical six-file inventory, including SHA256 hashes. Images are under `assets/`. Copy the images byte-for-byte, retaining their exact composition, no image regeneration, no cropping of labels, no added overlay or drawing frame. The asset descriptions below are editorial guidance; use actual experience stage/decision contracts.

| Asset | Purpose | Learner observation | Suggested timing (adapt to actual EE) |
| --- | --- | --- | --- |
| 01 | 2D cabinet layout | Identify PS1, A1 S7-1200, A2 ET 200SP, F1/F2, X1 | Initial situation / orientation |
| 02 | Electrical schematic | Trace 230 VAC to PS1, protected 24 VDC branches, PLC, remote IO, field terminal and YV1/YV2 | Electrical tracing decision |
| 03 | TIA V17 diagnostic buffer | Simulated supply / PROFINET station loss and recovery | After diagnostic buffer inspection |
| 04 | Watch table + voltage measurement | FALSE commands / 24.21 V vs TRUE commands / 17.82 V | Voltage diagnostic decision |
| 05 | Watch table + DC current clamp | FALSE / 0.42 A vs TRUE / 3.68 A | Current-demand hypothesis decision |
| 06 | Before/after verification | 5 A PSU at 17.82 V vs 10 A PSU at 24.21 V, both with TRUE commands, 3.68 A shown | Recovery verification only, never shown before resolution |

## Technical QA gate — blockers and cautions
- Asset 01/02 visual approval does not validate actual electrical topology. Asset 02 is a **multifilar-style functional schematic**, despite prior shorthand 'unifilar'; do not label it as a certified one-line diagram or installation wiring document. Review physical terminals, output supply, solenoid return paths, F1/F2 and Q1/F0 ratings and protection coordination. No fabricated device terminal assignments.
- Asset 03 is a **simulated TIA Portal diagnostic view**, not a real Siemens screenshot. `16# 02:400C` and literal 'Supply voltage missing' are NOT validated against the selected CPU, ET 200SP IM and module firmware; check official documentation before treating these as real diagnostic codes. If unverified, preserve image as explicitly simulated scenario evidence and do not cite event ID as authoritative in content. A PLC need not log an exact voltage measurement or a reboot when only remote IO resets.
- Asset 04 simulated values: 24.21 V (idle), 17.82 V (commanded); TIA watch table monitors booleans, while voltage is read by an external meter, not the PLC. `%Q0.0`, `%Q0.1`, `%M10.0` are illustrative and may not match real ET 200SP outputs. Check consistency with scenario tags; do not imply physical mapping is verified.
- Asset 05: 0.42 A idle, 3.68 A during command. **3.68 A < 5 A**. This is NOT evidence of a 5 A PSU overload. A hypothesized 6.7 A transient is NOT demonstrated by this image; never claim it was measured. DC clamp must enclose one conductor only; visual probe setup is illustrative.
- Asset 06 depicts replacement with a 10 A PSU and stable 24.21 V. This is a **proposed/simulated recovery**, not a proven causal diagnosis. A change in rated capacity does not establish that the original 5 A supply was undersized. Ensure current, transient, thermal derating, voltage drop and protection hypotheses are distinguished; do not declare the root cause technically proven until supporting evidence exists.
- Safety: all energized measurements are scenario simulations or performed by authorized personnel under safe procedures. Never recommend bypassing protections or working live without controls.

## Implementation
1. Place six files in the repository's canonical EE-0031 media directory using the repo's conventions. Verify SHA256 after copy.
2. Bind all six through the existing media manifest / YAML / JSON and existing Experience Engine media fields. Use native lazy-loading/responsive image conventions and localized accessible descriptions where supported. Avoid broken media IDs and duplicate definitions.
3. Preserve all current decisions, answers, feedback, navigation, Notebook links, hotspots and stage gating. Reveal Asset 06 only at verification/recovery; do not reveal the solution early. If schema supports only 4 evidence slots or a different media lifecycle, **stop and report the mismatch**; do not hack the renderer or silently truncate assets.
4. Keep Notebook as the SSOT for reusable electrical theory. Only contextual observations in EE-0031. Respect ES/EN locale behavior; do not introduce unreviewed translations or UI strings.
5. Do not add banners, PDF frames, logos or metadata to Assets 03–06. Preserve the exact user-approved imagery.
6. If a contradiction cannot be resolved without altering the approved images or changing the diagnosis, retain the files as staged/draft and mark publication blocked. Ask for engineering signoff; do not quietly rewrite the narrative to justify them.

## Validation
- Confirm manifest integrity, all image paths load, expected MIME/dimensions, no broken references, correct alt texts and no duplicate IDs.
- Test EE-0031 navigation and decision progression, evidence visibility timing, recovery gating, both locales, Notebook links and ENV-004 navigation. Run project test/lint/build and browser/screenshot tests where available.
- Perform manual visual QA desktop/mobile for legibility of the Watch Table, instruments, terminal designations and cropped edges. If browser tools unavailable, report NOT RUN, not PASS.
- Check that no unrelated Experience or Engine behavior changed.

## Delivery report
List: actual files changed, media mapping per stage/decision, SHA256 verification, all executed test commands and results, screenshots if produced, technical issues **OPEN / VERIFIED / BLOCKING**, and whether EE-0031 is publishable. Clearly distinguish visual acceptance from engineering acceptance. **No commit, push, merge or deploy without explicit user approval.**
