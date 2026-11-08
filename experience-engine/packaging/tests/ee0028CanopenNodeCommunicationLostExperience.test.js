import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0028-canopen-node-communication-lost";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0028 validates the CANopen heartbeat supervision diagnostic", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(authoring.metadata.id, "EXP-CANOPEN-NODE-028");
  assert.equal(authoring.metadata.editorial_id, "EE-0028");
  assert.match(authoring.private.fault_model.root_cause, /heartbeat.*deshabilitad/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-CANOPEN-NODE-028/01-incident.png",
    "assets/EXP-CANOPEN-NODE-028/02-producer-disabled.png",
    "assets/EXP-CANOPEN-NODE-028/03-consumer-monitoring.png",
    "assets/EXP-CANOPEN-NODE-028/04-can-traffic.png",
    "assets/EXP-CANOPEN-NODE-028/05-sdo-nmt.png",
    "assets/EXP-CANOPEN-NODE-028/06-recovery.png",
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-INCIDENT", ["ART-001"]],
    ["EVID-02-PRODUCER-CONFIG", ["ART-002"]],
    ["EVID-03-CONSUMER-CONFIG", ["ART-003"]],
    ["EVID-04-CAN-FRAMES", ["ART-004"]],
    ["EVID-05-NMT-STATE", ["ART-005"]],
    ["EVID-06-RECOVERY", ["ART-006"]],
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, ["ART-006"]);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [1, 2, 0, 3, 1]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-CAN-FRAMES").content, /otros participantes/i);
});

test("EE-0028 localizes and projects without leaking answers", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 5);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 6);
    assert.equal(webArtifact.public.visual.cover_asset_id, "ART-001");
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Nodo CANopen sin comunicación");
  assert.equal(english.metadata.title, "CANopen Node Communication Lost");
  assert.match(english.public.stages[2].situation, /consumer.*frames|frames.*consumer/i);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0028 keeps the six supplied originals as exact runtime copies", async () => {
  const runtimeNames = (await readdir(`${directory}/assets`)).sort();
  assert.deepEqual(runtimeNames, [
    "01-incident.png",
    "02-producer-disabled.png",
    "03-consumer-monitoring.png",
    "04-can-traffic.png",
    "05-sdo-nmt.png",
    "06-recovery.png",
  ]);
  const sourceNames = (await readdir(`${directory}/media-source/EE-0028_assets`)).sort();
  assert.deepEqual(sourceNames, [
    "EVID-01_Incident.png",
    "EVID-02_Heartbeat_Producer_Disabled.png",
    "EVID-03_Heartbeat_Consumer.png",
    "EVID-04_CAN_Traffic.png",
    "EVID-05_SDO_NMT.png",
    "EVID-06_Recovery.png",
  ]);
  const pairs = [
    ["01-incident.png", "EVID-01_Incident.png"],
    ["02-producer-disabled.png", "EVID-02_Heartbeat_Producer_Disabled.png"],
    ["03-consumer-monitoring.png", "EVID-03_Heartbeat_Consumer.png"],
    ["04-can-traffic.png", "EVID-04_CAN_Traffic.png"],
    ["05-sdo-nmt.png", "EVID-05_SDO_NMT.png"],
    ["06-recovery.png", "EVID-06_Recovery.png"],
  ];
  for (const [runtimeName, sourceName] of pairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${directory}/media-source/EE-0028_assets/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});
