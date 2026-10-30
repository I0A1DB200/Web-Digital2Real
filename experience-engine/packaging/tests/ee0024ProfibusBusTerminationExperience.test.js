import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const directory = "content/experiences/communications/EE-0024-profibus-bus-termination-fault";

async function source() {
  return parseExperienceYaml(await readFile(`${directory}/experience.yaml`, "utf8"));
}

async function artifact(locale) {
  const authoring = await source();
  const localized = parseExperienceYaml(await readFile(`${directory}/locales/${locale}.yaml`, "utf8"));
  return packageExperience(resolveExperienceLocalization(authoring, localized));
}

test("EE-0024 validates as a bilingual V2 PROFIBUS termination unit", async () => {
  const authoring = await source();
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(authoring.metadata.editorial_id, "EE-0024");
  assert.match(authoring.private.fault_model.root_cause, /terminaci[oó]n.*extremo.*PROFIBUS/i);
  assert.equal(authoring.public.stages.length, 5);
  assert.equal(authoring.public.evidence.length, 6);
  assert.equal(authoring.public.visual.assets.length, 7);
  const diagnosticEvidence = authoring.public.evidence.find(item => item.id === "EVID-02-BUS-DIAGNOSTIC");
  assert.match(diagnosticEvidence.content, /PROFINET IO or PROFIBUS DP station failure.*16#39CB.*16#38CB.*16#35A1/);
  const diagnosticAsset = authoring.public.visual.assets.find(item => item.id === "ART-002");
  assert.match(diagnosticAsset.alt, /16#39CB.*16#38CB.*16#35A1/);

  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const correctPositions = authoring.public.stages.map(stage =>
    stage.decision_ids.findIndex(decisionId => truth.get(decisionId))
  );
  assert.deepEqual(correctPositions, [0, 1, 2, 0, 1]);
});

test("EE-0024 localizes and projects without leaking diagnostic truth", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  for (const webArtifact of [spanish, english]) {
    assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
    assert.equal(webArtifact.public.stages.length, 5);
    assert.equal(webArtifact.public.evidence.length, 5);
    assert.equal(webArtifact.public.interactions.length, 19);
    assert.equal(webArtifact.public.visual.assets.length, 7);
    assert.doesNotMatch(JSON.stringify(webArtifact), /root_cause|decision_logic|is_correct|rationale|private/);
  }
  assert.equal(spanish.metadata.title, "Fallo de terminación del bus PROFIBUS");
  assert.equal(english.metadata.title, "PROFIBUS Bus Termination Fault");
  assert.match(spanish.public.evidence.find(item => item.id === "EVID-02-BUS-DIAGNOSTIC").content, /PROFINET IO or PROFIBUS DP station failure.*16#39CB.*16#38CB.*16#35A1/);
  assert.match(english.public.evidence.find(item => item.id === "EVID-02-BUS-DIAGNOSTIC").content, /PROFINET IO or PROFIBUS DP station failure.*16#39CB.*16#38CB.*16#35A1/);
  assert.equal(normalizeExperienceDefinition(await source()).ok, true);
});
