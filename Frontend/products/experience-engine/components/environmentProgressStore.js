export const environmentProgressStorageKey = "digital2real.environment-progress.v1";
export const environmentProgressV2StorageKey = "digital2real.environment-progress.v2";

export function createEnvironmentProgressStore({ storage = resolveStorage() } = {}) {
  const completed = new Set(readCompleted(storage));
  const progressV2 = readV2(storage);
  const registry = new Map();
  const listeners = new Set();

  function complete(experienceId) {
    requireIdentity(experienceId);
    if (completed.has(experienceId)) return false;
    completed.add(experienceId);
    persist(storage, completed);
    listeners.forEach(listener => listener());
    return true;
  }

  function isCompleted(experienceId) {
    requireIdentity(experienceId);
    return completed.has(experienceId);
  }

  function getSnapshot() {
    return Object.freeze({
      version: 1,
      completedExperienceIds: Object.freeze([...completed].sort())
    });
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function registerEnvironment({ environmentId, contractVersion, experienceIds, theorySectionIds }) {
    requireIdentity(environmentId);
    if (contractVersion !== "2.0.0") throw new TypeError("ENV Progress V2 requires Environment contract 2.0.0.");
    registry.set(environmentId, {
      experienceIds: new Set(requireIdentities(experienceIds, "Experience")),
      theorySectionIds: new Set(requireIdentities(theorySectionIds, "Theory section"))
    });
    listeners.forEach(listener => listener());
  }

  function markTheorySectionCompleted(environmentId, sectionId) {
    const definition = requireEnvironment(environmentId);
    if (!definition.theorySectionIds.has(sectionId)) throw new TypeError(`Unknown Theory section ${sectionId}.`);
    const state = ensureV2Environment(progressV2, environmentId);
    if (state.completedTheorySectionIds.has(sectionId)) return false;
    state.completedTheorySectionIds.add(sectionId);
    persistV2(storage, progressV2); listeners.forEach(listener => listener()); return true;
  }

  function recordExperienceResult(environmentId, experienceId, result) {
    const definition = requireEnvironment(environmentId);
    if (!definition.experienceIds.has(experienceId)) throw new TypeError(`Unknown Experience ${experienceId}.`);
    if (!result || result.completed !== true || typeof result.mastered !== "boolean") throw new TypeError("Experience result requires completed true and boolean mastered.");
    const state = ensureV2Environment(progressV2, environmentId);
    const previous = state.experiences.get(experienceId) ?? { completed: false, mastered: false };
    const next = { completed: true, mastered: previous.mastered || result.mastered };
    if (previous.completed === next.completed && previous.mastered === next.mastered) return false;
    state.experiences.set(experienceId, next);
    persistV2(storage, progressV2); listeners.forEach(listener => listener()); return true;
  }

  function getEnvironmentProgress(environmentId) {
    const definition = requireEnvironment(environmentId);
    const state = progressV2.get(environmentId) ?? { completedTheorySectionIds: new Set(), experiences: new Map() };
    const completedTheory = [...state.completedTheorySectionIds].filter(id => definition.theorySectionIds.has(id));
    const currentExperiences = [...definition.experienceIds];
    const completedExperiences = currentExperiences.filter(id => state.experiences.get(id)?.completed === true);
    const masteredExperiences = currentExperiences.filter(id => state.experiences.get(id)?.mastered === true);
    const theoryTotal = definition.theorySectionIds.size;
    const experiencesTotal = definition.experienceIds.size;
    const theoryCompleted = completedTheory.length === theoryTotal;
    const environmentCompleted = theoryCompleted && completedExperiences.length === experiencesTotal;
    const environmentMastered = theoryCompleted && masteredExperiences.length === experiencesTotal;
    return Object.freeze({
      version: 2,
      theory: Object.freeze({ completedSections: completedTheory.length, totalSections: theoryTotal, completed: theoryCompleted }),
      experiences: Object.freeze({ completed: completedExperiences.length, mastered: masteredExperiences.length, total: experiencesTotal }),
      environmentCompleted,
      environmentMastered
    });
  }

  function resetEnvironment(environmentId) {
    requireEnvironment(environmentId);
    if (!progressV2.delete(environmentId)) return false;
    persistV2(storage, progressV2); listeners.forEach(listener => listener()); return true;
  }

  function requireEnvironment(environmentId) {
    requireIdentity(environmentId);
    const definition = registry.get(environmentId);
    if (!definition) throw new TypeError(`Unknown Environment ${environmentId}.`);
    return definition;
  }

  return Object.freeze({ complete, isCompleted, getSnapshot, subscribe, registerEnvironment, markTheorySectionCompleted, recordExperienceResult, getEnvironmentProgress, resetEnvironment });
}

function readV2(storage) {
  const output = new Map();
  if (!storage) return output;
  try {
    const value = JSON.parse(storage.getItem(environmentProgressV2StorageKey));
    if (value?.version !== 2 || !value.environments || typeof value.environments !== "object") return output;
    Object.entries(value.environments).forEach(([environmentId, state]) => {
      if (!environmentId || !state || typeof state !== "object") return;
      const sections = new Set(Array.isArray(state.completedTheorySectionIds) ? state.completedTheorySectionIds.filter(validIdentity) : []);
      const experiences = new Map();
      Object.entries(state.experiences ?? {}).forEach(([id, result]) => {
        if (validIdentity(id) && result?.completed === true && typeof result.mastered === "boolean") experiences.set(id, { completed: true, mastered: result.mastered });
      });
      output.set(environmentId, { completedTheorySectionIds: sections, experiences });
    });
  } catch { /* Corrupt local input is ignored. */ }
  return output;
}

function ensureV2Environment(progress, id) {
  if (!progress.has(id)) progress.set(id, { completedTheorySectionIds: new Set(), experiences: new Map() });
  return progress.get(id);
}

function persistV2(storage, progress) {
  if (!storage) return;
  try {
    const environments = Object.fromEntries([...progress].sort(([a], [b]) => a.localeCompare(b)).map(([id, state]) => [id, {
      completedTheorySectionIds: [...state.completedTheorySectionIds].sort(),
      experiences: Object.fromEntries([...state.experiences].sort(([a], [b]) => a.localeCompare(b)))
    }]));
    storage.setItem(environmentProgressV2StorageKey, JSON.stringify({ version: 2, environments }));
  } catch { /* In-memory progress remains usable. */ }
}

function requireIdentities(value, label) {
  if (!Array.isArray(value) || value.some(item => !validIdentity(item)) || new Set(value).size !== value.length) throw new TypeError(`${label} identifiers must be unique non-empty strings.`);
  return value;
}

function validIdentity(value) { return typeof value === "string" && value.length > 0; }

function readCompleted(storage) {
  if (!storage) return [];
  try {
    const value = JSON.parse(storage.getItem(environmentProgressStorageKey));
    if (value?.version !== 1 || !Array.isArray(value.completedExperienceIds)) return [];
    return value.completedExperienceIds.filter(item => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

function persist(storage, completed) {
  if (!storage) return;
  try {
    storage.setItem(environmentProgressStorageKey, JSON.stringify({
      version: 1,
      completedExperienceIds: [...completed].sort()
    }));
  } catch {
    // The in-memory state remains authoritative for this session when storage is unavailable.
  }
}

function resolveStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function requireIdentity(experienceId) {
  if (typeof experienceId !== "string" || !experienceId) {
    throw new TypeError("Experience progress requires a stable Experience identifier.");
  }
}
