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
  assert.match(authoring.private.fault_model.root_cause, /monitored item.*suscripci[oó]n|suscripci[oó]n.*monitored item/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 7);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "planned");
  assert.deepEqual(authoring.public.visual.assets, []);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-SESSION-STATUS", []],
    ["EVID-02-SUBSCRIPTION-STATUS", []],
    ["EVID-03-MONITORED-ITEM", []],
    ["EVID-04-SAMPLING-PUBLISHING", []],
    ["EVID-05-DATA-QUALITY", []],
    ["EVID-06-SOURCE-TIMESTAMPS", []],
    ["EVID-07-SERVER-SOURCE-VALUE", []],
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, []);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [1, 2, 0, 3, 1]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-06-SOURCE-TIMESTAMPS").content, /timestamps/i);
});

test("EE-0030 localizes and projects without leaking answers", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 6);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 0);
    assert.equal(webArtifact.public.visual.representation, "planned");
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Datos OPC UA sin actualizar");
  assert.equal(english.metadata.title, "OPC UA Data Not Updating");
  assert.match(english.public.stages[2].situation, /monitored item|sampling|publishing/i);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0030 keeps the media contract pending until assets are approved", async () => {
  assert.deepEqual(await readdir(`${directory}/assets`), [".gitkeep"]);
  assert.deepEqual(await readdir(`${directory}/media-source`), ["README.md"]);
});
