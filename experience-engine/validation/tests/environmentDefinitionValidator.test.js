import assert from "node:assert/strict";
import test from "node:test";

import { validateEnvironmentDefinition } from "../environmentDefinitionValidator.js";

const draft = () => ({
  environment: {
    id: "ENV-001",
    slug: "automated-factory",
    lifecycle: "draft",
    version: "1.0"
  },
  visual: {
    background: "media/ENV-001-automated-factory.png",
    width: 1672,
    height: 941
  },
  hotspots: []
});

const published = () => ({
  ...draft(),
  environment: { ...draft().environment, lifecycle: "published" },
  hotspots: Array.from({ length: 10 }, (_, index) => ({
    experience_editorial_id: `EE-${String(index + 1).padStart(4, "0")}`,
    x: index * 10,
    y: 100 - (index * 10)
  }))
});

test("accepts a draft Environment with no approved coordinates", () => {
  assert.equal(validateEnvironmentDefinition(draft()).valid, true);
});

test("accepts a complete published Environment when every Experience resolves", () => {
  const candidate = published();
  const ids = candidate.hotspots.map(item => item.experience_editorial_id);
  assert.equal(validateEnvironmentDefinition(candidate, { experienceEditorialIds: ids }).valid, true);
});

test("enforces published count and reference resolution", () => {
  const candidate = published();
  candidate.hotspots.pop();
  const result = validateEnvironmentDefinition(candidate, { experienceEditorialIds: [] });
  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_HOTSPOT_COUNT_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_EXPERIENCE_UNRESOLVED"));
});

test("rejects duplicate references, unsafe paths, unknown hotspot fields and invalid coordinates", () => {
  const candidate = draft();
  candidate.visual.background = "../outside.png";
  candidate.hotspots = [
    { experience_editorial_id: "EE-0001", x: -1, y: 50, title: "Duplicate data" },
    { experience_editorial_id: "EE-0001", x: 50, y: 101 }
  ];
  const result = validateEnvironmentDefinition(candidate);
  assert.equal(result.valid, false);
  for (const code of [
    "ENVIRONMENT_BACKGROUND_INVALID",
    "ENVIRONMENT_COORDINATE_INVALID",
    "ENVIRONMENT_EXPERIENCE_DUPLICATE",
    "ENVIRONMENT_HOTSPOT_FIELD_UNKNOWN"
  ]) assert.ok(result.incidents.some(item => item.code === code), code);
});

test("rejects invalid identity and visual dimensions", () => {
  const candidate = draft();
  candidate.environment.id = "ENV-1";
  candidate.visual.width = 0;
  candidate.visual.height = 941.5;
  const result = validateEnvironmentDefinition(candidate);
  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_ID_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_WIDTH_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_HEIGHT_INVALID"));
});

test("is deterministic, immutable and does not mutate input", () => {
  const candidate = published();
  const before = structuredClone(candidate);
  const options = { experienceEditorialIds: candidate.hotspots.map(item => item.experience_editorial_id) };
  const first = validateEnvironmentDefinition(candidate, options);
  const second = validateEnvironmentDefinition(structuredClone(candidate), options);
  assert.deepEqual(first, second);
  assert.deepEqual(candidate, before);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.incidents), true);
});
