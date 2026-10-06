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

const directory = new URL("../../../content/experiences/siemens/EE-0007-sequence-stuck-waiting-for-condition/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const sha256 = value => createHash("sha256").update(value).digest("hex").toUpperCase();
const hashes = [
  "F3BB2B02852213FAE4FF3EA09B1B371B5F727F3431CFE837858E2B36BABB8F92",
  "C1EE969796F6457D5EDA4471E7752E8A79FAE63E9E4B31F4832EBE428354E460",
  "57FF60A5D2585D2117A5BA09873C04917D4B39CED64D9205D2C3B0B6D9307059",
  "CB499F96DA38DA6F5D66519CE55C43FF416D890DBF1F1701C1AA80E5D4EF3D4B",
  "063D096A9D83158EBF24DBAD98C67C03883FD1DDA84C9EBE6AF5F43B67FF3F88",
  "718F46DB268DDFA0A03047208EAF15983DB2613B8CBBA607F91F809F475AC613",
  "0091ED3F4C9B3BD62B5FBFE23BCC670C50D807257FE93D57822B45B17E41415B"
];

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

test("EE-0007 validates its canonical GRAPH diagnosis and mixed positions", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.id, "EXP-GRAPH-SEQUENCE-007");
  assert.equal(authoring.metadata.editorial_id, "EE-0007");
  assert.equal(authoring.public.stages.length, 7);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.deepEqual(authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]), ["C", "D", "B", "A", "C", "B", "D"]);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 7);
  assert.match(authoring.private.fault_model.root_cause, /T40.*PartAtStop_2.*PartAtStop_Sensor.*%I0\.5/);
  assert.match(JSON.stringify(authoring.public), /S40.*T40.*S41/);
});

test("EE-0007 preserves the seven approved frozen assets and full localization", async () => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png"]);
  assert.deepEqual(await Promise.all(files.map(async name => sha256(await readFile(new URL(`assets/${name}`, directory))))), hashes);
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.decisions.map(decision => decision.id)), english.public.stages.map(item => item.decisions.map(decision => decision.id)));
  assert.equal(english.metadata.title, "Sequence stuck waiting for a condition");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /secuencia|condiciÃ³n|Â¿/i);
});

test("EE-0007 projection remains private and player preserves retries and media progression", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const web = await artifact("en");
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(web).valid, true);
  const serialized = JSON.stringify(web);
  for (const forbidden of ["private", "is_correct", "decision_logic", "rationale", "root_cause", "fault_model"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);

  assert.equal(run(web).evaluationResult.outcome, "PASS");
  assert.equal(run(web, true).evaluationResult.outcome, "RETRY_RECOMMENDED");
});

const stageMedia = [["ART-002"], [], [], ["ART-004"], ["ART-005"], ["ART-006"], []];
const evidenceMedia = [[], [], [], ["ART-004"], ["ART-005"], ["ART-006"], ["ART-007"]];
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
 for (let index = 0; index < 7; index++) {
  const before = player.getState();
  assert.equal(before.interaction, "stage");
  assert.deepEqual(before.media.map(m => m.id), stageMedia[index]);
  assert.ok(!before.unlockedEvidence.includes("EVID-07-VERIFICATION"));
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
  assert.equal(after.completionStatus, index === 6 ? "completed" : "active");
  if ([2, 3, 4, 6].includes(index)) {
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
 assert.deepEqual(results, [3, 4, 5, 7]);
 const final = player.getState();
 assert.equal(final.interaction, "completion");
 assert.deepEqual(final.media.map(m => m.id), ["ART-007"]);
 assert.equal(final.evaluationResult.totalDecisions, 7);
 assert.equal(final.evaluationResult.additionalAttempts, allWrong ? 16 : 0);
 assert.equal(final.decisionHistory.length, allWrong ? 23 : 7);
 return final;
}

test("EE-0007 exact authority, initial context, media timing and ES/EN wrong paths", async () => {
 const source = await readYaml("experience.yaml");
 assert.equal(source.public.decisions.length, 23);
 assert.equal(source.private.decision_logic.filter(d => !d.is_correct).length, 16);
 assert.equal(source.public.evidence.length, 7);
 const expected = [[], ["DEC-01-INSPECT-ACTIVE-STEP"], ["DEC-02-INSPECT-T40-CONDITION"], ["DEC-03-VERIFY-BOX-SENSOR"], ["DEC-04-MONITOR-I05-TAG"], ["DEC-05-COMPARE-T40-REFERENCE"], ["DEC-07-CORRECT-T40-VERIFY"]];
 assert.deepEqual(source.public.evidence.map(e => e.revealed_by), expected);
 for (const e of source.public.evidence) assert.deepEqual(e.revealed_by, source.private.decision_logic.filter(d => d.evidence_revealed.includes(e.id)).map(d => d.decision_id));
 assert.deepEqual(source.public.stages.at(-1).evidence_ids, ["EVID-06-MISMATCH"]);
 assert.deepEqual(source.public.stages.map(s => s.media_ids), stageMedia);
 assert.deepEqual(source.public.evidence.map(e => e.media_ids), evidenceMedia);
 const structures = [];
 for (const locale of ["es", "en"]) {
  const web = await artifact(locale);
  assert.deepEqual(web.public.evidence.map(e => [e.id, e.media_ids]), source.public.evidence.slice(1).map(e => [e.id, e.media_ids]));
  assert.deepEqual(web.public.stages.map(s => s.media_ids), stageMedia);
  assert.deepEqual(web.public.completion.media_ids, ["ART-007"]);
  assert.equal(web.public.visual.assets.length, 7);
  assert.ok(web.public.visual.assets.some(a => a.id === "ART-003"));
  const refs = [web.public.visual.cover_asset_id, ...web.public.stages.flatMap(s => s.media_ids), ...web.public.evidence.flatMap(e => e.media_ids), ...web.public.completion.media_ids];
  assert.ok(!refs.includes("ART-003"));
  assert.equal(refs.filter(id => id === "ART-001").length, 1);
  const initial = web.metadata.summary + web.public.scenario.initial_context + web.public.scenario.operational_state + web.public.visual.educational_purpose;
  assert.doesNotMatch(initial, /S40|T40|%I0\.5|PartAtStop|incorrect|TRUE|FALSE/i);
  assert.match(web.public.scenario.initial_context, locale === "es" ? /Producción informa/ : /Production reports/);
  assert.match(web.public.scenario.operational_state, locale === "es" ? /procedimiento autorizado.*movimientos controlados/ : /authorized procedure.*movement controlled/);
  assert.match(web.public.stages[2].situation, locale === "es" ? /movimientos controlados/ : /movement controlled/);
  assert.match(web.public.stages[6].situation, locale === "es" ? /recuperación sigue pendiente/ : /recovery is still pending/);
  assert.match(web.public.evidence.at(-1).content, locale === "es" ? /ciclos representativos sin forcing/ : /representative cycles.*without forcing/i);
  assert.equal(run(web).evaluationResult.outcome, "PASS");
  run(web, true);
  structures.push({ stages: web.public.stages.map(s => [s.id, s.decisions.map(d => [d.id, d.action_token]), s.media_ids]), interactions: web.public.interactions.map(({message, ...i}) => i) });
 }
 assert.deepEqual(structures[0], structures[1]);
});
