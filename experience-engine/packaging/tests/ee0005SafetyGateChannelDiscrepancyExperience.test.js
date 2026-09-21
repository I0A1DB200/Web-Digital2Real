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
function run(webArtifact, retryStages = []) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authority = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const retries = new Set(retryStages);
  const progression = [];
  player.start();
  player.continue();
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    progression.push({ id: before.currentStage.id, media: before.media.map(item => item.id) });
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const incorrect = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
    if (retries.has(before.currentStage.id)) {
      const after = player.selectDecision(incorrect.id);
      assert.equal(after.currentStage.id, before.currentStage.id);
      assert.deepEqual(after.unlockedEvidence, before.unlockedEvidence);
    }
    player.selectDecision(correct.id);
  }
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
  assert.equal(english.metadata.title, "Safety Gate Channel Discrepancy");
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
  assert.deepEqual(pass.progression.map(item => item.media), [["ART-001"], ["ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006", "ART-007"]]);
  assert.equal(pass.progression.slice(0, 3).flatMap(item => item.media).includes("ART-004"), false);
  assert.equal(pass.progression.slice(0, 4).flatMap(item => item.media).includes("ART-005"), false);
  assert.equal(pass.progression.slice(0, 5).flatMap(item => item.media).includes("ART-006"), false);
  assert.equal(pass.progression.slice(0, 5).flatMap(item => item.media).includes("ART-007"), false);
  assert.deepEqual(pass.state.media.map(item => item.id), ["ART-006", "ART-007"]);
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
});
