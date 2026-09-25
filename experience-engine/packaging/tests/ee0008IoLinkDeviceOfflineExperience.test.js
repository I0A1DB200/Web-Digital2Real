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
  assert.deepEqual(media, [["ART-001", "ART-002"], ["ART-003"], ["ART-004"], [], ["ART-005"], ["ART-006"]]);
  assert.equal(player.getState().evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0008 keeps PROFINET and downstream IO-Link boundaries distinct", async () => {
  const authoring = await readYaml("experience.yaml");
  const publicText = JSON.stringify(authoring.public);
  assert.match(publicText, /S7-1500/);
  assert.match(publicText, /TBEN-L5-8IOL/);
  assert.match(publicText, /BI6U-M12-IOL6X2-H1141/);
  assert.match(publicText, /C0, C1, C2.*C4–C7.*saludables/);
  assert.match(publicText, /PROFINET llega al master.*dispositivo de C3/i);
});
