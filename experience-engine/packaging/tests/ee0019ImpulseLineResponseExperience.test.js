import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { projectRuntimeToWebArtifact } from "../../projection/runtimeToWebArtifactProjector.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { ExperienceV2Contracts } from "../../schemas/experienceV2Contracts.js";

const root = new URL("../../../content/experiences/instrumentation/EE-0019-impulse-line-response/", import.meta.url);
const yaml = async file => parseExperienceYaml(await readFile(new URL(file, root), "utf8"));
const correctIds = [
  "DEC-01-CHECK-REFERENCE", "DEC-02-CHECK-DYNAMIC", "DEC-03-CHECK-MANIFOLD",
  "DEC-04-INSPECT-IMPULSE", "DEC-05-ISOLATE-FLUSH", "DEC-06-VERIFY-RESPONSE"
];
const assetNames = [
  "ART-001-impulse-station.png", "ART-002-incident-response.png", "ART-003-boundary-comparison.png",
  "ART-004-manifold-inspection.png", "ART-005-manifold-restriction.png", "ART-006-authorized-flush.png",
  "ART-007-multipoint-verification.png"
];

async function localized(locale) {
  return resolveExperienceLocalization(await yaml("experience.yaml"), await yaml(`locales/${locale}.yaml`));
}

test("EE-0019 validates, normalizes, projects and packages both languages", async () => {
  const artifacts = [];
  for (const locale of ["es", "en"]) {
    const authored = await localized(locale);
    const validation = validateExperienceDefinition(authored);
    assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
    const normalized = normalizeExperienceDefinition(authored);
    assert.equal(normalized.ok, true, JSON.stringify(normalized.errors));
    assert.equal(validateNormalizedExperience(normalized.value).valid, true);
    const projected = projectRuntimeToWebArtifact(normalized.value);
    assert.equal(validateGeneratedWebArtifact(projected).valid, true);
    assert.deepEqual(packageExperience(authored), projected);
    assert.equal(projected.metadata.language, locale);
    assert.equal(projected.public.stages.length, 6);
    assert.equal(projected.public.interactions.length, 24);
    artifacts.push(projected);
  }
  assert.equal(artifacts[0].metadata.title, "Respuesta lenta por obstrucción en la línea de impulso");
  assert.equal(artifacts[1].metadata.title, "Slow response from a restricted impulse line");
  assert.deepEqual(artifacts[0].public.stages.map(stage => stage.id), artifacts[1].public.stages.map(stage => stage.id));
  for (const artifact of artifacts) {
    const serialized = JSON.stringify(artifact);
    for (const key of ExperienceV2Contracts.webArtifactForbidden)
      assert.equal(serialized.includes(`"${key}":`), false, key);
  }
});

test("EE-0019 follows the pressure path with mixed correct-option positions and reciprocal evidence", async () => {
  const authored = await yaml("experience.yaml");
  const truth = new Map(authored.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.deepEqual(authored.private.decision_logic.filter(item => item.is_correct).map(item => item.decision_id), correctIds);
  assert.equal(authored.private.decision_logic.filter(item => !item.is_correct).length, 18);
  assert.deepEqual(authored.public.stages.map(stage => stage.decision_ids.findIndex(id => truth.get(id))), [1, 0, 3, 2, 1, 3]);
  assert.deepEqual(authored.public.stages.map(stage => stage.media_ids), [["ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], [], ["ART-006"]]);
  assert.deepEqual(authored.public.evidence.map(item => item.media_ids ?? []), [["ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], [], ["ART-006"], ["ART-007"]]);
  for (const evidence of authored.public.evidence)
    assert.deepEqual(evidence.revealed_by, authored.private.decision_logic.filter(item => item.evidence_revealed.includes(evidence.id)).map(item => item.decision_id));
  assert.doesNotMatch(JSON.stringify(authored.public), /Turck|SICK|Type K|termopar/u);
});

test("EE-0019 keeps seven governed PNG assets at the approved dimensions", async () => {
  const names = (await readdir(new URL("assets/", root))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(names, [...assetNames].sort());
  for (const name of assetNames) {
    const bytes = await readFile(new URL(`assets/${name}`, root));
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(bytes.readUInt32BE(16), 1672, name);
    assert.equal(bytes.readUInt32BE(20), 941, name);
    assert.deepEqual(await readFile(new URL(`media/${name}`, root)), bytes);
  }
});

for (const locale of ["es", "en"]) for (const retryAll of [false, true]) {
  test(`EE-0019 ${locale} ${retryAll ? "all wrong options" : "clean path"} preserves retry and multipoint completion`, async () => {
    const artifact = packageExperience(await localized(locale));
    const authority = new Map(artifact.public.interactions.map(item => [item.action_token, item]));
    const player = new ExperiencePlayer({ experience: artifact });
    player.start();
    player.continue();
    for (let index = 0; index < correctIds.length; index += 1) {
      const before = player.getState();
      assert.equal(before.interaction, "stage");
      assert.equal(before.currentStage.id, artifact.public.stages[index].id);
      const correct = before.currentStage.decisions.find(option => authority.get(option.action_token).outcome === "advance");
      const wrong = before.currentStage.decisions.filter(option => authority.get(option.action_token).outcome === "retry");
      if (retryAll) for (const option of wrong) {
        const retry = player.selectDecision(option.id);
        assert.equal(retry.currentStage.id, before.currentStage.id);
        assert.deepEqual(retry.unlockedEvidence, before.unlockedEvidence);
        assert.equal(retry.result, null);
        assert.match(retry.feedback.message, /\S/u);
      }
      const after = player.selectDecision(correct.id);
      assert.equal(after.completionStatus, index === correctIds.length - 1 ? "completed" : "active");
      if (after.interaction === "result") {
        assert.ok(after.result.evidence.length > 0);
        player.continue();
      }
    }
    const completed = player.getState();
    assert.equal(completed.interaction, "completion");
    assert.deepEqual(completed.media.map(item => item.id), ["ART-007"]);
    assert.equal(completed.evaluationResult.outcome, retryAll ? "RETRY_RECOMMENDED" : "PASS");
    assert.equal(completed.decisionHistory.length, retryAll ? 24 : 6);
  });
}
