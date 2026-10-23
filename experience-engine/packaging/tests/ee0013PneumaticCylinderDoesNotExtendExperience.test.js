import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";

const root = new URL("../../../content/experiences/pneumatics/EE-0013-pneumatic-cylinder-does-not-extend/", import.meta.url);
const yaml = async file => parseExperienceYaml(await readFile(new URL(file, root), "utf8"));

async function localized(locale) {
  return resolveExperienceLocalization(await yaml("experience.yaml"), await yaml(`locales/${locale}.yaml`));
}

test("EE-0013 validates and packages equivalently in ES and EN", async () => {
  const artifacts = [];
  for (const locale of ["es", "en"]) {
    const authored = await localized(locale);
    const validation = validateExperienceDefinition(authored);
    assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
    assert.doesNotMatch(JSON.stringify(authored.public), /6 bar|CPU 1516|%M10|representative cycles|ciclos representativos/u);
    artifacts.push(packageExperience(authored));
  }
  assert.deepEqual(artifacts[0].public.stages.map(stage => stage.id), artifacts[1].public.stages.map(stage => stage.id));
  assert.equal(artifacts[1].metadata.title, "Pneumatic Cylinder Does Not Extend");
  assert.equal(artifacts[0].public.stages.length, 6);
});

test("EE-0013 preserves boundary diagnosis and independent verification", async () => {
  const authored = await yaml("experience.yaml");
  const correct = authored.private.decision_logic.filter(item => item.is_correct);
  assert.deepEqual(correct.map(item => item.decision_id), [
    "DEC-01-INSPECT-PLC", "DEC-02-INSPECT-ACTUATION", "DEC-03-CHECK-SUPPLY",
    "DEC-04-INSPECT-CONNECTION", "DEC-05-RECONNECT", "DEC-06-VERIFY"
  ]);
  assert.deepEqual(authored.public.evidence[5].revealed_by, ["DEC-05-RECONNECT"]);
  assert.match(authored.public.evidence[5].content, /todavía no están verificados/u);
  assert.deepEqual(authored.public.evidence[6].revealed_by, ["DEC-06-VERIFY"]);
  assert.deepEqual(authored.public.completion.media_ids, ["ART-007"]);
  assert.equal(authored.public.decisions.length, 18);
  assert.equal(authored.private.decision_logic.filter(item => !item.is_correct).length, 12);
  for (const evidence of authored.public.evidence) {
    assert.deepEqual(evidence.revealed_by, authored.private.decision_logic
      .filter(item => item.evidence_revealed.includes(evidence.id)).map(item => item.decision_id));
  }
  const correctIds = new Set(correct.map(item => item.decision_id));
  const positions = authored.public.stages.map(stage => stage.decision_ids.findIndex(id => correctIds.has(id)));
  assert.equal(new Set(positions).size, 3);
});

test("EE-0013 reveals the disconnected line only after physical inspection", async () => {
  const authored = await yaml("experience.yaml");
  assert.deepEqual(authored.public.stages.map(stage => stage.media_ids), [
    ["ART-002"], ["ART-003"], [], ["ART-004"], ["ART-005"], ["ART-006"]
  ]);
  assert.deepEqual(authored.public.evidence.map(item => item.media_ids ?? []), [
    [], ["ART-003"], [], ["ART-004"], ["ART-005"], ["ART-006"], ["ART-007"]
  ]);
  const beforeInspection = JSON.stringify(authored.public.stages.slice(0, 4));
  assert.doesNotMatch(beforeInspection, /desconectad|disconnected|ART-005|ART-006|ART-007/iu);
  assert.match(authored.public.stages[4].situation, /desconectada/u);
});

test("EE-0013 resolves seven distinct PNG asset references", async () => {
  const authored = await yaml("experience.yaml");
  const images = [];
  for (const asset of authored.public.visual.assets) {
    assert.match(asset.src, /\.png$/u);
    const prefix = `assets/${authored.metadata.id}/`;
    assert.ok(asset.src.startsWith(prefix));
    const local = asset.src.replace(prefix, "assets/");
    const image = await readFile(new URL(local, root));
    assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    images.push(image);
  }
  assert.equal(images.length, 7);
  assert.equal(new Set(images.map(image => image.toString("base64"))).size, 7);
});

for (const locale of ["es", "en"]) for (const retryAll of [false, true]) {
test(`EE-0013 ${locale} ${retryAll ? "all wrong options" : "clean path"} preserves Results, Continue and verification`, async () => {
  const artifact = packageExperience(await localized(locale));
  const authority = new Map(artifact.public.interactions.map(item => [item.action_token, item]));
  const player = new ExperiencePlayer({ experience: artifact });
  player.start();
  player.continue();
  const resultStages = new Set([0, 2, 3, 4, 5]);
  for (let index = 0; index < 6; index++) {
    const before = player.getState();
    assert.equal(before.interaction, "stage");
    assert.equal(before.completionStatus, "active");
    assert.equal(before.unlockedEvidence.includes("EVID-07-RECOVERY"), false);
    assert.equal(before.media.some(item => item.id === "ART-007"), false);
    if (index < 4) assert.equal(before.unlockedEvidence.includes("EVID-05-DISCONNECTION"), false);
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const wrong = before.currentStage.decisions.filter(item => authority.get(item.action_token).outcome === "retry");
    if (retryAll) for (const option of wrong) {
      const retry = player.selectDecision(option.id);
      assert.equal(retry.currentStage.id, before.currentStage.id);
      for (const key of ["unlockedEvidence", "completionStatus", "progress", "media", "resolvedDecisions"])
        assert.deepEqual(retry[key], before[key]);
      assert.equal(retry.result, null);
      assert.match(retry.feedback.message, /\S/u);
    }
    const after = player.selectDecision(correct.id);
    assert.equal(after.completionStatus, index === 5 ? "completed" : "active");
    assert.deepEqual(after.unlockedEvidence, [...before.unlockedEvidence, ...authority.get(correct.action_token).unlocks]);
    if (resultStages.has(index)) {
      assert.equal(after.interaction, "result");
      const expectedMedia = ["ART-003", null, "ART-004", "ART-005", "ART-006", "ART-007"][index];
      assert.deepEqual(after.result.evidence.flatMap(item => item.media.map(asset => asset.id)), [expectedMedia]);
      const snapshot = JSON.stringify(after);
      const continued = player.continue();
      for (const key of ["attemptsByDecision", "decisionHistory", "unlockedEvidence", "evaluationResult", "completionStatus"])
        assert.deepEqual(continued[key], JSON.parse(snapshot)[key]);
    } else {
      assert.equal(after.interaction, "stage");
    }
  }
  const completed = player.getState();
  assert.equal(completed.interaction, "completion");
  assert.equal(completed.completionStatus, "completed");
  assert.deepEqual(completed.media.map(item => item.id), ["ART-007"]);
  assert.equal(completed.decisionHistory.length, retryAll ? 18 : 6);
});
}
