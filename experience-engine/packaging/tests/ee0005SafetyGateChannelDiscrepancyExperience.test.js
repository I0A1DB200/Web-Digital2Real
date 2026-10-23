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

const directory = new URL("../../../content/experiences/safety/EE-0005-safety-gate-channel-discrepancy/", import.meta.url);
const sourceAssets = new URL("file:///C:/Users/asanc/Downloads/EE-0005-assets/EE-0005-safety-gate-channel-discrepancy/assets/");
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const digest = value => createHash("sha256").update(value).digest("hex");
async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}
function diagnosticState(state) {
  return Object.fromEntries(["state", "completionStatus", "progress", "decisionHistory", "attemptsByDecision", "resolvedDecisions", "unlockedEvidence", "evaluationResult"].map(key => [key, state[key]]));
}

function run(webArtifact, retryStages = [], retryAll = false) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authority = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const progression = [], results = [];
  player.start();
  assert.equal(player.getState().visual.cover_asset_id, "ART-001");
  player.continue();
  for (let index = 0; index < 6; index++) {
    const before = player.getState();
    assert.equal(before.interaction, "stage");
    assert.equal(before.unlockedEvidence.includes("EVID-07-RECOVERY"), false);
    assert.equal(before.media.some(item => item.id === "ART-007"), false);
    progression.push({ id: before.currentStage.id, media: before.media.map(item => item.id) });
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const wrong = before.currentStage.decisions.filter(item => authority.get(item.action_token).outcome === "retry");
    const retries = retryAll ? wrong : retryStages.includes(before.currentStage.id) ? wrong.slice(0, 1) : [];
    for (const [attempt, option] of retries.entries()) {
      const after = player.selectDecision(option.id);
      assert.equal(after.currentStage.id, before.currentStage.id);
      for (const key of ["progress", "unlockedEvidence", "resolvedDecisions", "media", "completionStatus", "evaluationResult"])
        assert.deepEqual(after[key], before[key]);
      assert.equal(after.result, null);
      assert.equal(after.attemptsByDecision[before.currentStage.id], attempt + 1);
      assert.equal(after.decisionHistory.length, before.decisionHistory.length + attempt + 1);
      assert.match(after.feedback.message, /\S/);
    }
    const after = player.selectDecision(correct.id);
    assert.equal(after.attemptsByDecision[before.currentStage.id], retries.length + 1);
    assert.deepEqual(after.unlockedEvidence, [...before.unlockedEvidence, ...authority.get(correct.action_token).unlocks]);
    assert.equal(after.completionStatus, index === 5 ? "completed" : "active");
    if ([0, 4].includes(index)) {
      assert.equal(after.interaction, "stage");
      assert.equal(after.currentStage.id, webArtifact.public.stages[index + 1].id);
      assert.equal(after.result, null);
      assert.deepEqual(after.media, []);
    } else {
      assert.equal(after.interaction, "result");
      const evidence = webArtifact.public.evidence[index === 5 ? 4 : index];
      assert.deepEqual(after.result.evidence.map(item => item.id), [evidence.id]);
      assert.deepEqual(after.result.evidence[0].media.map(item => item.id), evidence.media_ids);
      results.push(index + 1);
      assert.deepEqual(diagnosticState(player.continue()), diagnosticState(after));
    }
  }
  assert.deepEqual(results, [2, 3, 4, 6]);
  assert.equal(player.getState().interaction, "completion");
  assert.deepEqual(player.getState().media.map(item => item.id), ["ART-007"]);
  return { state: player.getState(), progression };
}

test("EE-0005 is valid Authoring V2 with one private authority per stage", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.contract_version, "2.0.0");
  assert.equal(authoring.metadata.editorial_id, "EE-0005");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.equal(authoring.public.stages.length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item => item.retry_feedback && item.evidence_revealed.length === 0), true);
  assert.match(authoring.private.fault_model.root_cause, /Desalineación mecánica/i);
  assert.doesNotMatch(authoring.private.fault_model.root_cause, /F-DI.*fallo|fallo.*F-DI/i);
});

test("EE-0005 localizes and preserves all seven frozen assets", async t => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png"]);
  for (const name of files) {
    try {
      assert.equal(digest(await readFile(new URL(`assets/${name}`, directory))), digest(await readFile(new URL(name, sourceAssets))), name);
    } catch (error) {
      if (error.code === "ENOENT") t.diagnostic(`Approved external source unavailable for ${name}; canonical asset still validated.`);
      else throw error;
    }
  }
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.id), english.public.stages.map(item => item.id));
  assert.equal(english.metadata.title, "Restart Inhibited with the Gate Apparently Closed");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /puerta|desalineación|rearme|¿/i);
  assert.doesNotMatch(spanish.public.stages.slice(0, 3).map(item => item.situation).join(" "), /CH1|CH2|desalineación/i);
});

