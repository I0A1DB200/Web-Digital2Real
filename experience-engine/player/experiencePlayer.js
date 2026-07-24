const plainObject = value => value !== null
  && typeof value === "object"
  && Object.getPrototypeOf(value) === Object.prototype;

function immutableCopy(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
}

export const ExperiencePlayerState = Object.freeze({
  NotStarted: "NotStarted",
  Active: "Active",
  Completed: "Completed",
  Blocked: "Blocked"
});

export const ExperienceCompletionStatus = Object.freeze({
  NotStarted: "not_started",
  Active: "active",
  Completed: "completed",
  CompletedWithWarnings: "completed_with_warnings",
  Blocked: "blocked"
});

export class ExperiencePlayerError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "ExperiencePlayerError";
    this.code = code;
    this.context = immutableCopy(context);
  }
}

export class ExperiencePlayer {
  #model;
  #stages;
  #evidence;
  #decisions;
  #state;

  constructor({ experience } = {}) {
    validateExperience(experience);
    this.#model = immutableCopy(experience);
    this.#stages = new Map(this.#model.stages.map(stage => [stage.id, stage]));
    this.#evidence = new Map(this.#model.evidence.map(item => [item.id, item]));
    this.#decisions = new Map(this.#model.decisions.map(decision => [decision.id, decision]));
    this.#state = this.#createInitialState();
  }

