import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL("../../../content/experiences/communications/EE-0008-io-link-device-offline/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const sha256 = value => createHash("sha256").update(value).digest("hex").toUpperCase();
const hashes = [
  "5DA7A69CFDC8F007397AB38524ED224A061D57661B6AB8DBA11E3AE47E7893B4",
  "1567BBC93C9F0FDEEBD4B3702F3748411E9C78870B8AB77062243144A0A9C57D",
  "E7BF75CEEA9F939048D524264DE2DBFF23185D3D7D02CB819D0EC5E990FAB51A",
  "254FFF5EBAE62006F0D6C4651EBC2ED3385962C9C3BCC387CECACD7F21F3996A",
  "3B3A941F59215303E974B0CFDBBB57DC2D82A90AE197730A53DF305F7EC8D337",
  "0CDA28CCA44DFFFEA1D3E0DD05737F8515E1385D981B120EF93DE25C6B066152"
];

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

test("EE-0008 validates its layered IO-Link diagnosis and mixed correct positions", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.id, "EXP-IOLINK-DEVICE-008");
  assert.equal(authoring.metadata.editorial_id, "EE-0008");
  assert.equal(authoring.public.stages.length, 6);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.deepEqual(authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]), ["D", "B", "C", "A", "D", "B"]);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  assert.match(authoring.private.fault_model.root_cause, /M12.*C3.*parcialmente flojo/i);
  assert.match(authoring.private.fault_model.root_cause, /PROFINET permanece saludable/i);
  assert.doesNotMatch(JSON.stringify(authoring), /event code|código de evento|LED rojo|LED verde/i);
});

test("EE-0008 preserves six approved assets and complete ES/EN localization", async () => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png"]);
  assert.deepEqual(await Promise.all(files.map(async name => sha256(await readFile(new URL(`assets/${name}`, directory))))), hashes);
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.decisions.map(decision => decision.id)), english.public.stages.map(item => item.decisions.map(decision => decision.id)));
  assert.equal(english.metadata.title, "IO-Link Device Offline");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /dispositivo|conexión|¿/i);
});

test("EE-0008 projection hides private truth and retries cannot advance", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const web = await artifact("en");
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(web).valid, true);
  const serialized = JSON.stringify(web);
  for (const forbidden of ["private", "is_correct", "decision_logic", "rationale", "root_cause", "fault_model", "diagnostic_model"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);

  assert.equal(run(web).evaluationResult.outcome, "PASS");
  assert.equal(run(web, true).evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0008 keeps PROFINET and downstream IO-Link boundaries distinct", async () => {
  const authoring = await readYaml("experience.yaml");
  const publicText = JSON.stringify(authoring.public);
  assert.match(publicText, /S7-1500/);
  assert.match(publicText, /TBEN-L5-8IOL/);
  assert.match(publicText, /BI6U-M12-IOL6X2-H1141/);
  assert.match(publicText, /C0, C1, C2.*C4–C7/);
  assert.match(publicText, /ruta individual C3.*puerto, cable y dispositivo/i);
});

const stageMedia = [[], [], [], ["ART-004"], [], ["ART-005"]];
const evidenceMedia = [[], [], [], ["ART-004"], [], ["ART-005"], ["ART-006"]];
const snapshot = state => Object.fromEntries(["state", "completionStatus", "progress", "decisionHistory", "attemptsByDecision", "resolvedDecisions", "unlockedEvidence", "evaluationResult"].map(key => [key, state[key]]));

function run(web, allWrong = false) {
 const player = new ExperiencePlayer({ experience: web });
 const authority = new Map(web.public.interactions.map(i => [i.action_token, i]));
 player.start();
 assert.equal(player.getState().visual.cover_asset_id, "ART-001");
 assert.deepEqual(player.getState().unlockedEvidence, []);
 assert.equal(player.getState().decisionHistory.length, 0);
 player.continue();
 const results = [];
 for (let index = 0; index < 6; index++) {
  const before = player.getState();
  assert.equal(before.interaction, "stage");
  assert.deepEqual(before.media.map(m => m.id), stageMedia[index]);
  assert.ok(!before.unlockedEvidence.includes("EVID-07-RECOVERY"));
  assert.equal(before.completionStatus, "active");
  const correct = before.currentStage.decisions.find(d => authority.get(d.action_token).outcome === "advance");
  const wrong = allWrong ? before.currentStage.decisions.filter(d => authority.get(d.action_token).outcome === "retry") : [];
  for (const [attempt, option] of wrong.entries()) {
   const after = player.selectDecision(option.id);
   assert.equal(after.currentStage.id, before.currentStage.id);
   for (const key of ["progress", "unlockedEvidence", "resolvedDecisions", "media", "completionStatus", "evaluationResult"]) assert.deepEqual(after[key], before[key]);
   assert.equal(after.result, null);
   assert.equal(after.attemptsByDecision[before.currentStage.id], attempt + 1);
   assert.match(after.feedback.message, /\S/);
  }
  const after = player.selectDecision(correct.id);
  assert.equal(after.attemptsByDecision[before.currentStage.id], wrong.length + 1);
  assert.deepEqual(after.unlockedEvidence, [...before.unlockedEvidence, ...authority.get(correct.action_token).unlocks]);
  assert.equal(after.completionStatus, index === 5 ? "completed" : "active");
  if ([2, 4, 5].includes(index)) {
   assert.equal(after.interaction, "result");
   results.push(index + 1);
   const acquired = authority.get(correct.action_token).unlocks.map(id => web.public.evidence.find(e => e.id === id));
   assert.deepEqual(after.result.evidence.map(e => [e.id, e.media.map(m => m.id)]), acquired.map(e => [e.id, e.media_ids]));
   assert.deepEqual(snapshot(player.continue()), snapshot(after));
  } else {
   assert.equal(after.interaction, "stage");
   assert.equal(after.result, null);
  }
 }
 assert.deepEqual(results, [3, 5, 6]);
 const final = player.getState();
 assert.equal(final.interaction, "completion");
 assert.deepEqual(final.media.map(m => m.id), ["ART-006"]);
 assert.equal(final.evaluationResult.totalDecisions, 6);
 assert.equal(final.evaluationResult.additionalAttempts, allWrong ? 14 : 0);
 assert.equal(final.decisionHistory.length, allWrong ? 20 : 6);
 return final;
}

