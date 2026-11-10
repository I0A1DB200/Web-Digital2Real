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

const directory = "content/experiences/communications/EE-0029-bacnet-device-not-discovered";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0029 validates the BACnet cross-subnet discovery diagnostic", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(authoring.metadata.id, "EXP-BACNET-DEVICE-029");
  assert.equal(authoring.metadata.editorial_id, "EE-0029");
  assert.match(authoring.private.fault_model.root_cause, /broadcast.*descubrimiento/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.decisions.length, 19);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-BACNET-DEVICE-029/01-incident.png",
    "assets/EXP-BACNET-DEVICE-029/02-ip-addressing.png",
    "assets/EXP-BACNET-DEVICE-029/03-subnet-routing.png",
    "assets/EXP-BACNET-DEVICE-029/04-whois-traffic.png",
    "assets/EXP-BACNET-DEVICE-029/05-bbmd-config.png",
    "assets/EXP-BACNET-DEVICE-029/06-recovery.png",
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => [item.id, item.media_ids ?? []]), [
    ["EVID-01-INCIDENT", ["ART-001"]],
    ["EVID-02-IP-ADDRESSING", ["ART-002"]],
    ["EVID-03-SUBNET-ROUTING", ["ART-003"]],
    ["EVID-04-WHOIS-TRAFFIC", ["ART-004"]],
    ["EVID-05-BBMD-CONFIG", ["ART-005"]],
    ["EVID-06-RECOVERY", ["ART-006"]],
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, ["ART-006"]);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [1, 2, 0, 3, 1]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-WHOIS-TRAFFIC").content, /Who-Is|I-Am/i);
});

test("EE-0029 localizes and projects without leaking answers", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 5);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 6);
    assert.equal(webArtifact.public.visual.representation, "available");
    assert.equal(webArtifact.public.visual.cover_asset_id, "ART-001");
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Dispositivo BACnet no descubierto");
  assert.equal(english.metadata.title, "BACnet Device Not Discovered");
  assert.match(english.public.stages[2].situation, /Who-Is|I-Am|subnet/i);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});

test("EE-0029 keeps the six supplied originals as exact runtime copies", async () => {
  assert.deepEqual((await readdir(`${directory}/assets`)).sort(), [
    "01-incident.png",
    "02-ip-addressing.png",
    "03-subnet-routing.png",
    "04-whois-traffic.png",
    "05-bbmd-config.png",
    "06-recovery.png",
  ]);
  assert.deepEqual((await readdir(`${directory}/media-source/EE-0029_assets`)).sort(), [
    "EVID-01-INCIDENT.png",
    "EVID-02-IP-ADDRESSING.png",
    "EVID-03-SUBNET-ROUTING.png",
    "EVID-04-WHOIS-TRAFFIC.png",
    "EVID-05-BBMD-CONFIG.png",
    "EVID-06-RECOVERY.png",
  ]);
  const pairs = [
    ["01-incident.png", "EVID-01-INCIDENT.png"],
    ["02-ip-addressing.png", "EVID-02-IP-ADDRESSING.png"],
    ["03-subnet-routing.png", "EVID-03-SUBNET-ROUTING.png"],
    ["04-whois-traffic.png", "EVID-04-WHOIS-TRAFFIC.png"],
    ["05-bbmd-config.png", "EVID-05-BBMD-CONFIG.png"],
    ["06-recovery.png", "EVID-06-RECOVERY.png"],
  ];
  for (const [runtimeName, sourceName] of pairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${directory}/media-source/EE-0029_assets/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});
