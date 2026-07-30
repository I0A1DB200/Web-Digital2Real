import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { GeneratedWebArtifactV1Schema } from "../../schemas/generatedWebArtifactV1Schema.js";
import { validateGeneratedWebArtifact } from "../generatedWebArtifactValidator.js";

const validFixtureUrl = new URL("../fixtures/generated-web-artifact-v1-valid.json", import.meta.url);
const leakFixtureUrl = new URL("../fixtures/generated-web-artifact-private-leak.json", import.meta.url);
const authoringFixtureUrl = new URL("../fixtures/experience-definition-v1-valid.json", import.meta.url);
const runtimeFixtureUrl = new URL("../fixtures/normalized-experience-v1-valid.json", import.meta.url);
const legacyFixtureUrl = new URL("../fixtures/experience-definition-legacy.json", import.meta.url);

const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const codes = result => result.incidents.map(incident => incident.code);

test("accepts a valid Generated Web Artifact v1", async () => {
  const artifact = await readJson(validFixtureUrl);
  const result = validateGeneratedWebArtifact(artifact);

  assert.equal(result.valid, true);
  assert.equal(result.compatible, true);
  assert.equal(result.profile, "generated_web_artifact_v1");
  assert.equal(result.web_artifact_version, "1.0.0");
  assert.equal(result.experience_id, "EXP-GENERIC-DIAG-001");
  assert.deepEqual(result.incidents, []);
});

test("requires an independent Web Artifact version", async () => {
  const artifact = await readJson(validFixtureUrl);
  delete artifact.web_artifact_version;

  const result = validateGeneratedWebArtifact(artifact);

  assert.equal(result.valid, false);
  assert.ok(codes(result).includes("WEB_ARTIFACT_VERSION_REQUIRED"));
});

test("rejects unsupported Web Artifact versions explicitly", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.web_artifact_version = "2.0.0";

  const result = validateGeneratedWebArtifact(artifact);

  assert.equal(result.profile, "generated_web_artifact_unsupported");
  assert.ok(codes(result).includes("WEB_ARTIFACT_VERSION_UNSUPPORTED"));
});

test("rejects invalid Experience identifiers and classes", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.identity.id = "EE-0002";
  artifact.identity.class = "challenge";

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(codes(result).includes("EXPERIENCE_ID_INVALID"));
  assert.ok(codes(result).includes("EXPERIENCE_CLASS_INVALID"));
});

test("accepts only the three approved Experience classes", async () => {
  const artifact = await readJson(validFixtureUrl);
  for (const experienceClass of GeneratedWebArtifactV1Schema.enums.experienceClass) {
    artifact.identity.class = experienceClass;
    assert.equal(validateGeneratedWebArtifact(artifact).valid, true);
  }
});

test("rejects duplicate stages and duplicate decisions", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.public.stages.push(clone(artifact.public.stages[0]));

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(codes(result).includes("STAGE_ID_DUPLICATE"));
  assert.ok(codes(result).includes("DECISION_ID_DUPLICATE"));
});

test("rejects unresolved public feedback references", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.public.feedback[0].decision_id = "DEC-MISSING";

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(codes(result).includes("FEEDBACK_DECISION_UNKNOWN"));
});

test("preserves didactic order without sorting input", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.public.stages.reverse();

  const before = artifact.public.stages.map(stage => stage.id);
  validateGeneratedWebArtifact(artifact);

  assert.deepEqual(artifact.public.stages.map(stage => stage.id), before);
});

test("requires the minimum visual boundary", async () => {
  const artifact = await readJson(validFixtureUrl);
  delete artifact.public.visual;

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(result.incidents.some(incident => incident.path === "$.public.visual"));
});

test("rejects Runtime and Authoring contracts as incompatible profiles", async () => {
  const runtime = validateGeneratedWebArtifact(await readJson(runtimeFixtureUrl));
  const authoring = validateGeneratedWebArtifact(await readJson(authoringFixtureUrl));

  assert.equal(runtime.profile, "normalized_runtime_v1");
  assert.deepEqual(codes(runtime), ["RUNTIME_CONTRACT_NOT_WEB_ARTIFACT"]);
  assert.equal(authoring.profile, "authoring_definition_v1");
  assert.deepEqual(codes(authoring), ["AUTHORING_DEFINITION_NOT_WEB_ARTIFACT"]);
});

test("rejects legacy content without adaptation", async () => {
  const result = validateGeneratedWebArtifact(await readJson(legacyFixtureUrl));

  assert.equal(result.profile, "legacy_unadapted");
  assert.deepEqual(codes(result), ["LEGACY_CONTRACT_UNSUPPORTED"]);
});

