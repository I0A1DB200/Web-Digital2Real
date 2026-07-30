import { NormalizedExperienceV1Schema } from "../schemas/normalizedExperienceV1Schema.js";
import { validateExperienceDefinition } from "../validation/experienceDefinitionValidator.js";
import { validateNormalizedExperience } from "../validation/normalizedExperienceValidator.js";

const plainObject = value => value !== null
  && typeof value === "object"
  && !Array.isArray(value);

const immutableCopy = value => {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
};

export function normalizeExperienceDefinition(candidate) {
  const inputProfile = classifyInput(candidate);
  if (inputProfile !== "authoring_v1") {
    return createResult({
      inputProfile,
      errors: [profileIncident(inputProfile)]
    });
  }

  const inputValidation = validateExperienceDefinition(candidate);
  if (!inputValidation.compatible) {
    return createResult({
      inputProfile: inputValidation.profile,
      errors: inputValidation.errors,
      warnings: inputValidation.warnings
    });
  }

  const relationshipIncidents = validateRelationshipConsistency(candidate);
  if (relationshipIncidents.length) {
    return createResult({
      inputProfile,
      errors: relationshipIncidents
    });
  }

  const runtime = transform(candidate);
  const outputValidation = validateNormalizedExperience(runtime);
  if (!outputValidation.compatible) {
    return createResult({
      inputProfile,
      outputProfile: outputValidation.profile,
      errors: outputValidation.errors,
      warnings: outputValidation.warnings
    });
  }

  return createResult({
    ok: true,
    inputProfile,
    outputProfile: outputValidation.profile,
    value: runtime,
    warnings: outputValidation.warnings
  });
}

function transform(authoring) {
  const publicDecisions = new Map(
    authoring.public.decisions.map(decision => [decision.id, decision])
  );
  const decisionLogic = new Map(
    authoring.private.decision_logic.map(logic => [logic.decision_id, logic])
  );

  return {
    runtime_contract_version: NormalizedExperienceV1Schema.contractVersion,
    identity: {
      id: authoring.metadata.id,
      content_version: authoring.metadata.content_version,
      class: authoring.metadata.class
    },
    capabilities: authoring.capability_references.map(capability => ({
      capability_id: capability.capability_id,
      competency_ids: [...capability.competency_ids]
    })),
    public: {
      metadata: {
        slug: authoring.public.slug,
        title: authoring.public.title,
        summary: authoring.public.summary,
        estimated_duration: authoring.public.estimated_duration,
        language: authoring.metadata.language
      },
      scenario: copyScenario(authoring.public.scenario),
      stages: authoring.public.stages.map(stage => ({
        id: stage.id,
        title: stage.title,
        situation: stage.situation,
        decisions: stage.decision_ids.map(decisionId => {
          const decision = publicDecisions.get(decisionId);
          return {
            id: decision.id,
            action: decision.action
          };
        })
      })),
      evidence: authoring.public.evidence.map(evidence => ({
        id: evidence.id,
        type: evidence.type,
        source: evidence.source,
        content: evidence.content,
        reliability: evidence.reliability
      })),
      visual: {
        educational_purpose: authoring.public.visual.educational_purpose,
        representation: authoring.public.visual.representation
      }
    },
    private: {
      relations: authoring.private.decision_logic.map(logic => {
        const decision = publicDecisions.get(logic.decision_id);
        return {
          stage_id: decision.stage_id,
          decision_id: logic.decision_id,
          destination: logic.next_stage,
          evidence_revealed: [...logic.evidence_revealed],
          feedback_id: logic.decision_id,
          score_effect: logic.score_effect,
          safety_effect: logic.safety_effect,
          ...(Object.hasOwn(logic, "time_cost") ? { time_cost: logic.time_cost } : {})
        };
      }),
      diagnosis: {
        root_cause: authoring.private.fault_model.root_cause,
        recovery_conditions: [...authoring.private.fault_model.recovery_conditions]
      },
      feedback: authoring.public.decisions.map(decision => {
        const logic = decisionLogic.get(decision.id);
        return {
          id: decision.id,
          classification: logic.classification,
          rationale: logic.rationale,
          consequence: logic.consequence
        };
      }),
      scoring: {
        purpose: authoring.private.scoring.purpose,
        initial_score: authoring.private.scoring.initial_score,
        minimum_score: authoring.private.scoring.minimum_score,
        maximum_score: authoring.private.scoring.maximum_score,
        safety_threshold: authoring.private.scoring.safety_threshold
      },
      debrief: {
        fault_summary: authoring.private.debrief.fault_summary,
        correct_reasoning: [...authoring.private.debrief.correct_reasoning],
        recovery: [...authoring.private.debrief.recovery]
      }
    }
  };
}

