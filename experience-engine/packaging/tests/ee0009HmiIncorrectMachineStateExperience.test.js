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

const directory = new URL("../../../content/experiences/hmi/EE-0009-hmi-incorrect-machine-state/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const sha256 = data => createHash("sha256").update(data).digest("hex").toUpperCase();
const hashes = [
  "366652D522266DE6E07CCAE178D3C94EE9BF2E67CF17E0453BC047E797F0446B",
  "0D455B86DB5EABCB697BD02C378F86733DEFE99F7FC459B89235AEF495B0C762",
  "FEDB2280084EEFBDA621822E3FF49A0811651507C8709A4A577F4608ED825856",
  "97FCBDCFDEF0C145500D2F4EFBE333A2964368C748A7DAACBBDC4C893BADA7A4",
  "B9574552A7BE373844D3F3070705EF675EC04A6DC59A24E5F6185F3CB242C418",
  "EAE4685A2519E8539BF22A60C2C7CCD224948C7577EA75533BA04C70B7A3A545"
];
async function artifact(locale) {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

test("EE-0009 validates HMI mapping truth and six mixed-position decisions", async () => {
  const authoring = await readYaml("experience.yaml");
  const result = validateExperienceDefinition(authoring);
  assert.equal(result.valid, true);
  assert.equal(result.profile, "authoring_v2");
  assert.equal(authoring.metadata.editorial_id, "EE-0009");
  assert.equal(authoring.metadata.id, "EXP-HMI-STATE-009");
  assert.equal(authoring.public.stages.length, 6);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.deepEqual(authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]), ["B", "C", "A", "D", "B", "A"]);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  assert.match(authoring.private.fault_model.root_cause, /BoxAtStop_HMI.*DB_HMI\.BoxAtStop_2.*%DB10\.DBX1\.1.*DB_HMI\.BoxAtStop.*%DB10\.DBX0\.0/);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-CONNECTION-HEALTHY").content, /comunica.*actualizan/);
});

test("EE-0009 retains six frozen assets and complete ES/EN option identity", async () => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png"]);
  assert.deepEqual(await Promise.all(files.map(async file => sha256(await readFile(new URL(`assets/${file}`, directory))))), hashes);
  const es = await artifact("es");
  const en = await artifact("en");
  assert.deepEqual(es.public.stages.map(stage => stage.decisions.map(decision => decision.id)), en.public.stages.map(stage => stage.decisions.map(decision => decision.id)));
  assert.equal(en.metadata.title, "HMI Incorrect Machine State");
  assert.doesNotMatch(en.public.stages.map(stage => stage.situation).join(" "), /¿|condición|pantalla/);
});

test("EE-0009 normalizes, projects privately, retries and advances without premature media", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const web = await artifact("en");
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(web).valid, true);
  const serialized = JSON.stringify(web);
  for (const field of ["private", "is_correct", "decision_logic", "rationale", "root_cause", "fault_model", "diagnostic_model"])
    assert.equal(serialized.includes(`"${field}"`), false, field);
  assert.deepEqual(Object.keys(web.public.evaluation_policy), ["provisional", "outcomes", "mastery_outcomes", "thresholds"]);
  assert.equal(JSON.stringify(web.public.evaluation_policy).includes("score_effect"), false);
  assert.equal(run(web).evaluationResult.outcome, "PASS");
  run(web, true);
});

test("archived photoelectric regression identity no longer collides with HMI EE-0009", async () => {
  const old = parseExperienceYaml(await readFile(new URL("../../../content/experiences/sensors/EE-0009-photoelectric-sensor-misalignment/experience.yaml", import.meta.url), "utf8"));
  const current = await readYaml("experience.yaml");
  assert.equal(old.metadata.editorial_id, "EE-0909");
  assert.equal(old.metadata.id, "EXP-SENSOR-PHOTOELECTRIC-009");
  assert.equal(old.metadata.status, "archived");
  assert.notEqual(old.metadata.editorial_id, current.metadata.editorial_id);
});

const stageMedia = [["ART-002"], [], [], ["ART-004"], ["ART-005"], []];
const evidenceMedia = [[], [], [], ["ART-004"], ["ART-005"], [], ["ART-006"]];
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
  if ([2, 3, 5].includes(index)) {
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
 assert.deepEqual(results, [3, 4, 6]);
 const final = player.getState();
 assert.equal(final.interaction, "completion");
 assert.deepEqual(final.media.map(m => m.id), ["ART-006"]);
 assert.equal(final.evaluationResult.totalDecisions, 6);
 assert.equal(final.evaluationResult.additionalAttempts, allWrong ? 13 : 0);
 assert.equal(final.decisionHistory.length, allWrong ? 19 : 6);
 return final;
}

test("canonical acquisition maps, ES/EN and all wrong options", async () => {
 const source = await readYaml("experience.yaml");
 assert.equal(source.public.decisions.length, 19);
 assert.equal(source.private.decision_logic.filter(d => !d.is_correct).length, 13);
 assert.deepEqual(source.public.evidence.map(e => e.revealed_by), [[], ["DEC-01-VERIFY-BOX-SENSOR"], ["DEC-02-MONITOR-PLC"], ["DEC-03-CHECK-HMI-CONNECTION"], ["DEC-04-INSPECT-TAG"], ["DEC-05-COMPARE-PLC-HMI"], ["DEC-06-MAP-AND-VERIFY"]]);
 for (const e of source.public.evidence) assert.deepEqual(e.revealed_by, source.private.decision_logic.filter(d => d.evidence_revealed.includes(e.id)).map(d => d.decision_id));
 assert.deepEqual(source.public.stages.map(s => s.media_ids), stageMedia);
 assert.deepEqual(source.public.evidence.map(e => e.media_ids), evidenceMedia);
 const structures = [];
 for (const locale of ["es", "en"]) {
  const web = await artifact(locale);
  assert.equal(validateGeneratedWebArtifact(web).valid, true);
  assert.deepEqual(web.public.evidence.map(e => [e.id, e.media_ids]), source.public.evidence.filter(e => e.revealed_by.length).map(e => [e.id, e.media_ids]));
  assert.deepEqual(web.public.stages.map(s => s.media_ids), stageMedia);
  assert.deepEqual(web.public.completion.media_ids, evidenceMedia.at(-1));
  const refs = [web.public.visual.cover_asset_id, ...web.public.stages.flatMap(s => s.media_ids), ...web.public.evidence.flatMap(e => e.media_ids), ...web.public.completion.media_ids];
  for (const id of ["ART-003"]) { assert.ok(web.public.visual.assets.some(a => a.id === id)); assert.ok(!refs.includes(id)); }
  assert.equal(refs.filter(id => id === "ART-001").length, 1);
  for (const index of [0, 5]) assert.match(web.public.stages[index].situation + web.public.stages[index].decisions.map(d => d.action).join(' '), locale === 'es' ? /procedimiento|segur/ : /procedure|safe/);
  assert.equal(run(web).evaluationResult.outcome, 'PASS');run(web,true);
  structures.push({ stages: web.public.stages.map(s => [s.id,s.decisions.map(d=>[d.id,d.action_token]),s.media_ids]), interactions:web.public.interactions.map(({message,...i})=>i) });
 }
 assert.deepEqual(structures[0],structures[1]);
});
