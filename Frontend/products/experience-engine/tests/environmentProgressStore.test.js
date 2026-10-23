import assert from "node:assert/strict";
import test from "node:test";
import { createEnvironmentProgressStore, environmentProgressStorageKey, environmentProgressV2StorageKey } from "../components/environmentProgressStore.js";

const storage = initial => {
  const values = new Map(Object.entries(initial ?? {}));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};
const register = (store, environmentId = "ENV-001", experienceIds = ["EXP-1", "EXP-2"], theorySectionIds = ["TH-01", "TH-02"]) =>
  store.registerEnvironment({ environmentId, contractVersion: "2.0.0", experienceIds, theorySectionIds });

test("preserves the exact V1 progress API and storage", () => {
  const target = storage(); const store = createEnvironmentProgressStore({ storage: target });
  assert.equal(store.complete("EXP-V1"), true); assert.equal(store.complete("EXP-V1"), false);
  assert.equal(store.isCompleted("EXP-V1"), true);
  assert.deepEqual(store.getSnapshot(), { version: 1, completedExperienceIds: ["EXP-V1"] });
  assert.deepEqual(JSON.parse(target.values.get(environmentProgressStorageKey)), { version: 1, completedExperienceIds: ["EXP-V1"] });
});

test("persists idempotent Theory progress without mastery", () => {
  const target = storage(); const first = createEnvironmentProgressStore({ storage: target }); register(first);
  assert.deepEqual(first.getEnvironmentProgress("ENV-001").theory, { completedSections: 0, totalSections: 2, completed: false });
  assert.equal(first.markTheorySectionCompleted("ENV-001", "TH-01"), true);
  assert.equal(first.markTheorySectionCompleted("ENV-001", "TH-01"), false);
  assert.equal(first.getEnvironmentProgress("ENV-001").theory.completedSections, 1);
  first.markTheorySectionCompleted("ENV-001", "TH-02");
  assert.equal(first.getEnvironmentProgress("ENV-001").theory.completed, true);
  const second = createEnvironmentProgressStore({ storage: target }); register(second);
  assert.equal(second.getEnvironmentProgress("ENV-001").theory.completedSections, 2);
  assert.equal(Object.hasOwn(second.getEnvironmentProgress("ENV-001").theory, "mastered"), false);
});

test("keeps Experience completion and mastery distinct and monotonic", () => {
  const store = createEnvironmentProgressStore({ storage: storage() }); register(store);
  store.recordExperienceResult("ENV-001", "EXP-1", { completed: true, mastered: false });
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 0, total: 2 });
  store.recordExperienceResult("ENV-001", "EXP-1", { completed: true, mastered: true });
  store.recordExperienceResult("ENV-001", "EXP-1", { completed: true, mastered: false });
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 2 });
  assert.throws(() => store.recordExperienceResult("ENV-001", "EXP-2", { completed: false, mastered: true }));
});

test("derives Environment completion and mastery without a combined score", () => {
  const store = createEnvironmentProgressStore({ storage: storage() }); register(store);
  store.recordExperienceResult("ENV-001", "EXP-1", { completed: true, mastered: true });
  store.recordExperienceResult("ENV-001", "EXP-2", { completed: true, mastered: false });
  assert.equal(store.getEnvironmentProgress("ENV-001").environmentCompleted, false);
  store.markTheorySectionCompleted("ENV-001", "TH-01"); store.markTheorySectionCompleted("ENV-001", "TH-02");
  assert.equal(store.getEnvironmentProgress("ENV-001").environmentCompleted, true);
  assert.equal(store.getEnvironmentProgress("ENV-001").environmentMastered, false);
  store.recordExperienceResult("ENV-001", "EXP-2", { completed: true, mastered: true });
  assert.equal(store.getEnvironmentProgress("ENV-001").environmentMastered, true);
  assert.equal(Object.hasOwn(store.getEnvironmentProgress("ENV-001"), "percentage"), false);
});

test("derives Preview totals and ignores removed canonical IDs", () => {
  const store = createEnvironmentProgressStore({ storage: storage() }); register(store, "ENV-001", ["A", "B", "C"], ["T"]);
  store.markTheorySectionCompleted("ENV-001", "T"); store.recordExperienceResult("ENV-001", "A", { completed: true, mastered: true }); store.recordExperienceResult("ENV-001", "B", { completed: true, mastered: false });
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 2, mastered: 1, total: 3 });
  register(store, "ENV-001", ["A", "C"], ["T"]);
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 2 });
});

test("rejects unknown IDs and isolates ENV reset", () => {
  const store = createEnvironmentProgressStore({ storage: storage() }); register(store); register(store, "ENV-002", ["X"], ["T"]);
  assert.throws(() => store.markTheorySectionCompleted("ENV-001", "UNKNOWN"));
  assert.throws(() => store.recordExperienceResult("ENV-001", "UNKNOWN", { completed: true, mastered: false }));
  assert.throws(() => store.getEnvironmentProgress("ENV-UNKNOWN"));
  store.recordExperienceResult("ENV-001", "EXP-1", { completed: true, mastered: false }); store.markTheorySectionCompleted("ENV-002", "T");
  store.resetEnvironment("ENV-001");
  assert.equal(store.getEnvironmentProgress("ENV-001").experiences.completed, 0);
  assert.equal(store.getEnvironmentProgress("ENV-002").theory.completedSections, 1);
});

test("ignores corrupt, unsupported, duplicate and impossible persisted V2 input", () => {
  for (const payload of ["{", JSON.stringify({ version: 3 }), JSON.stringify({ version: 2, environments: { "ENV-001": { completedTheorySectionIds: ["T", "T"], experiences: { A: { completed: false, mastered: true } } } } })]) {
    const target = storage({ [environmentProgressV2StorageKey]: payload }); const store = createEnvironmentProgressStore({ storage: target }); register(store, "ENV-001", ["A"], ["T"]);
    const result = store.getEnvironmentProgress("ENV-001");
    assert.equal(result.experiences.mastered, 0);
    assert.ok(result.theory.completedSections <= 1);
  }
});
