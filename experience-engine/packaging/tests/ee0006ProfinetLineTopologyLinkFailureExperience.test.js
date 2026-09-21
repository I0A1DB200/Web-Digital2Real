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

const directory = new URL("../../../content/experiences/communications/EE-0006-profinet-line-topology-link-failure/", import.meta.url);
const sourceAssets = new URL("file:///C:/Users/asanc/Downloads/EE-0006-assets/EE-0006-assets/EE-0006-profinet-line-topology-link-failure/assets/");
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

test("EE-0006 validates as V2 with canonical topology truth and mixed correct positions", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.contract_version, "2.0.0");
  assert.equal(authoring.metadata.editorial_id, "EE-0006");
  assert.equal(authoring.public.stages.length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const positions = authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]);
  assert.deepEqual(positions, ["C", "B", "D", "B", "A", "C"]);
  assert.match(authoring.private.fault_model.root_cause, /A2 Turck.*A3 Murr/i);
  assert.match(authoring.private.fault_model.root_cause, /daño físico/i);
  assert.match(JSON.stringify(authoring.public.evidence), /String B.*disponible/i);
});

test("EE-0006 localizes completely and preserves seven frozen assets", async t => {
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
  assert.deepEqual(spanish.public.stages.map(item => item.decisions.map(decision => decision.id)), english.public.stages.map(item => item.decisions.map(decision => decision.id)));
  assert.equal(english.metadata.title, "PROFINET Line Topology / Link Failure");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /alcanzable|disponible|daño físico|¿/i);
});

test("EE-0006 projection hides private truth and preserves explicit retry/advance boundaries", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = await artifact("en");
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of ["private", "is_correct", "decision_logic", "rationale", "root_cause", "fault_model", "diagnostic_model"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);

  const stages = webArtifact.public.stages.map(item => item.id);
  const pass = run(webArtifact);
  const guided = run(webArtifact, stages.slice(0, 2)).state;
  const retry = run(webArtifact, stages.slice(0, 4)).state;
  assert.deepEqual(pass.progression.map(item => item.media), [["ART-001"], ["ART-002"], ["ART-003"], ["ART-004"], ["ART-005", "ART-006"], ["ART-007"]]);
  assert.equal(pass.progression.slice(0, 4).flatMap(item => item.media).includes("ART-006"), false);
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0006 keeps TIA, PRONETA, switch and IO-Link roles technically distinct", async () => {
  const authoring = await readYaml("experience.yaml");
  const text = JSON.stringify(authoring.public);
  assert.match(text, /TIA Portal/);
  assert.match(text, /PRONETA Graphical View/);
  assert.match(text, /switch físico no se presenta como IO Device configurado/);
  assert.match(text, /IO-Link/);
  assert.match(JSON.stringify(authoring.private.decision_logic), /PROFINET\/Ethernet/);
  assert.doesNotMatch(authoring.private.fault_model.root_cause, /IO-Link/i);
});