test("rejects Player State, User Progress and unknown profiles", () => {
  const player = validateGeneratedWebArtifact({ current_stage: "STAGE-01" });
  const progress = validateGeneratedWebArtifact({ user_id: "USER-01", attempts: 2 });
  const unknown = validateGeneratedWebArtifact({ partial: true });

  assert.deepEqual(codes(player), ["PLAYER_STATE_NOT_WEB_ARTIFACT"]);
  assert.deepEqual(codes(progress), ["USER_PROGRESS_NOT_WEB_ARTIFACT"]);
  assert.deepEqual(codes(unknown), ["WEB_ARTIFACT_PROFILE_UNKNOWN"]);
});

test("rejects the deliberate private-leak fixture", async () => {
  const result = validateGeneratedWebArtifact(await readJson(leakFixtureUrl));

  assert.equal(result.valid, false);
  assert.ok(codes(result).includes("PRIVATE_PROPERTY_FORBIDDEN"));
  assert.ok(codes(result).includes("FEEDBACK_NOT_PUBLIC"));
});

test("rejects a private Runtime block anywhere in the artifact", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.public.extension = { private: { diagnosis: "hidden" } };

  const result = validateGeneratedWebArtifact(artifact);
  const paths = result.incidents
    .filter(incident => incident.code === "PRIVATE_PROPERTY_FORBIDDEN")
    .map(incident => incident.path);

  assert.ok(paths.includes("$.public.extension.private"));
  assert.ok(paths.includes("$.public.extension.private.diagnosis"));
});

test("rejects answer, scoring and private feedback leakage", async () => {
  const result = validateGeneratedWebArtifact(await readJson(leakFixtureUrl));
  const paths = result.incidents
    .filter(incident => incident.code === "PRIVATE_PROPERTY_FORBIDDEN")
    .map(incident => incident.path);

  assert.ok(paths.includes("$.public.stages[0].decisions[0].correct_answer"));
  assert.ok(paths.includes("$.public.stages[0].decisions[0].score_effect"));
  assert.ok(paths.includes("$.public.scoring"));
  assert.ok(paths.includes("$.public.feedback[0].rationale"));
  assert.ok(codes(result).includes("FEEDBACK_NOT_PUBLIC"));
});

test("rejects evidence that is not explicitly public", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.public.evidence[0].visibility = "private";

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(codes(result).includes("EVIDENCE_NOT_PUBLIC"));
});

test("allows unknown safe properties without warning, removal, normalization or defaults", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.future_extension = { label: "safe-public-extension" };
  artifact.public.visual.future_renderer = "unselected";
  const before = clone(artifact);

  const result = validateGeneratedWebArtifact(artifact);

  assert.equal(result.valid, true);
  assert.deepEqual(result.incidents, []);
  assert.deepEqual(artifact, before);
});

test("returns a deeply immutable structured Validation Result", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.private = {};

  const result = validateGeneratedWebArtifact(artifact);

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.incidents), true);
  assert.equal(Object.isFrozen(result.incidents[0]), true);
  assert.equal(Object.isFrozen(result.summary), true);
  assert.deepEqual(
    Object.keys(result.incidents[0]),
    ["severity", "code", "path", "message"]
  );
});

test("validation is deterministic and never mutates or freezes input", async () => {
  const artifact = await readJson(leakFixtureUrl);
  const before = clone(artifact);

  const first = validateGeneratedWebArtifact(artifact);
  const second = validateGeneratedWebArtifact(artifact);

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.deepEqual(artifact, before);
  assert.equal(Object.isFrozen(artifact), false);
  assert.equal(Object.isFrozen(artifact.public), false);
});

test("accepts JSON serialization without functions or cycles", async () => {
  const artifact = await readJson(validFixtureUrl);
  const result = validateGeneratedWebArtifact(artifact);

  assert.doesNotThrow(() => JSON.stringify(artifact));
  assert.equal(result.valid, true);
});

test("rejects functions, non-finite values and circular references", async () => {
  const artifact = await readJson(validFixtureUrl);
  artifact.future_function = () => {};
  artifact.metadata.future_number = Number.POSITIVE_INFINITY;
  artifact.public.future_cycle = artifact.public;

  const result = validateGeneratedWebArtifact(artifact);

  assert.ok(codes(result).includes("NON_SERIALIZABLE_VALUE"));
  assert.ok(codes(result).includes("CIRCULAR_REFERENCE"));
});
