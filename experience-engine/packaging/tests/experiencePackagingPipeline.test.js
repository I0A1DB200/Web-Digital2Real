import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createExperiencePackagingPipeline,
  ExperiencePackagingPipelineError,
  packageExperience
} from "../experiencePackagingPipeline.js";
import {
  WebArtifactProjectionError
} from "../../projection/runtimeToWebArtifactProjector.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const authoringFixtureUrl = new URL(
  "../../validation/fixtures/experience-definition-v1-valid.json",
  import.meta.url
);
const expectedArtifactUrl = new URL(
  "../../projection/fixtures/generated-web-artifact-from-runtime-v1.json",
  import.meta.url
);

const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));

test("packages a valid Authoring Definition through the complete pipeline", async () => {
  const artifact = packageExperience(await readJson(authoringFixtureUrl));
  const validation = validateGeneratedWebArtifact(artifact);

  assert.equal(validation.valid, true);
  assert.equal(validation.compatible, true);
  assert.deepEqual(validation.incidents, []);
});

test("returns the exact approved Generated Web Artifact", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const expected = await readJson(expectedArtifactUrl);

  assert.deepEqual(packageExperience(authoring), expected);
});

test("stops immediately when Authoring validation fails", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  delete authoring.public.title;

  assert.throws(
    () => packageExperience(authoring),
    error => error instanceof ExperiencePackagingPipelineError
      && error.code === "AUTHORING_VALIDATION_FAILED"
      && error.stage === "authoring_validation"
      && error.cause.incidents.some(incident => incident.path === "$.public.title")
  );
});

test("stops immediately when normalization fails", () => {
  const execution = [];
  const expectedFailure = Object.freeze({ ok: false, errors: [] });
  const pipeline = createExperiencePackagingPipeline(operations({
    execution,
    normalize: () => {
      execution.push("normalize");
      return expectedFailure;
    }
  }));

  assert.throws(
    () => pipeline({}),
    error => error instanceof ExperiencePackagingPipelineError
      && error.code === "NORMALIZATION_FAILED"
      && error.stage === "normalization"
      && error.cause === expectedFailure
  );
  assert.deepEqual(execution, ["validateAuthoring", "normalize"]);
});

test("stops immediately when Runtime validation fails", () => {
  const execution = [];
  const expectedFailure = Object.freeze({ compatible: false, incidents: [] });
  const pipeline = createExperiencePackagingPipeline(operations({
    execution,
    validateRuntime: () => {
      execution.push("validateRuntime");
      return expectedFailure;
    }
  }));

  assert.throws(
    () => pipeline({}),
    error => error instanceof ExperiencePackagingPipelineError
      && error.code === "RUNTIME_VALIDATION_FAILED"
      && error.stage === "runtime_validation"
      && error.cause === expectedFailure
  );
  assert.deepEqual(execution, ["validateAuthoring", "normalize", "validateRuntime"]);
});

test("propagates a projector failure without reinterpretation", () => {
  const execution = [];
  const projectionFailure = new WebArtifactProjectionError(
    "INVALID_RUNTIME_INPUT",
    "Projection failed."
  );
  const pipeline = createExperiencePackagingPipeline(operations({
    execution,
    project: () => {
      execution.push("project");
      throw projectionFailure;
    }
  }));

  assert.throws(() => pipeline({}), error => error === projectionFailure);
  assert.deepEqual(
    execution,
    ["validateAuthoring", "normalize", "validateRuntime", "project"]
  );
});

test("stops immediately when final Web Artifact validation fails", () => {
  const execution = [];
  const expectedFailure = Object.freeze({ compatible: false, incidents: [] });
  const pipeline = createExperiencePackagingPipeline(operations({
    execution,
    validateWebArtifact: () => {
      execution.push("validateWebArtifact");
      return expectedFailure;
    }
  }));

  assert.throws(
    () => pipeline({}),
    error => error instanceof ExperiencePackagingPipelineError
      && error.code === "WEB_ARTIFACT_VALIDATION_FAILED"
      && error.stage === "web_artifact_validation"
      && error.cause === expectedFailure
  );
  assert.deepEqual(
    execution,
    [
      "validateAuthoring",
      "normalize",
      "validateRuntime",
      "project",
      "validateWebArtifact"
    ]
  );
});

test("executes every successful stage exactly once and in contract order", () => {
  const execution = [];
  const artifact = Object.freeze({ web_artifact_version: "test" });
  const pipeline = createExperiencePackagingPipeline(operations({ execution, artifact }));

  assert.equal(pipeline({}), artifact);
  assert.deepEqual(
    execution,
    [
      "validateAuthoring",
      "normalize",
      "validateRuntime",
      "project",
      "validateWebArtifact"
    ]
  );
});

test("is deterministic and repeatable for equivalent inputs", async () => {
  const authoring = await readJson(authoringFixtureUrl);

  const first = packageExperience(authoring);
  const second = packageExperience(clone(authoring));

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("never mutates or freezes the Authoring input", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const before = clone(authoring);

  packageExperience(authoring);

  assert.deepEqual(authoring, before);
  assert.equal(Object.isFrozen(authoring), false);
  assert.equal(Object.isFrozen(authoring.public), false);
  assert.equal(Object.isFrozen(authoring.private), false);
});

test("returns a deeply frozen artifact", async () => {
  const artifact = packageExperience(await readJson(authoringFixtureUrl));

  assert.equal(Object.isFrozen(artifact), true);
  assert.equal(Object.isFrozen(artifact.identity), true);
  assert.equal(Object.isFrozen(artifact.capabilities), true);
  assert.equal(Object.isFrozen(artifact.public), true);
  assert.equal(Object.isFrozen(artifact.public.stages), true);
});

test("rejects an incomplete operations boundary", () => {
  assert.throws(
    () => createExperiencePackagingPipeline({}),
    /validateAuthoring must be a function/
  );
});

function operations({
  execution,
  artifact = Object.freeze({ web_artifact_version: "test" }),
  validateAuthoring,
  normalize,
  validateRuntime,
  project,
  validateWebArtifact
}) {
  const runtime = Object.freeze({ runtime_contract_version: "test" });
  return {
    validateAuthoring: validateAuthoring ?? (() => {
      execution.push("validateAuthoring");
      return Object.freeze({ compatible: true });
    }),
    normalize: normalize ?? (() => {
      execution.push("normalize");
      return Object.freeze({ ok: true, value: runtime });
    }),
    validateRuntime: validateRuntime ?? (() => {
      execution.push("validateRuntime");
      return Object.freeze({ compatible: true });
    }),
    project: project ?? (() => {
      execution.push("project");
      return artifact;
    }),
    validateWebArtifact: validateWebArtifact ?? (() => {
      execution.push("validateWebArtifact");
      return Object.freeze({ compatible: true });
    })
  };
}