  start({ timestamp = 0 } = {}) {
    this.#assertState("start", [ExperiencePlayerState.NotStarted]);
    validateTimestamp(timestamp, null);
    this.#state = {
      ...this.#state,
      state: ExperiencePlayerState.Active,
      completionStatus: ExperienceCompletionStatus.Active,
      startedAt: timestamp,
      lastTimestamp: timestamp
    };
    return this.getSnapshot();
  }

  selectDecision(decisionId, { timestamp } = {}) {
    this.#assertState("selectDecision", [ExperiencePlayerState.Active]);
    validateTimestamp(timestamp, this.#state.lastTimestamp);

    const decision = this.#decisions.get(decisionId);
    if (!decision || decision.stage_id !== this.#state.currentStage) {
      throw new ExperiencePlayerError(
        "DECISION_NOT_AVAILABLE",
        `Decision ${decisionId} is not available in the current stage.`,
        { decisionId, currentStage: this.#state.currentStage }
      );
    }

    const scoring = this.#model.evaluation.scoring;
    const score = clamp(
      this.#state.score + decision.score_effect,
      scoring.minimum_score,
      scoring.maximum_score
    );
    const safetyScore = this.#state.safetyScore + decision.safety_effect;
    const revealedEvidence = new Set(this.#state.revealedEvidence);
    decision.evidence_revealed.forEach(id => revealedEvidence.add(id));
    const safetyBlocked = decision.next_stage === "COMPLETE"
      && safetyScore < scoring.safety_threshold;
    const destination = safetyBlocked ? "BLOCKED" : decision.next_stage;
    const terminal = destination === "COMPLETE" || destination === "BLOCKED";
    const completionStatus = terminal
      ? terminalStatus(decision, destination)
      : ExperienceCompletionStatus.Active;
    const state = terminal
      ? destination === "BLOCKED"
        ? ExperiencePlayerState.Blocked
        : ExperiencePlayerState.Completed
      : ExperiencePlayerState.Active;
    const record = immutableCopy({
      decisionId: decision.id,
      originatingStage: decision.stage_id,
      timestamp,
      resultingStage: destination,
      evidenceRevealed: [...decision.evidence_revealed],
      scoreEffect: decision.score_effect,
      safetyEffect: decision.safety_effect,
      timeCost: decision.time_cost ?? 0
    });

    this.#state = {
      ...this.#state,
      state,
      completionStatus,
      currentStage: terminal ? null : destination,
      revealedEvidence: [...revealedEvidence],
      selectedDecisions: [...this.#state.selectedDecisions, decision.id],
      decisionHistory: [...this.#state.decisionHistory, record],
      visitedStages: terminal || this.#state.visitedStages.includes(destination)
        ? this.#state.visitedStages
        : [...this.#state.visitedStages, destination],
      score,
      safetyScore,
      elapsedTime: this.#state.elapsedTime + (decision.time_cost ?? 0),
      lastTimestamp: timestamp,
      lastOutcome: {
        decisionId: decision.id,
        rationale: decision.rationale,
        classification: decision.classification,
        consequence: decision.consequence,
        resultingStage: destination
      }
    };

    return this.getSnapshot();
  }

  reset() {
    this.#state = this.#createInitialState();
    return this.getSnapshot();
  }

  getSnapshot() {
    const currentStage = this.#state.currentStage
      ? this.#createStageProjection(this.#stages.get(this.#state.currentStage))
      : null;
    const terminal = this.#state.state === ExperiencePlayerState.Completed
      || this.#state.state === ExperiencePlayerState.Blocked;

    return immutableCopy({
      experience: {
        id: this.#model.experience.id,
        version: this.#model.experience.version,
        slug: this.#model.experience.slug,
        title: this.#model.experience.title,
        summary: this.#model.experience.summary,
        difficulty: this.#model.experience.difficulty,
        estimatedDuration: this.#model.experience.estimated_duration
      },
      state: this.#state.state,
      completionStatus: this.#state.completionStatus,
      startedAt: this.#state.startedAt,
      currentStage,
      revealedEvidence: this.#state.revealedEvidence.map(id => publicEvidence(this.#evidence.get(id))),
      selectedDecisions: [...this.#state.selectedDecisions],
      decisionHistory: [...this.#state.decisionHistory],
      visitedStages: [...this.#state.visitedStages],
      score: this.#state.score,
      safetyScore: this.#state.safetyScore,
      safetyThreshold: this.#model.evaluation.scoring.safety_threshold,
      elapsedTime: this.#state.elapsedTime,
      lastTimestamp: this.#state.lastTimestamp,
      lastOutcome: this.#state.lastOutcome,
      debrief: terminal ? this.#model.debrief : null,
      notebookReferences: terminal ? this.#model.references.notebook : []
    });
  }

  #createInitialState() {
    const initialStage = this.#model.stages[0].id;
    return {
      state: ExperiencePlayerState.NotStarted,
      completionStatus: ExperienceCompletionStatus.NotStarted,
      startedAt: null,
      currentStage: initialStage,
      revealedEvidence: this.#model.evidence
        .filter(item => item.revealed_by.length === 0)
        .map(item => item.id),
      selectedDecisions: [],
      decisionHistory: [],
      visitedStages: [initialStage],
      score: this.#model.evaluation.scoring.initial_score,
      safetyScore: 0,
      elapsedTime: 0,
      lastTimestamp: null,
      lastOutcome: null
    };
  }

  #createStageProjection(stage) {
    const revealed = new Set(this.#state.revealedEvidence);
    return {
      id: stage.id,
      title: stage.title,
      situation: stage.situation,
      objective: stage.objective ?? null,
      evidence: stage.available_evidence
        .filter(id => revealed.has(id))
        .map(id => publicEvidence(this.#evidence.get(id))),
      decisions: stage.decisions.map(id => {
        const decision = this.#decisions.get(id);
        return { id: decision.id, action: decision.action };
      })
    };
  }

  #assertState(operation, allowedStates) {
    if (allowedStates.includes(this.#state.state)) return;
    throw new ExperiencePlayerError(
      "INVALID_PLAYER_STATE",
      `Operation ${operation} is invalid while the player is ${this.#state.state}.`,
      { operation, state: this.#state.state, allowedStates }
    );
  }
}

function publicEvidence(evidence) {
  return {
    id: evidence.id,
    type: evidence.type,
    source: evidence.source,
    content: evidence.content,
    reliability: evidence.reliability
  };
}

function terminalStatus(decision, destination) {
  if (destination === "BLOCKED") return ExperienceCompletionStatus.Blocked;
  return decision.classification === "strong"
    ? ExperienceCompletionStatus.Completed
    : ExperienceCompletionStatus.CompletedWithWarnings;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateTimestamp(timestamp, previousTimestamp) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp < 0) {
    throw new ExperiencePlayerError(
      "INVALID_TIMESTAMP",
      "timestamp must be a caller-supplied finite non-negative number.",
      { timestamp }
    );
  }
  if (previousTimestamp !== null && timestamp < previousTimestamp) {
    throw new ExperiencePlayerError(
      "NON_MONOTONIC_TIMESTAMP",
      "timestamp must not precede the previous session timestamp.",
      { timestamp, previousTimestamp }
    );
  }
}

function validateExperience(candidate) {
  if (!plainObject(candidate)) invalidModel("experience must be a plain normalized object.");

  ["experience", "scenario", "evaluation", "debrief", "references"].forEach(field => {
    if (!plainObject(candidate[field])) invalidModel(`${field} must be an object.`);
  });
  ["competencies", "learning_objectives", "stages", "evidence", "decisions"].forEach(field => {
    if (!Array.isArray(candidate[field])) invalidModel(`${field} must be an array.`);
  });
  if (!candidate.stages.length) invalidModel("stages must contain an initial stage.");
  if (!plainObject(candidate.evaluation.scoring)) invalidModel("evaluation.scoring must be an object.");
  if (!Array.isArray(candidate.references.notebook)) invalidModel("references.notebook must be an array.");

  ["id", "version", "slug", "title", "summary", "difficulty"].forEach(field => {
    requireText(candidate.experience[field], `experience.${field}`);
  });
  if (!Number.isInteger(candidate.experience.estimated_duration) || candidate.experience.estimated_duration < 1) {
    invalidModel("experience.estimated_duration must be a positive integer.");
  }

  const stageIds = uniqueIds(candidate.stages, "stage");
  const evidenceIds = uniqueIds(candidate.evidence, "evidence");
  const decisionIds = uniqueIds(candidate.decisions, "decision");
  uniqueIds(candidate.competencies, "competency");
  uniqueIds(candidate.learning_objectives, "learning objective");

  candidate.evidence.forEach(item => {
    if (!Array.isArray(item.revealed_by)) invalidModel(`Evidence ${item.id} must define revealed_by.`);
    item.revealed_by.forEach(id => {
      if (!decisionIds.has(id)) invalidModel(`Evidence ${item.id} references unknown decision ${id}.`);
    });
  });

  candidate.stages.forEach(stage => {
    if (!Array.isArray(stage.available_evidence) || !Array.isArray(stage.decisions)) {
      invalidModel(`Stage ${stage.id} must define evidence and decisions.`);
    }
    stage.available_evidence.forEach(id => {
      if (!evidenceIds.has(id)) invalidModel(`Stage ${stage.id} references unknown evidence ${id}.`);
    });
    stage.decisions.forEach(id => {
      const decision = candidate.decisions.find(item => item.id === id);
      if (!decision || decision.stage_id !== stage.id) {
        invalidModel(`Stage ${stage.id} has invalid decision reference ${id}.`);
      }
    });
  });

  candidate.decisions.forEach(decision => {
    if (!stageIds.has(decision.stage_id)) invalidModel(`Decision ${decision.id} has an unknown stage.`);
    if (!Array.isArray(decision.evidence_revealed)) {
      invalidModel(`Decision ${decision.id} must define evidence_revealed.`);
    }
    decision.evidence_revealed.forEach(id => {
      if (!evidenceIds.has(id)) invalidModel(`Decision ${decision.id} references unknown evidence ${id}.`);
    });
    if (!stageIds.has(decision.next_stage) && !["COMPLETE", "BLOCKED"].includes(decision.next_stage)) {
      invalidModel(`Decision ${decision.id} has an invalid destination.`);
    }
    ["score_effect", "safety_effect"].forEach(field => {
      if (!Number.isInteger(decision[field])) invalidModel(`Decision ${decision.id} must define integer ${field}.`);
    });
    if (decision.time_cost !== undefined && (!Number.isInteger(decision.time_cost) || decision.time_cost < 0)) {
      invalidModel(`Decision ${decision.id} has an invalid time_cost.`);
    }
  });

  const scoring = candidate.evaluation.scoring;
  ["initial_score", "minimum_score", "maximum_score", "safety_threshold"].forEach(field => {
    if (!Number.isInteger(scoring[field])) invalidModel(`evaluation.scoring.${field} must be an integer.`);
  });
  if (scoring.minimum_score > scoring.maximum_score
    || scoring.initial_score < scoring.minimum_score
    || scoring.initial_score > scoring.maximum_score) {
    invalidModel("evaluation scoring bounds are inconsistent.");
  }
}

function uniqueIds(items, label) {
  const ids = new Set();
  items.forEach(item => {
    if (!plainObject(item)) invalidModel(`Every ${label} must be an object.`);
    requireText(item.id, `${label}.id`);
    if (ids.has(item.id)) invalidModel(`Duplicate ${label} id ${item.id}.`);
    ids.add(item.id);
  });
  return ids;
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) invalidModel(`${field} must be a non-empty string.`);
}

function invalidModel(message) {
  throw new ExperiencePlayerError("INVALID_EXPERIENCE_MODEL", message);
}
