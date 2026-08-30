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

const theory = () => ({
  version: "1.0.0", default_locale: "es", supported_locales: ["es", "en"],
  media: [{ id: "TH-MEDIA-OVERVIEW", type: "image", src: "media/overview.png", alt: "Vista general" }],
  sections: [{ id: "TH-01-SIGNAL-PATH", title: "Signal path", body: "Follow 24 VDC from B1 to I0.3.", media_ids: ["TH-MEDIA-OVERVIEW"] }]
});
const theoryLocales = () => ({ en: {
  locale: "en", media: [{ id: "TH-MEDIA-OVERVIEW", alt: "Overview" }],
  sections: [{ id: "TH-01-SIGNAL-PATH", title: "Signal path", body: "Follow 24 VDC from B1 to I0.3.", media_ids: ["TH-MEDIA-OVERVIEW"] }]
} });
const environmentV2 = () => ({ ...draft(), contract_version: "2.0.0", theory: "theory.yaml" });

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

test("dispatches ENV V1 and a valid localized ENV V2 explicitly", () => {
  assert.equal(validateEnvironmentDefinition(draft()).profile, "environment_v1");
  const result = validateEnvironmentDefinition(environmentV2(), { theory: theory(), theoryLocales: theoryLocales() });
  assert.equal(result.profile, "environment_v2");
  assert.equal(result.valid, true);
});

test("rejects unsupported ENV versions and ENV V2 without Theory", () => {
  const unsupported = draft(); unsupported.contract_version = "3.0.0";
  assert.equal(validateEnvironmentDefinition(unsupported).incidents.some(item => item.code === "ENVIRONMENT_CONTRACT_VERSION_UNSUPPORTED"), true);
  const missing = environmentV2(); delete missing.theory;
  const result = validateEnvironmentDefinition(missing);
  assert.equal(result.valid, false);
  assert.equal(result.incidents.some(item => item.code === "ENVIRONMENT_FIELD_REQUIRED"), true);
});

test("rejects duplicate Theory sections, unknown media and unsafe media paths", () => {
  const content = theory();
  content.sections.push(structuredClone(content.sections[0]));
  content.sections[0].media_ids.push("TH-MEDIA-UNKNOWN");
  content.media[0].src = "../outside.png";
  const result = validateEnvironmentDefinition(environmentV2(), { theory: content, theoryLocales: theoryLocales() });
  for (const code of ["THEORY_SECTION_ID_DUPLICATE", "THEORY_SECTION_MEDIA_UNKNOWN", "THEORY_MEDIA_SOURCE_INVALID"]) {
    assert.equal(result.incidents.some(item => item.code === code), true, code);
  }
});

test("rejects invalid Theory localization identity and section order", () => {
  const locales = theoryLocales(); locales.en.locale = "es"; locales.en.sections[0].id = "TH-02-OTHER";
  const result = validateEnvironmentDefinition(environmentV2(), { theory: theory(), theoryLocales: locales });
  assert.equal(result.incidents.some(item => item.code === "THEORY_LOCALE_IDENTITY_INVALID"), true);
  assert.equal(result.incidents.some(item => item.code === "THEORY_LOCALE_SECTIONS_MISMATCH"), true);
});

test("preserves published and preview Experience-count rules for ENV V2", () => {
  const complete = { ...published(), contract_version: "2.0.0", theory: "theory.yaml" };
  const ids = complete.hotspots.map(item => item.experience_editorial_id);
  assert.equal(validateEnvironmentDefinition(complete, { experienceEditorialIds: ids, theory: theory(), theoryLocales: theoryLocales() }).valid, true);
  complete.hotspots.pop();
  assert.equal(validateEnvironmentDefinition(complete, { experienceEditorialIds: ids, theory: theory(), theoryLocales: theoryLocales() }).incidents.some(item => item.code === "ENVIRONMENT_HOTSPOT_COUNT_INVALID"), true);
  const preview = environmentV2(); preview.environment.lifecycle = "preview";
  assert.equal(validateEnvironmentDefinition(preview, { theory: theory(), theoryLocales: theoryLocales() }).valid, true);
});
