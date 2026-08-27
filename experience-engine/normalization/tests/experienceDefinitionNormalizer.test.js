import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  normalizeExperienceDefinition
} from "../experienceDefinitionNormalizer.js";
import {
  validateNormalizedExperience
} from "../../validation/normalizedExperienceValidator.js";

const authoringFixtureUrl = new URL(
  "../../validation/fixtures/experience-definition-v1-valid.json",
  import.meta.url
);
const runtimeFixtureUrl = new URL(
  "../fixtures/normalized-experience-from-authoring-v1.json",
  import.meta.url
);
const legacyFixtureUrl = new URL(
  "../../validation/fixtures/experience-definition-legacy.json",
  import.meta.url
);
const runtimeInputUrl = new URL(
  "../../validation/fixtures/normalized-experience-v1-valid.json",
  import.meta.url
);
const readJson = async url => JSON.parse(await readFile(url, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const codes = result => result.errors.map(error => error.code);

test("normalizes a valid Authoring Definition v1 into an exact Runtime v1 value", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const expected = await readJson(runtimeFixtureUrl);

  const result = normalizeExperienceDefinition(authoring);

  assert.equal(result.ok, true);
  assert.equal(result.inputProfile, "authoring_v1");
  assert.equal(result.outputProfile, "normalized_runtime_v1");
  assert.deepEqual(result.value, expected);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test("validates the generated Runtime Contract without warnings or errors", async () => {
  const result = normalizeExperienceDefinition(await readJson(authoringFixtureUrl));
  const validation = validateNormalizedExperience(result.value);

  assert.equal(validation.valid, true);
  assert.equal(validation.compatible, true);
  assert.deepEqual(validation.incidents, []);
});

test("returns structured Authoring validation incidents and no value", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  delete authoring.public.title;

  const result = normalizeExperienceDefinition(authoring);

  assert.equal(result.ok, false);
  assert.equal(result.inputProfile, "authoring_v1");
  assert.equal(result.outputProfile, null);
  assert.equal(Object.hasOwn(result, "value"), false);
  assert.ok(result.errors.some(error => error.path === "$.public.title"));
});

test("rejects an unsupported Authoring contract version", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  authoring.contract_version = "3.0.0";

  const result = normalizeExperienceDefinition(authoring);

  assert.equal(result.ok, false);
  assert.ok(codes(result).includes("CONTRACT_VERSION_UNSUPPORTED"));
});

test("rejects legacy content without adapting it", async () => {
  const legacy = await readJson(legacyFixtureUrl);

  const legacyResult = normalizeExperienceDefinition(legacy);

  assert.equal(legacyResult.inputProfile, "legacy_unadapted");
  assert.deepEqual(codes(legacyResult), ["LEGACY_CONTRACT_UNSUPPORTED"]);
});

test("rejects Runtime, Generated Artifact, Player state and unknown inputs", async () => {
  const runtime = await readJson(runtimeInputUrl);
  const cases = [
    [runtime, "normalized_runtime_v1", "RUNTIME_INPUT_NOT_AUTHORING"],
    [{ artifact_format_version: "1.0.0" }, "generated_web_artifact", "GENERATED_ARTIFACT_NOT_AUTHORING"],
    [{ current_stage: "STAGE-01" }, "player_progress_state", "PLAYER_STATE_NOT_AUTHORING"],
    [{ partial: true }, "unknown", "AUTHORING_PROFILE_UNKNOWN"]
  ];

  for (const [input, profile, code] of cases) {
    const result = normalizeExperienceDefinition(input);
    assert.equal(result.ok, false);
    assert.equal(result.inputProfile, profile);
    assert.deepEqual(codes(result), [code]);
    assert.equal(Object.hasOwn(result, "value"), false);
  }
});

test("rejects contradictory authoring evidence reveal relationships", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  authoring.public.evidence[1].revealed_by = ["DEC-COMPLETE"];

  const result = normalizeExperienceDefinition(authoring);

  assert.equal(result.ok, false);
  assert.deepEqual(codes(result), ["EVIDENCE_REVEAL_CONTRADICTION"]);
  assert.equal(result.errors[0].path, "$.public.evidence[1].revealed_by");
});

