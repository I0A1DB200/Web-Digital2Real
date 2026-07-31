import { GeneratedWebArtifactV1Schema } from "../schemas/generatedWebArtifactV1Schema.js";
import { validateGeneratedWebArtifact } from "../validation/generatedWebArtifactValidator.js";
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

export class WebArtifactProjectionError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "WebArtifactProjectionError";
    this.code = code;
    this.context = immutableCopy(context);
  }
}

export function projectRuntimeToWebArtifact(runtime) {
  const inputValidation = validateNormalizedExperience(runtime);
  if (!inputValidation.compatible) {
    throw new WebArtifactProjectionError(
      "INVALID_RUNTIME_INPUT",
      "Projection requires a valid Normalized Runtime Contract v1.",
      {
        profile: inputValidation.profile,
        incidents: inputValidation.incidents
      }
    );
  }

  const artifact = project(runtime);
  const outputValidation = validateGeneratedWebArtifact(artifact);
  if (!outputValidation.compatible) {
    throw new WebArtifactProjectionError(
      "INVALID_WEB_ARTIFACT_OUTPUT",
      "Runtime projection produced an invalid Generated Web Artifact.",
      {
        profile: outputValidation.profile,
        incidents: outputValidation.incidents
      }
    );
  }

  return immutableCopy(artifact);
}

function project(runtime) {
  return {
    web_artifact_version: GeneratedWebArtifactV1Schema.contractVersion,
    identity: {
      id: runtime.identity.id,
      content_version: runtime.identity.content_version,
      class: runtime.identity.class
    },
    metadata: {
      slug: runtime.public.metadata.slug,
      title: runtime.public.metadata.title,
      summary: runtime.public.metadata.summary,
      estimated_duration: runtime.public.metadata.estimated_duration,
      language: runtime.public.metadata.language
    },
    capabilities: runtime.capabilities.map(capability => ({
      capability_id: capability.capability_id,
      competency_ids: [...capability.competency_ids]
    })),
    public: {
      scenario: copyScenario(runtime.public.scenario),
      stages: runtime.public.stages.map(stage => ({
        id: stage.id,
        title: stage.title,
        situation: stage.situation,
        ...(Array.isArray(stage.media_ids) ? { media_ids: [...stage.media_ids] } : {}),
        decisions: stage.decisions.map(decision => ({
          id: decision.id,
          action: decision.action
        }))
      })),
      evidence: [],
      feedback: [],
      visual: {
        educational_purpose: runtime.public.visual.educational_purpose,
        representation: runtime.public.visual.representation,
        ...(typeof runtime.public.visual.cover_asset_id === "string"
          ? { cover_asset_id: runtime.public.visual.cover_asset_id }
          : {}),
        ...(Array.isArray(runtime.public.visual.assets)
          ? { assets: immutableCopy(runtime.public.visual.assets) }
          : {})
      },
      ...(plainObject(runtime.public.completion)
        ? { completion: immutableCopy(runtime.public.completion) }
        : {})
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