test("EE-0008 exact authority, recovery timing, hidden assets and ES/EN traversal", async () => {
 const source = await readYaml("experience.yaml");
 assert.equal(source.public.decisions.length, 20);
 assert.equal(source.private.decision_logic.filter(d => !d.is_correct).length, 14);
 assert.equal(source.public.evidence.length, 7);
 assert.deepEqual(source.public.evidence.map(e => e.revealed_by), [[], ["DEC-01-ESTABLISH-SCOPE"], ["DEC-02-VERIFY-PLC-PN-MASTER"], ["DEC-03-COMPARE-PORTS"], ["DEC-04-DOWNSTREAM-C3"], ["DEC-05-INSPECT-M12"], ["DEC-06-RESTORE-COMPLETE-CHAIN"]]);
 for (const e of source.public.evidence) assert.deepEqual(e.revealed_by, source.private.decision_logic.filter(d => d.evidence_revealed.includes(e.id)).map(d => d.decision_id));
 assert.deepEqual(source.public.stages.at(-1).evidence_ids, ["EVID-06-M12-LOOSE"]);
 assert.deepEqual(source.public.stages.map(s => s.media_ids), stageMedia);
 assert.deepEqual(source.public.evidence.map(e => e.media_ids), evidenceMedia);
 const structures = [];
 for (const locale of ["es", "en"]) {
  const web = await artifact(locale);
  assert.equal(validateGeneratedWebArtifact(web).valid, true);
  assert.deepEqual(web.public.evidence.map(e => [e.id, e.media_ids]), source.public.evidence.slice(1).map(e => [e.id, e.media_ids]));
  assert.deepEqual(web.public.stages.map(s => s.media_ids), stageMedia);
  assert.deepEqual(web.public.completion.media_ids, ["ART-006"]);
  assert.equal(web.public.visual.assets.length, 6);
  const refs = [web.public.visual.cover_asset_id, ...web.public.stages.flatMap(s => s.media_ids), ...web.public.evidence.flatMap(e => e.media_ids), ...web.public.completion.media_ids];
  for (const id of ["ART-002", "ART-003"]) { assert.ok(web.public.visual.assets.some(a => a.id === id)); assert.ok(!refs.includes(id)); }
  assert.equal(refs.filter(id => id === "ART-001").length, 1);
  const initial = web.public.scenario.initial_context + web.public.scenario.operational_state + web.public.scenario.learner_role + web.public.visual.educational_purpose;
  assert.doesNotMatch(initial, /saludable|healthy|operativo|operational|flojo|loose|fallo local|local fault/);
  assert.match(web.public.scenario.operational_state, locale === "es" ? /Quedan por comprobar/ : /remain to be checked/);
  assert.match(web.public.evidence[0].content, locale === "es" ? /define el plan/ : /defines the plan/);
  assert.match(web.public.evidence[3].content, locale === "es" ? /no añade una medición/ : /adds no data measurement/);
  assert.match(web.public.stages[5].situation, locale === "es" ? /recuperación sigue pendiente/ : /recovery is still pending/);
  for (const index of [4, 5]) {
   assert.match(web.public.stages[index].situation, locale === "es" ? /procedimiento seguro de mantenimiento.*movimiento peligroso controlado/ : /safe maintenance procedure.*hazardous movement controlled/);
  }
  const recovery = web.public.evidence.at(-1).content;
  assert.match(recovery, /C3.*PROFINET/);
  assert.match(recovery, locale === "es" ? /ciclos repetidos sin forcing/ : /repeated cycles without forcing/);
  assert.equal(run(web).evaluationResult.outcome, "PASS");
  run(web, true);
  structures.push({ stages: web.public.stages.map(s => [s.id, s.decisions.map(d => [d.id, d.action_token]), s.media_ids]), interactions: web.public.interactions.map(({message, ...i}) => i) });
 }
 assert.deepEqual(structures[0], structures[1]);
});
