import { evaluateExperience } from "../evaluation/experienceEvaluator.js";

const WEB_ARTIFACT_V1 = "1.0.0";
const WEB_ARTIFACT_V2 = "2.0.0";
const SUPPORTED_WEB_ARTIFACT_VERSIONS = new Set([WEB_ARTIFACT_V1, WEB_ARTIFACT_V2]);

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
  #interactions;
  #state;
  #version;

  constructor({ experience } = {}) {
    validateExperience(experience);
    this.#model = deepFreeze(clone(experience));
    this.#stages = new Map(this.#model.public.stages.map(stage => [stage.id, stage]));
    this.#version = this.#model.web_artifact_version;
    this.#interactions = new Map((this.#model.public.interactions ?? []).map(item => [item.action_token, item]));
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
    this.#assertInteraction("continue", ["introduction", "stage", "selection"]);

    if (this.#state.interaction === "introduction") {
      this.#state = { ...this.#state, interaction: "stage" };
      return this.getState();
    }

    if (this.#version === WEB_ARTIFACT_V2) {
      throw new ExperiencePlayerError(
        "V2_SELECTION_REQUIRED",
        "Player V2 progression requires an explicit decision transition.",
        { stageId: this.#model.public.stages[this.#state.stageIndex].id }
      );
    }

    if (this.#state.interaction === "stage") {
      const stage = this.#model.public.stages[this.#state.stageIndex];
      if (stage.decisions.length > 0) {
        throw new ExperiencePlayerError(
          "DECISION_REQUIRED",
          "A decision must be selected before continuing.",
          { stageId: stage.id }
        );
      }
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

    if (this.#version === WEB_ARTIFACT_V2) return this.#selectDecisionV2(stage, decision);

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
      visual: clone(this.#model.public.visual),
      media: clone(resolveMedia(this.#model, stage?.media_ids ?? [])),
      ...(this.#version === WEB_ARTIFACT_V2 ? {
        attemptsByDecision: clone(this.#state.attemptsByDecision),
        resolvedDecisions: [...this.#state.resolvedDecisions],
        unlockedEvidence: [...this.#state.unlockedEvidence],
        feedback: clone(this.#state.feedback),
        evaluationResult: clone(this.#state.evaluationResult)
      } : {}),
      completion: this.#state.interaction === "completion"
        ? clone(this.#model.public.completion ?? null)
        : null
    });
  }

  getState() {
    return this.getSnapshot();
  }

  #createInitialState() {
    const initial = {
      state: ExperiencePlayerState.NotStarted,
      completionStatus: ExperienceCompletionStatus.NotStarted,
      interaction: "start",
      stageIndex: 0,
      selectedDecision: null,
      decisionHistory: []
    };
    return this.#version === WEB_ARTIFACT_V2 ? {
      ...initial,
      attemptsByDecision: {},
      resolvedDecisions: [],
      unlockedEvidence: [],
      feedback: null,
      evaluationResult: null
    } : initial;
  }

  #selectDecisionV2(stage, decision) {
    const decisionPointId = stage.id;
    if (this.#state.resolvedDecisions.includes(decisionPointId)) {
      throw new ExperiencePlayerError("DECISION_ALREADY_RESOLVED", `Decision point ${decisionPointId} is already resolved.`, { decisionPointId });
    }
    const interaction = this.#interactions.get(decision.action_token);
    if (!interaction) throw new ExperiencePlayerError("INTERACTION_AUTHORITY_MISSING", `Decision ${decision.id} has no interaction authority.`, { decisionId: decision.id });
    const attemptNumber = (this.#state.attemptsByDecision[decisionPointId] ?? 0) + 1;
    const record = { decisionPointId, selectedDecisionId: decision.id, attemptNumber, outcome: interaction.outcome };
    const attemptsByDecision = { ...this.#state.attemptsByDecision, [decisionPointId]: attemptNumber };
    const decisionHistory = [...this.#state.decisionHistory, record];

    if (interaction.outcome === "retry") {
      this.#state = {
        ...this.#state,
        selectedDecision: decision.id,
        attemptsByDecision,
        decisionHistory,
        feedback: { decisionId: decision.id, message: interaction.message, attemptNumber }
      };
      return this.getState();
    }

    const resolvedDecisions = [...this.#state.resolvedDecisions, decisionPointId];
    const unlockedEvidence = [...new Set([...this.#state.unlockedEvidence, ...interaction.unlocks])];
    const shared = {
      ...this.#state,
      selectedDecision: decision.id,
      attemptsByDecision,
      decisionHistory,
      resolvedDecisions,
      unlockedEvidence,
      feedback: null
    };
    if (interaction.next === "COMPLETE") {
      const decisionPoints = this.#model.public.stages.filter(item => item.decisions.length).map(item => item.id);
      let evaluationResult;
      try {
        evaluationResult = evaluateExperience({
          decisionPoints,
          attemptsByDecision,
          policy: this.#model.public.evaluation_policy
        });
      } catch (error) {
        throw new ExperiencePlayerError("V2_EVALUATION_FAILED", "Player V2 could not evaluate the completed Experience.", { cause: error.code ?? error.message });
      }
      this.#state = {
        ...shared,
        state: ExperiencePlayerState.Completed,
        completionStatus: ExperienceCompletionStatus.Completed,
        interaction: "completion",
        evaluationResult
      };
      return this.getState();
    }
    const stageIndex = this.#model.public.stages.findIndex(item => item.id === interaction.next);
    if (stageIndex < 0) throw new ExperiencePlayerError("INVALID_V2_TRANSITION", `Transition destination ${interaction.next} is unavailable.`, { destination: interaction.next });
    this.#state = { ...shared, interaction: "stage", stageIndex, selectedDecision: null };
    return this.getState();
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
  if (!SUPPORTED_WEB_ARTIFACT_VERSIONS.has(candidate.web_artifact_version)) {
    throw new ExperiencePlayerError(
      "UNSUPPORTED_CONTRACT_VERSION",
      `Supported web artifact versions are ${[...SUPPORTED_WEB_ARTIFACT_VERSIONS].join(", ")}.`,
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
    if (!Array.isArray(stage.decisions)) invalidModel(`Stage ${stage.id} decisions must be an array.`);
    stage.decisions.forEach((decision, decisionIndex) => {
      if (!plainObject(decision)) invalidModel(`Stage ${stage.id} decision ${decisionIndex} must be an object.`);
      ["id", "action"].forEach(field => requireText(decision[field], `Stage ${stage.id} decision ${field}`));
      if (decisionIds.has(decision.id)) invalidModel(`Duplicate decision identifier ${decision.id}.`);
      decisionIds.add(decision.id);
      if (candidate.web_artifact_version === WEB_ARTIFACT_V2) requireText(decision.action_token, `Stage ${stage.id} decision action_token`);
    });
  });

  if (candidate.web_artifact_version === WEB_ARTIFACT_V2) validateV2Experience(candidate, stageIds, decisionIds);

  const assets = candidate.public.visual.assets ?? [];
  if (!Array.isArray(assets)) invalidModel("public.visual.assets must be an array.");
  const assetIds = new Set();
  assets.forEach((asset, position) => {
    if (!plainObject(asset)) invalidModel(`public.visual.assets[${position}] must be an object.`);
    ["id", "type", "src", "alt", "purpose"].forEach(field => {
      requireText(asset[field], `public.visual.assets[${position}].${field}`);
    });
    if (assetIds.has(asset.id)) invalidModel(`Duplicate media identifier ${asset.id}.`);
    if (asset.src.includes("..") || /^(?:[a-z]+:|\/|\\\\)/i.test(asset.src)) {
      invalidModel(`Media ${asset.id} must use a safe package-relative source.`);
    }
    assetIds.add(asset.id);
  });
  candidate.public.stages.forEach(stage => {
    (stage.media_ids ?? []).forEach(id => {
      if (!assetIds.has(id)) invalidModel(`Stage ${stage.id} references unknown media ${id}.`);
    });
  });
}

function validateV2Experience(candidate, stageIds, decisionIds) {
  const interactions = candidate.public.interactions;
  if (!Array.isArray(interactions)) invalidModel("public.interactions must be an array for Player V2.");
  if (!plainObject(candidate.public.evaluation_policy)) invalidModel("public.evaluation_policy is required for Player V2.");
  const tokens = new Set(candidate.public.stages.flatMap(stage => stage.decisions.map(item => item.action_token)));
  const evidenceIds = new Set((candidate.public.evidence ?? []).map(item => item.id));
  if (tokens.size !== decisionIds.size) invalidModel("Player V2 action tokens must be unique.");
  const authorities = new Set();
  interactions.forEach((interaction, index) => {
    if (!plainObject(interaction)) invalidModel(`public.interactions[${index}] must be an object.`);
    requireText(interaction.action_token, `public.interactions[${index}].action_token`);
    if (!tokens.has(interaction.action_token) || authorities.has(interaction.action_token)) invalidModel(`Invalid V2 interaction authority ${interaction.action_token}.`);
    authorities.add(interaction.action_token);
    if (interaction.outcome === "retry") {
      requireText(interaction.message, `public.interactions[${index}].message`);
      if (Object.hasOwn(interaction, "next") || Object.hasOwn(interaction, "unlocks")) invalidModel("Player V2 retry interactions cannot progress or unlock evidence.");
    }
    else if (interaction.outcome === "advance") {
      requireText(interaction.next, `public.interactions[${index}].next`);
      if (interaction.next !== "COMPLETE" && !stageIds.has(interaction.next)) invalidModel(`Unknown V2 transition ${interaction.next}.`);
      if (!Array.isArray(interaction.unlocks)) invalidModel(`public.interactions[${index}].unlocks must be an array.`);
      interaction.unlocks.forEach(id => { if (!evidenceIds.has(id)) invalidModel(`Unknown V2 evidence unlock ${id}.`); });
    } else invalidModel(`Unsupported V2 interaction outcome ${interaction.outcome}.`);
  });
  if (authorities.size !== tokens.size) invalidModel("Every Player V2 action token requires one interaction authority.");
}

function resolveMedia(model, identifiers) {
  const requested = new Set(identifiers);
  return (model.public.visual.assets ?? []).filter(asset => requested.has(asset.id));
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
