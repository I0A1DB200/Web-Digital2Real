export const environmentProgressStorageKey = "digital2real.environment-progress.v1";

export function createEnvironmentProgressStore({ storage = resolveStorage() } = {}) {
  const completed = new Set(readCompleted(storage));

  function complete(experienceId) {
    requireIdentity(experienceId);
    if (completed.has(experienceId)) return false;
    completed.add(experienceId);
    persist(storage, completed);
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

  return Object.freeze({ complete, isCompleted, getSnapshot });
}

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
