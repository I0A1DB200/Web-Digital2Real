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
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /secuencia|condición|¿/i);
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

  const player = new ExperiencePlayer({ experience: web });
  const authority = new Map(web.public.interactions.map(item => [item.action_token, item]));
  const media = [];
  player.start();
  player.continue();
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    media.push(before.media.map(item => item.id));
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const retry = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
    assert.equal(player.selectDecision(retry.id).currentStage.id, before.currentStage.id);
    player.selectDecision(correct.id);
  }
  assert.deepEqual(media, [["ART-001", "ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006"], [], ["ART-007"]]);
  assert.equal(player.getState().evaluationResult.outcome, "RETRY_RECOMMENDED");
});
