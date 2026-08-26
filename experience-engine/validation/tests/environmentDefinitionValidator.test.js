import assert from "node:assert/strict";
import test from "node:test";

import { validateEnvironmentDefinition } from "../environmentDefinitionValidator.js";

const draft = () => ({
  environment: {
    id: "ENV-001",
    slug: "automated-factory",
    title: "Automated Factory",
    lifecycle: "draft",
    version: "1.0",
    capacity: 10
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

test("accepts a preview Environment with a partial resolved hotspot catalogue", () => {
  const candidate = draft();
  candidate.environment.lifecycle = "preview";
  candidate.hotspots = [{ experience_editorial_id: "EE-0001", x: 8.6, y: 36.8 }];
  assert.equal(validateEnvironmentDefinition(candidate, {
    experienceEditorialIds: ["EE-0001"]
  }).valid, true);
});

test("rejects unresolved Preview hotspot references", () => {
  const candidate = draft();
  candidate.environment.lifecycle = "preview";
  candidate.hotspots = [{ experience_editorial_id: "EE-0001", x: 8.6, y: 36.8 }];
  const result = validateEnvironmentDefinition(candidate, { experienceEditorialIds: [] });
  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_EXPERIENCE_UNRESOLVED"));
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
  candidate.environment.capacity = 0;
  const result = validateEnvironmentDefinition(candidate);
  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_ID_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_WIDTH_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_HEIGHT_INVALID"));
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_CAPACITY_INVALID"));
});

test("governs capacity independently from the currently available hotspots", () => {
  const candidate = draft();
  candidate.environment.capacity = 1;
  candidate.hotspots = [
    { experience_editorial_id: "EE-0001", x: 10, y: 10 },
    { experience_editorial_id: "EE-0002", x: 20, y: 20 }
  ];
  const result = validateEnvironmentDefinition(candidate);
  assert.equal(result.valid, false);
  assert.ok(result.incidents.some(item => item.code === "ENVIRONMENT_CAPACITY_MISMATCH"));
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
