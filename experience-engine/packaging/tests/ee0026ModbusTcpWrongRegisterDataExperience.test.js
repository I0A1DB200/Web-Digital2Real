import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0026-modbus-tcp-wrong-register-data";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0026 validates the Modbus TCP wrong-register-data diagnostic", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(authoring.metadata.id, "EXP-MODBUS-TCP-026");
  assert.equal(authoring.metadata.editorial_id, "EE-0026");
  assert.match(authoring.private.fault_model.root_cause, /bajo-alto.*alto-bajo/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-MODBUS-TCP-026/01-installation-context.png",
    "assets/EXP-MODBUS-TCP-026/02-wrong-pressure.png",
    "assets/EXP-MODBUS-TCP-026/03-wireshark-fc03.png",
    "assets/EXP-MODBUS-TCP-026/04-modscan-registers.png",
    "assets/EXP-MODBUS-TCP-026/05-recovery-value.png",
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-INCIDENT", ["ART-001", "ART-002"]],
    ["EVID-02-VALID-RESPONSE", ["ART-003"]],
    ["EVID-03-REGISTER-MAP", []],
    ["EVID-04-RAW-WORDS", ["ART-004"]],
    ["EVID-05-CONVERSION-BLOCK", []],
    ["EVID-06-RECOVERY", ["ART-005"]],
  ]);
  assert.equal(authoring.public.completion.media_ids.at(-1), "ART-005");

  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [0, 1, 2, 3, 0]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-RAW-WORDS").content, /41C80000.*25\.0/);
});

test("EE-0026 localizes and projects questions without leaking answers", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 5);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 5);
    assert.equal(webArtifact.public.visual.cover_asset_id, "ART-001");
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Dato incorrecto en registros Modbus TCP");
  assert.equal(english.metadata.title, "Modbus TCP Wrong Register Data");
  assert.match(english.public.stages[2].situation, /0x41C8/);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0026 keeps the five supplied originals as exact runtime copies", async () => {
  const runtimeNames = (await readdir(`${directory}/assets`)).sort();
  assert.deepEqual(runtimeNames, [
    "01-installation-context.png",
    "02-wrong-pressure.png",
    "03-wireshark-fc03.png",
    "04-modscan-registers.png",
    "05-recovery-value.png",
  ]);
  const sourceNames = (await readdir(`${directory}/media-source/EE-0026_assets`)).sort();
  assert.deepEqual(sourceNames, [
    "ASSET-01_S7-1500_original.png",
    "ASSET-02_TIA_MB_CLIENT.png",
    "ASSET-03_Wireshark_FC03.png",
    "ASSET-04_ModScan64.png",
    "ASSET-05_Diagnosis_TIA_ModScan.png",
  ]);
  const pairs = [
    ["01-installation-context.png", "ASSET-01_S7-1500_original.png"],
    ["02-wrong-pressure.png", "ASSET-02_TIA_MB_CLIENT.png"],
    ["03-wireshark-fc03.png", "ASSET-03_Wireshark_FC03.png"],
    ["04-modscan-registers.png", "ASSET-04_ModScan64.png"],
    ["05-recovery-value.png", "ASSET-05_Diagnosis_TIA_ModScan.png"],
  ];
  for (const [runtimeName, sourceName] of pairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${directory}/media-source/EE-0026_assets/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});
