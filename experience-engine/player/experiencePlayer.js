const SUPPORTED_WEB_ARTIFACT_VERSION = "1.0.0";

export const ExperiencePlayerState = Object.freeze({
  NotStarted: "NotStarted",
  Active: "Active",
  Completed: "Completed"
});

export const ExperienceCompletionStatus = Object.freeze({
  NotStarted: "not_started",
  Active: "active",
  Completed: "completed"
});

export class ExperiencePlayerError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ExperiencePlayerError";
    this.code = code;
    this.details = deepFreeze(clone(details));
  }
}

export class ExperiencePlayer {
  #model;
  #stages;
  #state;

  constructor({ experience } = {}) {
    validateExperience(experience);
    this.#model = deepFreeze(clone(experience));
    this.#stages = new Map(this.#model.public.stages.map(stage => [stage.id, stage]));
    this.#state = this.#createInitialState();
  }

  start() {
    this.#assertInteraction("start", ["start"]);
    this.#state = {
      ...this.#state,
      state: ExperiencePlayerState.Active,
      completionStatus: ExperienceCompletionStatus.Active,
      interaction: "introduction"
    };
    return this.getState();
  }

  continue() {
    this.#assertInteraction("continue", ["introduction", "selection"]);

    if (this.#state.interaction === "introduction") {
      this.#state = { ...this.#state, interaction: "stage" };
      return this.getState();
    }

    const nextIndex = this.#state.stageIndex + 1;
    if (nextIndex >= this.#model.public.stages.length) {
      this.#state = {
        ...this.#state,
        state: ExperiencePlayerState.Completed,
        completionStatus: ExperienceCompletionStatus.Completed,
        interaction: "completion"
      };
      return this.getState();
    }

    this.#state = {
      ...this.#state,
      interaction: "stage",
      stageIndex: nextIndex,
      selectedDecision: null
    };
    return this.getState();
  }

  selectDecision(decisionId) {
    this.#assertInteraction("selectDecision", ["stage"]);
    requireText(decisionId, "decisionId");

    const stage = this.#model.public.stages[this.#state.stageIndex];
    const decision = stage.decisions.find(item => item.id === decisionId);
    if (!decision) {
      throw new ExperiencePlayerError(
        "INVALID_DECISION",
        `Decision ${decisionId} is not available in the current stage.`,
        { decisionId, stageId: stage.id }
      );
    }

    this.#state = {
      ...this.#state,
      interaction: "selection",
      selectedDecision: decision.id,
      decisionHistory: [...this.#state.decisionHistory, {
        stageId: stage.id,
        decisionId: decision.id,
        action: decision.action
      }]
    };
    return this.getState();
  }

  reset() {
    this.#state = this.#createInitialState();
    return this.getState();
  }

  getSnapshot() {
    const stage = this.#model.public.stages[this.#state.stageIndex];
    return deepFreeze({
      experience: {
        id: this.#model.identity.id,
        contentVersion: this.#model.identity.content_version,
        class: this.#model.identity.class,
        slug: this.#model.metadata.slug,
        title: this.#model.metadata.title,
        summary: this.#model.metadata.summary,
        estimatedDuration: this.#model.metadata.estimated_duration,
        language: this.#model.metadata.language
      },
      state: this.#state.state,
      completionStatus: this.#state.completionStatus,
      interaction: this.#state.interaction,
      context: clone(this.#model.public.scenario),
      progress: {
        currentStage: this.#state.stageIndex + 1,
        totalStages: this.#model.public.stages.length
      },
      currentStage: this.#state.interaction === "completion" ? null : clone(stage),
      selectedDecision: this.#state.selectedDecision,
      decisionHistory: clone(this.#state.decisionHistory),
      visual: clone(this.#model.public.visual)
    });
  }

  getState() {
    return this.getSnapshot();
  }

  #createInitialState() {
    return {
      state: ExperiencePlayerState.NotStarted,
      completionStatus: ExperienceCompletionStatus.NotStarted,
      interaction: "start",
      stageIndex: 0,
      selectedDecision: null,
      decisionHistory: []
    };
  }

  #assertInteraction(operation, allowed) {
    if (allowed.includes(this.#state.interaction)) return;
    throw new ExperiencePlayerError(
      "INVALID_PLAYER_STATE",
      `Operation ${operation} is unavailable during ${this.#state.interaction}.`,
      { operation, interaction: this.#state.interaction, allowed }
    );
  }
}

function validateExperience(candidate) {
  if (!plainObject(candidate)) invalidModel("The experience must be a generated web artifact.");
  if (candidate.web_artifact_version !== SUPPORTED_WEB_ARTIFACT_VERSION) {
    throw new ExperiencePlayerError(
      "UNSUPPORTED_CONTRACT_VERSION",
      `Supported web artifact version is ${SUPPORTED_WEB_ARTIFACT_VERSION}.`,
      { received: candidate.web_artifact_version ?? null }
    );
  }

  ["identity", "metadata", "public"].forEach(field => {
    if (!plainObject(candidate[field])) invalidModel(`${field} must be an object.`);
  });
  ["scenario", "visual"].forEach(field => {
    if (!plainObject(candidate.public[field])) invalidModel(`public.${field} must be an object.`);
  });
  if (!Array.isArray(candidate.public.stages) || candidate.public.stages.length === 0) {
    invalidModel("public.stages must contain at least one stage.");
  }

  ["id", "content_version", "class"].forEach(field => requireText(candidate.identity[field], `identity.${field}`));
  ["slug", "title", "summary", "language"].forEach(field => requireText(candidate.metadata[field], `metadata.${field}`));
  if (!Number.isInteger(candidate.metadata.estimated_duration) || candidate.metadata.estimated_duration < 1) {
    invalidModel("metadata.estimated_duration must be a positive integer.");
  }

  const stageIds = new Set();
  const decisionIds = new Set();
  candidate.public.stages.forEach((stage, stageIndex) => {
    if (!plainObject(stage)) invalidModel(`public.stages[${stageIndex}] must be an object.`);
    ["id", "title", "situation"].forEach(field => requireText(stage[field], `public.stages[${stageIndex}].${field}`));
    if (stageIds.has(stage.id)) invalidModel(`Duplicate stage identifier ${stage.id}.`);
    stageIds.add(stage.id);
    if (!Array.isArray(stage.decisions) || stage.decisions.length === 0) {
      invalidModel(`Stage ${stage.id} must contain at least one decision.`);
    }
    stage.decisions.forEach((decision, decisionIndex) => {
      if (!plainObject(decision)) invalidModel(`Stage ${stage.id} decision ${decisionIndex} must be an object.`);
      ["id", "action"].forEach(field => requireText(decision[field], `Stage ${stage.id} decision ${field}`));
      if (decisionIds.has(decision.id)) invalidModel(`Duplicate decision identifier ${decision.id}.`);
      decisionIds.add(decision.id);
    });
  });
}

function plainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) invalidModel(`${field} must be a non-empty string.`);
}

function invalidModel(message) {
  throw new ExperiencePlayerError("INVALID_EXPERIENCE_MODEL", message);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (Array.isArray(value)) {
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
}
