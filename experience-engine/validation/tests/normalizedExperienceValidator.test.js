import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { NormalizedExperienceV1Schema } from "../../schemas/normalizedExperienceV1Schema.js";
import { validateNormalizedExperience } from "../normalizedExperienceValidator.js";

const validFixtureUrl = new URL("../fixtures/normalized-experience-v1-valid.json", import.meta.url);
const incompatibleFixtureUrl = new URL(
  "../fixtures/normalized-experience-incompatible.json",
  import.meta.url
);
const legacyFixtureUrl = new URL("../fixtures/experience-definition-legacy.json", import.meta.url);

const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const codes = result => result.incidents.map(incident => incident.code);

test("accepts a valid Normalized Runtime Contract v1", async () => {
  const runtime = await readJson(validFixtureUrl);
  const result = validateNormalizedExperience(runtime);

  assert.equal(result.valid, true);
  assert.equal(result.compatible, true);
  assert.equal(result.profile, "normalized_runtime_v1");
  assert.equal(result.runtime_contract_version, "1.0.0");
  assert.equal(result.experience_id, "EXP-GENERIC-DIAG-001");
  assert.deepEqual(result.incidents, []);
});

test("requires the independent runtime contract version", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.runtime_contract_version = "3.0.0";

  const result = validateNormalizedExperience(runtime);

  assert.equal(result.valid, false);
  assert.ok(codes(result).includes("RUNTIME_CONTRACT_VERSION_UNSUPPORTED"));
});

test("accepts only approved Experience classes", async () => {
  const runtime = await readJson(validFixtureUrl);
  for (const experienceClass of NormalizedExperienceV1Schema.enums.experienceClass) {
    runtime.identity.class = experienceClass;
    assert.equal(validateNormalizedExperience(runtime).valid, true);
  }

  runtime.identity.class = "challenge";
  assert.ok(codes(validateNormalizedExperience(runtime)).includes("EXPERIENCE_CLASS_INVALID"));
});

test("validates governed Capability references", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.capabilities.push(clone(runtime.capabilities[0]));

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("CAPABILITY_REFERENCE_DUPLICATE"));
});

test("enforces the public and private structural boundary", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.public.diagnosis = clone(runtime.private.diagnosis);
  runtime.private.scenario = clone(runtime.public.scenario);

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("PRIVATE_FIELD_IN_PUBLIC"));
  assert.ok(codes(result).includes("PUBLIC_FIELD_IN_PRIVATE"));
});

test("uses private relations as the sole decision relationship authority", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.private.relations.push(clone(runtime.private.relations[0]));

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("RELATION_DUPLICATE"));
});

test("requires exactly one relation for every public decision", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.private.relations.pop();

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("RELATION_REQUIRED"));
  assert.match(
    result.incidents.find(incident => incident.code === "RELATION_REQUIRED").message,
    /DEC-COMPLETE/
  );
});

test("rejects contradictory stage ownership and unresolved destinations", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.private.relations[0].stage_id = "STAGE-VALIDATE";
  runtime.private.relations[1].destination = "STAGE-MISSING";

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("RELATION_DECISION_STAGE_MISMATCH"));
  assert.ok(codes(result).includes("RELATION_DESTINATION_UNKNOWN"));
});

test("validates evidence and feedback references owned by a relation", async () => {
  const runtime = await readJson(validFixtureUrl);
  runtime.private.relations[0].evidence_revealed = ["EVID-MISSING"];
  runtime.private.relations[0].feedback_id = "FEEDBACK-MISSING";

  const result = validateNormalizedExperience(runtime);

  assert.ok(codes(result).includes("RELATION_EVIDENCE_UNKNOWN"));
  assert.ok(codes(result).includes("RELATION_FEEDBACK_UNKNOWN"));
});

test("requires the minimum runtime visual boundary without selecting a renderer", async () => {
  const runtime = await readJson(validFixtureUrl);
  delete runtime.public.visual;

  const result = validateNormalizedExperience(runtime);

  assert.ok(result.incidents.some(incident => incident.path === "$.public.visual"));
});

test("classifies Authoring Definition v1 as requiring normalization", async () => {
  const authoring = await readJson(incompatibleFixtureUrl);

  const result = validateNormalizedExperience(authoring);

  assert.equal(result.valid, false);
  assert.equal(result.compatible, false);
  assert.equal(result.profile, "authoring_definition_v1");
  assert.deepEqual(codes(result), ["AUTHORING_DEFINITION_REQUIRES_NORMALIZATION"]);
});

test("classifies legacy content explicitly without adapting it", async () => {
  const legacy = await readJson(legacyFixtureUrl);
  const before = JSON.stringify(legacy);

  const result = validateNormalizedExperience(legacy);

  assert.equal(result.profile, "legacy_unadapted");
  assert.deepEqual(codes(result), ["LEGACY_CONTRACT_UNSUPPORTED"]);
  assert.equal(JSON.stringify(legacy), before);
});

test("classifies generated artifacts and Player progress as incompatible", () => {
  const artifact = validateNormalizedExperience({ artifact_format_version: "1.0.0" });
  const progress = validateNormalizedExperience({ current_stage: "STAGE-INCIDENT" });

  assert.equal(artifact.profile, "generated_web_artifact");
  assert.deepEqual(codes(artifact), ["GENERATED_ARTIFACT_NOT_RUNTIME_MODEL"]);
  assert.equal(progress.profile, "player_progress_state");
  assert.deepEqual(codes(progress), ["PLAYER_STATE_NOT_RUNTIME_MODEL"]);
});

test("returns a deeply immutable structured validation result", async () => {
  const runtime = await readJson(validFixtureUrl);
  delete runtime.identity.id;

  const result = validateNormalizedExperience(runtime);

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
  const runtime = await readJson(validFixtureUrl);
  runtime.private.relations[0].destination = "STAGE-MISSING";
  const before = clone(runtime);

  const first = validateNormalizedExperience(runtime);
  const second = validateNormalizedExperience(runtime);

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.deepEqual(runtime, before);
  assert.equal(Object.isFrozen(runtime), false);
  assert.equal(Object.isFrozen(runtime.private), false);
});
