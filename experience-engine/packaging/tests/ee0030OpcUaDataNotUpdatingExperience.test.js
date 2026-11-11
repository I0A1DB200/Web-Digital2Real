import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0030-opcua-data-not-updating";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0030 validates the OPC UA monitoring diagnostic", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(authoring.metadata.id, "EXP-OPCUA-DATA-030");
  assert.equal(authoring.metadata.editorial_id, "EE-0030");
  assert.match(authoring.private.fault_model.root_cause, /MonitoringMode=Sampling.*Reporting/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 7);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-OPCUA-DATA-030/01-session-status.png",
    "assets/EXP-OPCUA-DATA-030/02-subscription-status.png",
    "assets/EXP-OPCUA-DATA-030/03-monitored-item.png",
    "assets/EXP-OPCUA-DATA-030/04-sampling-publishing.png",
    "assets/EXP-OPCUA-DATA-030/05-data-quality.png",
    "assets/EXP-OPCUA-DATA-030/06-source-timestamps.png",
    "assets/EXP-OPCUA-DATA-030/07-server-source-value.png",
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-SESSION-STATUS", ["ART-001"]],
    ["EVID-02-SUBSCRIPTION-STATUS", ["ART-002"]],
    ["EVID-03-MONITORED-ITEM", ["ART-003"]],
    ["EVID-04-SAMPLING-PUBLISHING", ["ART-004"]],
    ["EVID-05-DATA-QUALITY", ["ART-005"]],
    ["EVID-06-SOURCE-TIMESTAMPS", ["ART-006"]],
    ["EVID-07-SERVER-SOURCE-VALUE", ["ART-007"]],
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, ["ART-007"]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-03-MONITORED-ITEM").content, /Sampling.*Reporting/i);
  assert.match(authoring.public.decisions.find(item => item.id === "DEC-05-CORRECT-AND-VERIFY").action, /Reporting.*DataChangeNotification/i);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [1, 2, 0, 3, 1]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-06-SOURCE-TIMESTAMPS").content, /Timestamp/i);
});

test("EE-0030 localizes and projects without leaking answers", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 6);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 7);
    assert.equal(webArtifact.public.visual.representation, "available");
    assert.equal(webArtifact.public.visual.cover_asset_id, "ART-001");
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Datos OPC UA sin actualizar");
  assert.equal(english.metadata.title, "OPC UA Data Not Updating");
  assert.match(english.public.stages[2].situation, /monitored item|sampling|publishing/i);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0030 keeps the seven supplied originals as exact runtime copies", async () => {
  const runtimeNames = (await readdir(`${directory}/assets`)).sort();
  assert.deepEqual(runtimeNames, [
    "01-session-status.png",
    "02-subscription-status.png",
    "03-monitored-item.png",
    "04-sampling-publishing.png",
    "05-data-quality.png",
    "06-source-timestamps.png",
    "07-server-source-value.png",
  ]);
  const sourceDirectory = `${directory}/media-source/EE-0030_OPCUA_7_evidencias_Codex`;
  const sourceNames = (await readdir(sourceDirectory)).sort();
  assert.deepEqual(sourceNames, [
    "EVID-01-SESSION-STATUS.png",
    "EVID-02-SUBSCRIPTION-STATUS.png",
    "EVID-03-MONITORED-ITEM.png",
    "EVID-04-SAMPLING-PUBLISHING.png",
    "EVID-05-DATA-QUALITY.png",
    "EVID-06-SOURCE-TIMESTAMPS.png",
    "EVID-07-SERVER-SOURCE-VALUE.png",
  ]);
  const pairs = [
    ["01-session-status.png", "EVID-01-SESSION-STATUS.png"],
    ["02-subscription-status.png", "EVID-02-SUBSCRIPTION-STATUS.png"],
    ["03-monitored-item.png", "EVID-03-MONITORED-ITEM.png"],
    ["04-sampling-publishing.png", "EVID-04-SAMPLING-PUBLISHING.png"],
    ["05-data-quality.png", "EVID-05-DATA-QUALITY.png"],
    ["06-source-timestamps.png", "EVID-06-SOURCE-TIMESTAMPS.png"],
    ["07-server-source-value.png", "EVID-07-SERVER-SOURCE-VALUE.png"],
  ];
  for (const [runtimeName, sourceName] of pairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${sourceDirectory}/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});