test("EE-0005 projection validates without private truth leakage", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = packageExperience(authoring);
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of ["private", "is_correct", "retry_feedback", "rationale", "fault_model", "diagnostic_model", "root_cause"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);
});

test("EE-0005 retry and evidence boundaries follow explicit relations", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(item => item.id);
  const pass = run(webArtifact);
  const guided = run(webArtifact, stages.slice(0, 2)).state;
  const retry = run(webArtifact, stages.slice(0, 4)).state;
  assert.deepEqual(pass.progression.map(item => item.media), [[], [], ["ART-003"], ["ART-004"], ["ART-005"], []]);
  assert.equal(pass.progression.slice(0, 3).flatMap(item => item.media).includes("ART-004"), false);
  assert.equal(pass.progression.slice(0, 4).flatMap(item => item.media).includes("ART-005"), false);
  assert.equal(pass.progression.slice(0, 5).flatMap(item => item.media).includes("ART-006"), false);
  assert.equal(pass.progression.slice(0, 5).flatMap(item => item.media).includes("ART-007"), false);
  assert.deepEqual(pass.state.media.map(item => item.id), ["ART-007"]);
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0005 exact authority, hidden media, safe acquisition and all fifteen retries in ES/EN", async () => {
 const source = await readYaml("experience.yaml");
 assert.equal(source.public.decisions.length, 21);
 assert.equal(source.private.decision_logic.filter(d => !d.is_correct).length, 15);
 assert.equal(source.public.evidence.length, 7);
 assert.deepEqual(source.public.evidence.slice(0, 2).map(e => e.revealed_by), [[], []]);
 for (const e of source.public.evidence) assert.deepEqual(e.revealed_by, source.private.decision_logic.filter(d => d.evidence_revealed.includes(e.id)).map(d => d.decision_id));
 assert.deepEqual(source.public.evidence.at(-1).revealed_by, ["DEC-06-FUNCTIONAL-TEST"]);
 assert.deepEqual(source.public.stages.at(-1).evidence_ids, []);
 assert.deepEqual(source.public.evidence.map(e => e.media_ids ?? []), [[], [], [], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006", "ART-007"]]);
 const structures = [];
 for (const locale of ["es", "en"]) {
  const web = await artifact(locale);
  assert.deepEqual(web.public.evidence.map(e => e.id), source.public.evidence.slice(2).map(e => e.id));
  assert.ok(web.public.visual.assets.some(a => a.id === "ART-002"));
  assert.equal(web.public.visual.assets.length, 7);
  const refs = [...web.public.stages.flatMap(s => s.media_ids ?? []), ...web.public.evidence.flatMap(e => e.media_ids ?? []), ...web.public.completion.media_ids];
  assert.ok(!refs.includes("ART-002"));
  assert.doesNotMatch(web.metadata.title + web.metadata.summary + web.public.visual.educational_purpose, /discrep|CH1|CH2|mecán|mechanical|misalign|desaline/i);
  assert.match(web.public.scenario.operational_state, /SafetyReady.*FALSE.*STO/);
  assert.doesNotMatch(web.public.stages.at(-1).situation, /TRUE/);
  for (const stage of web.public.stages) {
   const d = stage.decisions.find(d => web.public.interactions.find(i => i.action_token === d.action_token).outcome === "advance");
   assert.match(d.action, locale === "es" ? /segura|aislamiento y mantenimiento/ : /safe|isolation and maintenance/);
  }
  const { state, progression } = run(web, [], true);
  assert.deepEqual(progression.map(s => s.media), [[], [], ["ART-003"], ["ART-004"], ["ART-005"], []]);
  assert.equal(state.evaluationResult.totalDecisions, 6);
  assert.equal(state.evaluationResult.additionalAttempts, 15);
  assert.equal(state.decisionHistory.length, 21);
  structures.push({ interactions: web.public.interactions.map(({message, ...i}) => i), stages: web.public.stages.map(s => [s.id, s.decisions.map(d => [d.id, d.action_token]), s.media_ids]) });
 }
 assert.deepEqual(structures[0], structures[1]);
});