test("normalizes each public decision to one authoritative private relation", async () => {
  const result = normalizeExperienceDefinition(await readJson(authoringFixtureUrl));

  assert.deepEqual(
    result.value.private.relations.map(relation => [
      relation.stage_id,
      relation.decision_id,
      relation.destination,
      relation.feedback_id
    ]),
    [
      ["STAGE-INCIDENT", "DEC-INSPECT", "STAGE-VALIDATE", "DEC-INSPECT"],
      ["STAGE-VALIDATE", "DEC-COMPLETE", "COMPLETE", "DEC-COMPLETE"]
    ]
  );
});

test("normalizes Capability references without resolving or duplicating metadata", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const result = normalizeExperienceDefinition(authoring);

  assert.deepEqual(result.value.capabilities, authoring.capability_references);
  assert.deepEqual(
    Object.keys(result.value.capabilities[0]),
    ["capability_id", "competency_ids"]
  );
});

test("prepares private scoring without calculating session results", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const result = normalizeExperienceDefinition(authoring);

  assert.deepEqual(result.value.private.scoring, authoring.private.scoring);
  assert.equal(Object.hasOwn(result.value.private.scoring, "score"), false);
  assert.equal(Object.hasOwn(result.value.private.scoring, "result"), false);
  assert.equal(Object.hasOwn(result.value.private.scoring, "attempts"), false);
});

test("normalizes only the approved minimum visual boundary", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  authoring.public.visual.future_renderer = "not-runtime";

  const result = normalizeExperienceDefinition(authoring);

  assert.deepEqual(result.value.public.visual, {
    educational_purpose: authoring.public.visual.educational_purpose,
    representation: authoring.public.visual.representation
  });
});

test("does not leak private or discarded editorial content into runtime public", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  authoring.private.future_secret = "private";
  authoring.public.future_editorial = "editorial";

  const result = normalizeExperienceDefinition(authoring);
  const serializedPublic = JSON.stringify(result.value.public);

  assert.equal(serializedPublic.includes(authoring.private.fault_model.root_cause), false);
  assert.equal(serializedPublic.includes("private"), false);
  assert.equal(Object.hasOwn(result.value, "classification"), false);
  assert.equal(Object.hasOwn(result.value.public, "learning_objectives"), false);
  assert.equal(Object.hasOwn(result.value.private, "technical_validation"), false);
  assert.equal(Object.hasOwn(result.value.private, "diagnostic_model"), false);
});

test("preserves semantic array order", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  authoring.public.stages.reverse();
  authoring.public.stages.forEach(stage => stage.decision_ids.reverse());
  authoring.public.evidence.reverse();
  authoring.private.decision_logic.reverse();

  const result = normalizeExperienceDefinition(authoring);

  assert.deepEqual(
    result.value.public.stages.map(stage => stage.id),
    authoring.public.stages.map(stage => stage.id)
  );
  assert.deepEqual(
    result.value.public.evidence.map(evidence => evidence.id),
    authoring.public.evidence.map(evidence => evidence.id)
  );
  assert.deepEqual(
    result.value.private.relations.map(relation => relation.decision_id),
    authoring.private.decision_logic.map(logic => logic.decision_id)
  );
});

test("is independent from non-semantic object property order", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const reordered = Object.fromEntries(Object.entries(authoring).reverse());
  reordered.metadata = Object.fromEntries(Object.entries(authoring.metadata).reverse());
  reordered.public = Object.fromEntries(Object.entries(authoring.public).reverse());
  reordered.private = Object.fromEntries(Object.entries(authoring.private).reverse());

  assert.deepEqual(
    normalizeExperienceDefinition(reordered),
    normalizeExperienceDefinition(authoring)
  );
});

test("is deterministic, non-mutating and returns deeply immutable results", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const before = clone(authoring);

  const first = normalizeExperienceDefinition(authoring);
  const second = normalizeExperienceDefinition(clone(authoring));

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.deepEqual(authoring, before);
  assert.equal(Object.isFrozen(authoring), false);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.value), true);
  assert.equal(Object.isFrozen(first.value.private.relations), true);
  assert.equal(Object.isFrozen(first.errors), true);
});
