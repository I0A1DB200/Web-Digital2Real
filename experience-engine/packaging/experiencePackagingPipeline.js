import { normalizeExperienceDefinition } from "../normalization/experienceDefinitionNormalizer.js";
import { projectRuntimeToWebArtifact } from "../projection/runtimeToWebArtifactProjector.js";
import { validateExperienceDefinition } from "../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../validation/normalizedExperienceValidator.js";

const officialOperations = Object.freeze({
  validateAuthoring: validateExperienceDefinition,
  normalize: normalizeExperienceDefinition,
  validateRuntime: validateNormalizedExperience,
  project: projectRuntimeToWebArtifact,
  validateWebArtifact: validateGeneratedWebArtifact
});

export class ExperiencePackagingPipelineError extends Error {
  constructor(code, stage, message, cause) {
    super(message, { cause });
    this.name = "ExperiencePackagingPipelineError";
    this.code = code;
    this.stage = stage;
  }
}

export function createExperiencePackagingPipeline(operations = officialOperations) {
  validateOperations(operations);

  return function runExperiencePackagingPipeline(authoring) {
    const authoringValidation = operations.validateAuthoring(authoring);
    assertCompatible(
      authoringValidation,
      "AUTHORING_VALIDATION_FAILED",
      "authoring_validation",
      "Experience Authoring Definition validation failed."
    );

    const normalization = operations.normalize(authoring);
    if (!normalization?.ok) {
      throw new ExperiencePackagingPipelineError(
        "NORMALIZATION_FAILED",
        "normalization",
        "Experience normalization failed.",
        normalization
      );
    }

    const runtime = normalization.value;
    const runtimeValidation = operations.validateRuntime(runtime);
    assertCompatible(
      runtimeValidation,
      "RUNTIME_VALIDATION_FAILED",
      "runtime_validation",
      "Normalized Runtime validation failed."
    );

    const artifact = operations.project(runtime);
    const artifactValidation = operations.validateWebArtifact(artifact);
    assertCompatible(
      artifactValidation,
      "WEB_ARTIFACT_VALIDATION_FAILED",
      "web_artifact_validation",
      "Generated Web Artifact validation failed."
    );

    return artifact;
  };
}

export const packageExperience = createExperiencePackagingPipeline();

function assertCompatible(validation, code, stage, message) {
  if (validation?.compatible) return;
  throw new ExperiencePackagingPipelineError(code, stage, message, validation);
}

function validateOperations(operations) {
  const names = [
    "validateAuthoring",
    "normalize",
    "validateRuntime",
    "project",
    "validateWebArtifact"
  ];
  if (!operations || typeof operations !== "object") {
    throw new TypeError("Experience packaging operations must be an object.");
  }
  names.forEach(name => {
    if (typeof operations[name] !== "function") {
      throw new TypeError(`Experience packaging operation ${name} must be a function.`);
    }
  });
}
