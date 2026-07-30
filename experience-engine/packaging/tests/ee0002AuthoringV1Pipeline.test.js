import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { projectRuntimeToWebArtifact } from "../../projection/runtimeToWebArtifactProjector.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";

const sourceUrl = new URL(
  "../../../content/experiences/siemens/EE-0002-drive-reset/experience.yaml",
  import.meta.url
);
const expectedArtifactUrl = new URL(
  "../fixtures/ee0002-generated-web-artifact-v1.json",
  import.meta.url
);

const readAuthoring = async () => parseExperienceYaml(await readFile(sourceUrl, "utf8"));
const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));

test("EE-0002 is an ordinary valid Authoring Definition v1", async () => {
  const authoring = await readAuthoring();
  const validation = validateExperienceDefinition(authoring);

  assert.equal(validation.valid, true);
  assert.equal(validation.compatible, true);
  assert.equal(validation.profile, "authoring_v1");
  assert.deepEqual(validation.incidents, []);
  assert.deepEqual(authoring.metadata, {
    id: "EXP-SIEMENS-DRIVE-002",
    content_version: "2.0",
    class: "learning",
    status: "technical_review",
    language: "en"
  });
});

test("EE-0002 uses only the six approved canonical Competencies", async () => {
  const authoring = await readAuthoring();

  assert.deepEqual(authoring.capability_references, [
    {
      capability_id: "ICF-01",
      competency_ids: ["COMP-STATE-INTERPRETATION"]
    },
    {
      capability_id: "ICF-03",
      competency_ids: ["COMP-DRIVE-DIAGNOSTICS", "COMP-RESET-REASONING"]
    },
    {
      capability_id: "ICF-05",
      competency_ids: ["COMP-SAFETY-AWARENESS"]
    },
    {
      capability_id: "ICF-11",
      competency_ids: [
        "COMP-EVIDENCE-TROUBLESHOOTING",
        "COMP-CONTROLLED-RECOVERY"
      ]
    }
  ]);
  assert.equal(authoring.public.learning_objectives.length, 6);
});

test("EE-0002 preserves its complete didactic sequence", async () => {
  const authoring = await readAuthoring();

  assert.equal(authoring.public.stages.length, 7);
  assert.equal(authoring.public.decisions.length, 14);
  assert.equal(authoring.public.evidence.length, 12);
  assert.equal(authoring.private.decision_logic.length, 14);
  assert.deepEqual(
    authoring.public.stages.map(stage => stage.id),
    [
      "STAGE-01-INCIDENT",
      "STAGE-02-COMMAND",
      "STAGE-03-DRIVE",
      "STAGE-04-HYPOTHESIS",
      "STAGE-05-RESET",
      "STAGE-06-START",
      "STAGE-07-VALIDATION"
    ]
  );
});

test("EE-0002 keeps public content structurally separate from private diagnosis", async () => {
  const authoring = await readAuthoring();
  const serializedPublic = JSON.stringify(authoring.public);

  assert.equal(serializedPublic.includes(authoring.private.fault_model.root_cause), false);
  assert.equal(Object.hasOwn(authoring.public, "decision_logic"), false);
  assert.equal(Object.hasOwn(authoring.public, "scoring"), false);
  assert.equal(Object.hasOwn(authoring.public, "diagnostic_model"), false);
  assert.equal(authoring.public.visual.representation, "planned");
});

test("EE-0002 normalizes to a valid Runtime v1 without incidents", async () => {
  const normalization = normalizeExperienceDefinition(await readAuthoring());
  const validation = validateNormalizedExperience(normalization.value);

  assert.equal(normalization.ok, true);
  assert.equal(validation.valid, true);
  assert.equal(validation.compatible, true);
  assert.deepEqual(validation.incidents, []);
  assert.equal(normalization.value.public.stages.length, 7);
  assert.equal(normalization.value.private.relations.length, 14);
});

test("EE-0002 projects to a valid Web Artifact without private leakage", async () => {
  const normalization = normalizeExperienceDefinition(await readAuthoring());
  const artifact = projectRuntimeToWebArtifact(normalization.value);
  const validation = validateGeneratedWebArtifact(artifact);
  const serialized = JSON.stringify(artifact);

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.incidents, []);
  assert.equal(Object.hasOwn(artifact, "private"), false);
  [
    "root_cause",
    "scoring",
    "score_effect",
    "safety_effect",
    "correct_answer",
    "rationale",
    "consequence"
  ].forEach(value => assert.equal(serialized.includes(value), false));
});

test("Package 5F produces the exact approved EE-0002 Web Artifact", async () => {
  const authoring = await readAuthoring();
  const expected = await readJson(expectedArtifactUrl);

  assert.deepEqual(packageExperience(authoring), expected);
});

test("EE-0002 packaging is deterministic and never mutates input", async () => {
  const authoring = await readAuthoring();
  const before = clone(authoring);
  const mutableCopy = clone(authoring);

  const first = packageExperience(authoring);
  const second = packageExperience(mutableCopy);

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.deepEqual(authoring, before);
  assert.deepEqual(mutableCopy, before);
  assert.equal(Object.isFrozen(authoring), true);
  assert.equal(Object.isFrozen(mutableCopy), false);
  assert.equal(Object.isFrozen(first), true);
});

test("the v1 pipeline contains no EE-0002-specific treatment or legacy fallback", async () => {
  const files = [
    "../experiencePackagingPipeline.js",
    "../../normalization/experienceDefinitionNormalizer.js",
    "../../projection/runtimeToWebArtifactProjector.js"
  ];
  const sources = await Promise.all(
    files.map(location => readFile(new URL(location, import.meta.url), "utf8"))
  );

  sources.forEach(source => {
    assert.doesNotMatch(source, /EE-0002|EXP-SIEMENS-DRIVE-002/);
    assert.doesNotMatch(source, /experience-engine[/\\]experiences/);
  });
});