function copyScenario(scenario) {
  return {
    initial_context: scenario.initial_context,
    operational_state: scenario.operational_state,
    initiating_event: scenario.initiating_event,
    learner_role: scenario.learner_role,
    safety_context: {
      safe_state: scenario.safety_context.safe_state,
      intervention_constraints: [...scenario.safety_context.intervention_constraints]
    }
  };
}

function validateRelationshipConsistency(authoring) {
  const revealedByEvidence = new Map(
    authoring.public.evidence.map(evidence => [
      evidence.id,
      new Set(evidence.revealed_by)
    ])
  );
  const revealedByLogic = new Map(
    authoring.public.evidence.map(evidence => [evidence.id, new Set()])
  );

  authoring.private.decision_logic.forEach(logic => {
    logic.evidence_revealed.forEach(evidenceId => {
      revealedByLogic.get(evidenceId).add(logic.decision_id);
    });
  });

  const incidents = [];
  authoring.public.evidence.forEach((evidence, position) => {
    const authored = revealedByEvidence.get(evidence.id);
    const executable = revealedByLogic.get(evidence.id);
    if (!sameSet(authored, executable)) {
      incidents.push({
        severity: "error",
        code: "EVIDENCE_REVEAL_CONTRADICTION",
        path: `$.public.evidence[${position}].revealed_by`,
        message: `Evidence ${evidence.id} reveal references contradict private decision logic.`
      });
    }
  });
  return incidents;
}

function sameSet(left, right) {
  return left.size === right.size && [...left].every(item => right.has(item));
}

function classifyInput(candidate) {
  if (!plainObject(candidate)) return "unknown";
  if (Object.hasOwn(candidate, "runtime_contract_version")) return "normalized_runtime_v1";
  if (Object.hasOwn(candidate, "artifact_version")
    || Object.hasOwn(candidate, "artifact_format_version")) {
    return "generated_web_artifact";
  }
  if (Object.hasOwn(candidate, "current_stage")
    || Object.hasOwn(candidate, "completed")
    || Object.hasOwn(candidate, "decision_history")) {
    return "player_progress_state";
  }
  if (Object.hasOwn(candidate, "contract_version")
    && plainObject(candidate.metadata)
    && plainObject(candidate.public)
    && plainObject(candidate.private)) {
    return "authoring_v1";
  }
  if (typeof candidate.id === "string" || plainObject(candidate.experience)) {
    return "legacy_unadapted";
  }
  return "unknown";
}

function profileIncident(profile) {
  const details = {
    normalized_runtime_v1: [
      "RUNTIME_INPUT_NOT_AUTHORING",
      "A Normalized Runtime Contract cannot be used as Authoring input."
    ],
    generated_web_artifact: [
      "GENERATED_ARTIFACT_NOT_AUTHORING",
      "A Generated Web Artifact cannot be used as Authoring input."
    ],
    player_progress_state: [
      "PLAYER_STATE_NOT_AUTHORING",
      "Player progress state cannot be used as Authoring input."
    ],
    legacy_unadapted: [
      "LEGACY_CONTRACT_UNSUPPORTED",
      "Legacy Experience content requires an explicit Authoring v1 adaptation."
    ],
    unknown: [
      "AUTHORING_PROFILE_UNKNOWN",
      "Input is not a recognized Experience Authoring Definition."
    ]
  }[profile];
  return {
    severity: "error",
    code: details[0],
    path: "$",
    message: details[1]
  };
}

function createResult({
  ok = false,
  inputProfile,
  outputProfile = null,
  value,
  errors = [],
  warnings = []
}) {
  return immutableCopy({
    ok,
    inputProfile,
    outputProfile,
    ...(ok ? { value } : {}),
    errors,
    warnings
  });
}
