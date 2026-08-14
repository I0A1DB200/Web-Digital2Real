import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { ExperienceDefinitionV1Schema } from "../../schemas/experienceDefinitionV1Schema.js";
import { validateExperienceDefinition } from "../experienceDefinitionValidator.js";

const validFixtureUrl = new URL(
  "../fixtures/experience-definition-v1-valid.json",
  import.meta.url
);
const legacyFixtureUrl = new URL(
  "../fixtures/experience-definition-legacy.json",
  import.meta.url
);

const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const codes = result => result.incidents.map(incident => incident.code);

test("accepts a valid Experience Authoring Definition v1", async () => {
  const definition = await readJson(validFixtureUrl);
  const result = validateExperienceDefinition(definition);

  assert.equal(result.valid, true);
  assert.equal(result.compatible, true);
  assert.equal(result.profile, "authoring_v1");
  assert.equal(result.authoring_contract_version, "1.1.0");
  assert.equal(result.definition_id, "EXP-GENERIC-DIAG-001");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test("rejects a missing independent contract version", async () => {
  const definition = await readJson(validFixtureUrl);
  delete definition.contract_version;

  const result = validateExperienceDefinition(definition);

  assert.equal(result.valid, false);
  assert.equal(result.profile, "authoring_v1");
  assert.ok(codes(result).includes("CONTRACT_VERSION_REQUIRED"));
  assert.equal(
    result.incidents.find(item => item.code === "CONTRACT_VERSION_REQUIRED").path,
    "$.contract_version"
  );
});

test("rejects an unsupported contract version", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.contract_version = "2.0.0";

  const result = validateExperienceDefinition(definition);

  assert.equal(result.valid, false);
  assert.ok(codes(result).includes("CONTRACT_VERSION_UNSUPPORTED"));
});

test("rejects an invalid Experience identifier", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.metadata.id = "INVALID-ID";

  const result = validateExperienceDefinition(definition);

  assert.ok(codes(result).includes("EXPERIENCE_ID_INVALID"));
  assert.equal(
    result.incidents.find(item => item.code === "EXPERIENCE_ID_INVALID").path,
    "$.metadata.id"
  );
});

test("requires governed editorial identity and access classification", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.metadata.editorial_id = "EE-1";
  definition.metadata.access = "restricted";

  const result = validateExperienceDefinition(definition);

  assert.ok(codes(result).includes("EXPERIENCE_EDITORIAL_ID_INVALID"));
  assert.ok(codes(result).includes("EXPERIENCE_ACCESS_INVALID"));
});

test("accepts only the three approved Experience classes", async () => {
  const definition = await readJson(validFixtureUrl);

  for (const experienceClass of ExperienceDefinitionV1Schema.enums.experienceClass) {
    definition.metadata.class = experienceClass;
    assert.equal(validateExperienceDefinition(definition).valid, true);
  }

  definition.metadata.class = "challenge";
  const result = validateExperienceDefinition(definition);
  assert.ok(codes(result).includes("EXPERIENCE_CLASS_INVALID"));
});

test("rejects duplicate governed Capability references", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.capability_references.push(clone(definition.capability_references[0]));

  const result = validateExperienceDefinition(definition);

  assert.ok(codes(result).includes("CAPABILITY_REFERENCE_DUPLICATE"));
});

test("rejects known private content under public and known public content under private", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.public.fault_model = clone(definition.private.fault_model);
  definition.private.scenario = clone(definition.public.scenario);

  const result = validateExperienceDefinition(definition);

  assert.ok(codes(result).includes("PRIVATE_FIELD_IN_PUBLIC"));
  assert.ok(codes(result).includes("PUBLIC_FIELD_IN_PRIVATE"));
  assert.equal(
    result.incidents.find(item => item.code === "PRIVATE_FIELD_IN_PUBLIC").path,
    "$.public.fault_model"
  );
});

test("rejects missing required fields with a structured field path", async () => {
  const definition = await readJson(validFixtureUrl);
  delete definition.public.title;

  const result = validateExperienceDefinition(definition);
  const incident = result.incidents.find(item => item.path === "$.public.title");

  assert.equal(result.valid, false);
  assert.equal(incident.severity, "error");
  assert.equal(incident.code, "REQUIRED_FIELD_MISSING");
  assert.match(incident.message, /title/);
});

test("preserves unknown properties without error, warning, removal, normalization or defaults", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.future_extension = { owner: "future-decision" };
  definition.public.future_visual_detail = "not-yet-standardized";
  const before = JSON.stringify(definition);

  const result = validateExperienceDefinition(definition);

  assert.equal(result.valid, true);
  assert.equal(result.incidents.length, 0);
  assert.equal(JSON.stringify(definition), before);
  assert.deepEqual(definition.future_extension, { owner: "future-decision" });
  assert.equal(definition.public.future_visual_detail, "not-yet-standardized");
});

test("rejects scoring fields outside the approved authoring scope", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.private.scoring.dimensions = [
    { id: "UNAPPROVED", weight: 1 }
  ];
  definition.private.scoring.user_result = 100;

  const result = validateExperienceDefinition(definition);
  const outOfScope = result.incidents.filter(
    incident => incident.code === "SCORING_FIELD_OUT_OF_SCOPE"
  );

  assert.equal(outOfScope.length, 2);
  assert.deepEqual(
    outOfScope.map(incident => incident.path),
    ["$.private.scoring.dimensions", "$.private.scoring.user_result"]
  );
});

test("requires the minimum educational visual boundary", async () => {
  const definition = await readJson(validFixtureUrl);
  delete definition.public.visual;

  const result = validateExperienceDefinition(definition);

  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(
    incident => incident.path === "$.public.visual"
      && ["REQUIRED_FIELD_MISSING", "OBJECT_REQUIRED"].includes(incident.code)
  ));
});

test("returns a deeply immutable structured Validation Result", async () => {
  const definition = await readJson(validFixtureUrl);
  delete definition.metadata.id;

  const result = validateExperienceDefinition(definition);

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.errors), true);
  assert.equal(Object.isFrozen(result.incidents), true);
  assert.equal(Object.isFrozen(result.incidents[0]), true);
  assert.equal(Object.isFrozen(result.summary), true);
  assert.deepEqual(
    Object.keys(result.incidents[0]),
    ["severity", "code", "path", "message"]
  );
});

test("classifies legacy content explicitly without adapting it", async () => {
  const legacy = await readJson(legacyFixtureUrl);
  const before = JSON.stringify(legacy);

  const result = validateExperienceDefinition(legacy);

  assert.equal(result.valid, false);
  assert.equal(result.compatible, false);
  assert.equal(result.profile, "legacy_unadapted");
  assert.equal(result.definition_id, "EXP-SIE-PN-001");
  assert.deepEqual(codes(result), ["LEGACY_CONTRACT_UNSUPPORTED"]);
  assert.equal(JSON.stringify(legacy), before);
  assert.equal(Object.hasOwn(legacy, "contract_version"), false);
});

test("validation is deterministic", async () => {
  const definition = await readJson(validFixtureUrl);
  definition.capability_references.push(clone(definition.capability_references[0]));
  definition.private.scoring.result = "not-approved";

  const first = validateExperienceDefinition(definition);
  const second = validateExperienceDefinition(definition);

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("validation never mutates or freezes the input document", async () => {
  const definition = await readJson(validFixtureUrl);
  const before = clone(definition);

  validateExperienceDefinition(definition);

  assert.deepEqual(definition, before);
  assert.equal(Object.isFrozen(definition), false);
  assert.equal(Object.isFrozen(definition.public), false);
  assert.equal(Object.isFrozen(definition.private), false);
});
