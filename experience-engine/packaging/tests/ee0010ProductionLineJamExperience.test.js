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

const directory = new URL("../../../content/experiences/troubleshooting/EE-0010-production-line-stops-after-product-jam/", import.meta.url);
const environmentDirectory = new URL("../../../content/environments/ENV-001-automated-factory/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const sha256 = value => createHash("sha256").update(value).digest("hex").toUpperCase();
const hashes = [
  "3BCDB6299D297121168043D2A4EDD43A525D6D3E7C753225C1CA46344C665229",
  "2493E43DEB01087DD514FC1DDAF76BE5DEB827111E06AAF29156C80452B39F13",
  "B6422D9F1ACEFAA776D67C8AB2E9BE0F6C28CC9113709A854E30B58441F958F7",
  "CED8E98BBEE375F76866BCF623EF7873B66DE17C476B754BAFAC32BB5C6DDB9A",
  "6E24DA63680956DFEF56DADB713A8AAC618F24F5114ACE514F7647FF2B6308B0",
  "5784A1DF1DECAF3F964CB6269FA056386AE771AB00FBBD50CEC044D195C613E9",
  "C9FEC7C361D3466C9785069B0E1ECC3EBAF84BD944605FE11C7713C563ADCE49",
  "7CB7C15E67E89989497D4FABA8CD858A3606BC3854BCF85B33E1633CA62C21FB",
  "D2B01DBA888203FA58254112AD9777609092330481ADE904226E8C76CDC8CCA6"
];

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

test("EE-0010 validates its system-level causal diagnosis and mixed positions", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.id, "EXP-MULTISYSTEM-JAM-010");
  assert.equal(authoring.metadata.editorial_id, "EE-0010");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.equal(authoring.public.stages.length, 7);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.deepEqual(authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]), ["B", "C", "A", "C", "B", "A", "A"]);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 7);
  assert.match(authoring.private.fault_model.root_cause, /residuo.*B3_TransferSensor.*TransferClear FALSE.*T40/is);
});

test("EE-0010 preserves nine frozen assets and complete ES/EN localization", async () => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png", "08.png", "09.png"]);
  assert.deepEqual(await Promise.all(files.map(async name => sha256(await readFile(new URL(`assets/${name}`, directory))))), hashes);
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.decisions.map(decision => decision.id)), english.public.stages.map(item => item.decisions.map(decision => decision.id)));
  assert.equal(english.metadata.title, "Production Line Stops After Product Jam");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /¿|empujador|residuo|secuencia/i);
});

test("EE-0010 projection hides private truth and retries cannot advance", async () => {
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
  player.start();
  player.continue();
  let stages = 0;
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const retry = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
    assert.equal(player.selectDecision(retry.id).currentStage.id, before.currentStage.id);
    player.selectDecision(correct.id);
    stages += 1;
  }
  assert.equal(stages, 7);
});

test("ENV-001 registers EE-0010 tenth and Theory adds one reusable causal section", async () => {
  const environment = parseExperienceYaml(await readFile(new URL("environment.yaml", environmentDirectory), "utf8"));
  const theoryEs = parseExperienceYaml(await readFile(new URL("theory.yaml", environmentDirectory), "utf8"));
  const theoryEn = parseExperienceYaml(await readFile(new URL("locales/theory.en.yaml", environmentDirectory), "utf8"));
  assert.equal(environment.environment.lifecycle, "preview");
  assert.equal(environment.hotspots.length, 10);
  assert.deepEqual(environment.hotspots.at(-1), { experience_editorial_id: "EE-0010", x: 50, y: 53 });
  assert.equal(theoryEs.sections.at(-1).id, "TH-28-SYSTEM-LEVEL-CAUSAL-TROUBLESHOOTING");
  assert.equal(theoryEn.sections.at(-1).id, theoryEs.sections.at(-1).id);
  assert.match(theoryEs.sections.at(-1).body, /causa primaria.*efectos secundarios/is);
  assert.doesNotMatch(theoryEs.sections.at(-1).body, /EE-0010|residuo de B3/i);
});

test("EE-0010 introduces no ID-specific Engine or Frontend logic", async () => {
  const files = [
    new URL("../../normalization/experienceDefinitionNormalizer.js", import.meta.url),
    new URL("../../projection/runtimeToWebArtifactProjector.js", import.meta.url),
    new URL("../../player/experiencePlayer.js", import.meta.url),
    new URL("../../../Frontend/products/experience-engine/components/experienceWorkspace.js", import.meta.url)
  ];
  for (const file of files) assert.equal((await readFile(file, "utf8")).includes("EE-0010"), false);
});
