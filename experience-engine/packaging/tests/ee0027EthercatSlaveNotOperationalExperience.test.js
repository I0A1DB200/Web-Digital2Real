import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0027-ethercat-slave-not-operational";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0027 validates the EtherCAT slave not operational diagnostic", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(authoring.metadata.id, "EXP-ETHERCAT-SLAVE-027");
  assert.equal(authoring.metadata.editorial_id, "EE-0027");
  assert.match(authoring.private.fault_model.root_cause, /PDO mapping.*no coincide/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-ETHERCAT-SLAVE-027/01-incident.png",
    "assets/EXP-ETHERCAT-SLAVE-027/02-al-diagnostic.png",
    "assets/EXP-ETHERCAT-SLAVE-027/03-expected-pdo.png",
    "assets/EXP-ETHERCAT-SLAVE-027/04-actual-pdo.png",
    "assets/EXP-ETHERCAT-SLAVE-027/05-master-diagnostic.png",
    "assets/EXP-ETHERCAT-SLAVE-027/06-recovery.png",
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-INCIDENT", ["ART-001"]],
    ["EVID-02-AL-DIAGNOSTIC", ["ART-002"]],
    ["EVID-03-EXPECTED-PDO", ["ART-003"]],
    ["EVID-04-ACTUAL-PDO", ["ART-004"]],
    ["EVID-05-MASTER-DIAGNOSTIC", ["ART-005"]],
    ["EVID-06-RECOVERY", ["ART-006"]],
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, ["ART-006"]);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [0, 1, 2, 3, 0]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-ACTUAL-PDO").content, /longitud/i);
});

test("EE-0027 localizes and projects without leaking answers", async () => {
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
  assert.equal(spanish.metadata.title, "Esclavo EtherCAT no operativo");
  assert.equal(english.metadata.title, "EtherCAT Slave Not Operational");
  assert.match(english.public.stages[2].situation, /PDO mapping/i);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0027 keeps the six supplied originals as exact runtime copies", async () => {
  const runtimeNames = (await readdir(`${directory}/assets`)).sort();
  assert.deepEqual(runtimeNames, [
    "01-incident.png",
    "02-al-diagnostic.png",
    "03-expected-pdo.png",
    "04-actual-pdo.png",
    "05-master-diagnostic.png",
    "06-recovery.png",
  ]);
  const sourceNames = (await readdir(`${directory}/media-source/EE-0027_assets`)).sort();
  assert.deepEqual(sourceNames, [
    "ASSET-01_EVID-01-INCIDENT.png",
    "ASSET-02_EVID-02-AL-DIAGNOSTIC.png",
    "ASSET-03_EVID-03-EXPECTED-PDO.png",
    "ASSET-04_EVID-04-ACTUAL-PDO.png",
    "ASSET-05_EVID-05-MASTER-DIAGNOSTIC.png",
    "ASSET-06_EVID-06-RECOVERY.png",
  ]);
  const pairs = [
    ["01-incident.png", "ASSET-01_EVID-01-INCIDENT.png"],
    ["02-al-diagnostic.png", "ASSET-02_EVID-02-AL-DIAGNOSTIC.png"],
    ["03-expected-pdo.png", "ASSET-03_EVID-03-EXPECTED-PDO.png"],
    ["04-actual-pdo.png", "ASSET-04_EVID-04-ACTUAL-PDO.png"],
    ["05-master-diagnostic.png", "ASSET-05_EVID-05-MASTER-DIAGNOSTIC.png"],
    ["06-recovery.png", "ASSET-06_EVID-06-RECOVERY.png"],
  ];
  for (const [runtimeName, sourceName] of pairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${directory}/media-source/EE-0027_assets/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});
