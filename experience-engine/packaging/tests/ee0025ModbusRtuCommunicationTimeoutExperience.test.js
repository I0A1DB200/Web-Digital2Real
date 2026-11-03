import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0025-modbus-rtu-communication-timeout";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0025 contains only the six supplied runtime assets", async () => {
  const names = (await readdir(`${directory}/assets`)).sort();
  assert.deepEqual(names, [
    "01-installation-context.png",
    "02-plc-diagnostic.png",
    "03-rs485-topology.png",
    "04-client-serial-settings.png",
    "05-server-serial-settings.png",
    "06-recovery-verification.png",
  ]);
  for (const name of names) {
    const bytes = await readFile(`${directory}/assets/${name}`);
    assert.ok(bytes.length > 1000, `${name} should contain a runtime asset`);
  }
  const sourceNames = (await readdir(`${directory}/media-source/EE-0025_assets`)).sort();
  assert.deepEqual(sourceNames, [
    "01_S7-1500_instalacion.png",
    "02_TIA_Portal_diagnostico.png",
    "03_RS485_esquema.png",
    "04_Modbus_cliente_configuracion.png",
    "05_Modbus_servidor_configuracion.png",
    "06_Modbus_traza_comunicacion.png",
  ]);
  const sourcePairs = [
    ["01-installation-context.png", "01_S7-1500_instalacion.png"],
    ["02-plc-diagnostic.png", "02_TIA_Portal_diagnostico.png"],
    ["03-rs485-topology.png", "03_RS485_esquema.png"],
    ["04-client-serial-settings.png", "04_Modbus_cliente_configuracion.png"],
    ["05-server-serial-settings.png", "05_Modbus_servidor_configuracion.png"],
    ["06-recovery-verification.png", "06_Modbus_traza_comunicacion.png"],
  ];
  for (const [runtimeName, sourceName] of sourcePairs) {
    assert.deepEqual(
      await readFile(`${directory}/assets/${runtimeName}`),
      await readFile(`${directory}/media-source/EE-0025_assets/${sourceName}`),
      `${runtimeName} must be an exact copy of ${sourceName}`,
    );
  }
});

test("EE-0025 validates as a bilingual V2 Modbus RTU timeout unit", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(authoring.metadata.id, "EXP-MODBUS-RTU-025");
  assert.equal(authoring.metadata.editorial_id, "EE-0025");
  assert.match(authoring.private.fault_model.root_cause, /paridad.*Even.*Odd/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.visual.assets.length, 6);
  assert.deepEqual(authoring.public.visual.assets.map(item => item.src), [
    "assets/EXP-MODBUS-RTU-025/01-installation-context.png",
    "assets/EXP-MODBUS-RTU-025/02-plc-diagnostic.png",
    "assets/EXP-MODBUS-RTU-025/03-rs485-topology.png",
    "assets/EXP-MODBUS-RTU-025/04-client-serial-settings.png",
    "assets/EXP-MODBUS-RTU-025/05-server-serial-settings.png",
    "assets/EXP-MODBUS-RTU-025/06-recovery-verification.png",
  ]);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-04-PARITY-MISMATCH").content, /Even.*Odd/);
  assert.match(authoring.public.visual.assets.find(item => item.id === "ART-004").alt, /19200.*Even/i);
  assert.match(authoring.public.visual.assets.find(item => item.id === "ART-005").alt, /9600.*Odd/i);

  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [0, 1, 2, 0, 1]);
});

test("EE-0025 localizes and projects without leaking diagnostic truth", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 5);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 6);
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Timeout de comunicación Modbus RTU");
  assert.equal(english.metadata.title, "Modbus RTU Communication Timeout");
  assert.match(spanish.public.evidence.find(item => item.id === "EVID-04-PARITY-MISMATCH").content, /Even.*Odd/);
  assert.match(english.public.evidence.find(item => item.id === "EVID-04-PARITY-MISMATCH").content, /Even.*Odd/);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});
