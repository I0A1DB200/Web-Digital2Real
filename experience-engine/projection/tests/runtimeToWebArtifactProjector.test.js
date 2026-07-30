import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  projectRuntimeToWebArtifact,
  WebArtifactProjectionError
} from "../runtimeToWebArtifactProjector.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";

const runtimeFixtureUrl = new URL(
  "../../validation/fixtures/normalized-experience-v1-valid.json",
  import.meta.url
);
const expectedFixtureUrl = new URL(
  "../fixtures/generated-web-artifact-from-runtime-v1.json",
  import.meta.url
);
const authoringFixtureUrl = new URL(
  "../../validation/fixtures/experience-definition-v1-valid.json",
  import.meta.url
);
const legacyFixtureUrl = new URL(
  "../../validation/fixtures/experience-definition-legacy.json",
  import.meta.url
);

const readJson = async location => JSON.parse(await readFile(location, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));

test("projects a valid Runtime v1 into a valid Web Artifact v1", async () => {
  const artifact = projectRuntimeToWebArtifact(await readJson(runtimeFixtureUrl));
  const validation = validateGeneratedWebArtifact(artifact);

  assert.equal(validation.valid, true);
  assert.equal(validation.compatible, true);
  assert.deepEqual(validation.incidents, []);
});

test("produces the exact approved Web Artifact fixture", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  const expected = await readJson(expectedFixtureUrl);

  assert.deepEqual(projectRuntimeToWebArtifact(runtime), expected);
});

test("copies every Web Artifact field from one explicit Runtime source", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  const artifact = projectRuntimeToWebArtifact(runtime);

  assert.deepEqual(artifact.identity, runtime.identity);
  assert.deepEqual(artifact.metadata, runtime.public.metadata);
  assert.deepEqual(artifact.capabilities, runtime.capabilities);
  assert.deepEqual(artifact.public.scenario, runtime.public.scenario);
  assert.deepEqual(artifact.public.stages, runtime.public.stages);
  assert.deepEqual(artifact.public.visual, runtime.public.visual);
});

test("is deterministic for equivalent Runtime inputs", async () => {
  const runtime = await readJson(runtimeFixtureUrl);

  const first = projectRuntimeToWebArtifact(runtime);
  const second = projectRuntimeToWebArtifact(clone(runtime));

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("never mutates or freezes the Runtime input", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  const before = clone(runtime);

  projectRuntimeToWebArtifact(runtime);

  assert.deepEqual(runtime, before);
  assert.equal(Object.isFrozen(runtime), false);
  assert.equal(Object.isFrozen(runtime.public), false);
  assert.equal(Object.isFrozen(runtime.private), false);
});

test("returns a deeply frozen Web Artifact", async () => {
  const artifact = projectRuntimeToWebArtifact(await readJson(runtimeFixtureUrl));

  assert.equal(Object.isFrozen(artifact), true);
  assert.equal(Object.isFrozen(artifact.identity), true);
  assert.equal(Object.isFrozen(artifact.capabilities), true);
  assert.equal(Object.isFrozen(artifact.public), true);
  assert.equal(Object.isFrozen(artifact.public.stages), true);
  assert.equal(Object.isFrozen(artifact.public.stages[0].decisions), true);
});

test("never projects the Runtime private boundary", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  const artifact = projectRuntimeToWebArtifact(runtime);
  const serialized = JSON.stringify(artifact);

  assert.equal(Object.hasOwn(artifact, "private"), false);
  assert.equal(serialized.includes(runtime.private.diagnosis.root_cause), false);
  assert.equal(serialized.includes("relations"), false);
  assert.equal(serialized.includes("diagnosis"), false);
  assert.equal(serialized.includes("debrief"), false);
});

test("never projects scoring or internal decision effects", async () => {
  const artifact = projectRuntimeToWebArtifact(await readJson(runtimeFixtureUrl));
  const serialized = JSON.stringify(artifact);

  [
    "scoring",
    "score_effect",
    "safety_effect",
    "safety_threshold",
    "destination",
    "evidence_revealed"
  ].forEach(field => assert.equal(serialized.includes(field), false));
});

test("never projects answers, diagnostic logic or reserved feedback", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  runtime.private.feedback[0].consequence = "RESERVED-ANSWER";
  runtime.private.feedback[0].rationale = "RESERVED-REASONING";

  const artifact = projectRuntimeToWebArtifact(runtime);
  const serialized = JSON.stringify(artifact);

  assert.deepEqual(artifact.public.feedback, []);
  assert.equal(serialized.includes("RESERVED-ANSWER"), false);
  assert.equal(serialized.includes("RESERVED-REASONING"), false);
  assert.equal(serialized.includes("root_cause"), false);
});

test("does not publish Runtime evidence without explicit distributability", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  runtime.public.evidence[0].content = "UNRELEASED-EVIDENCE";

  const artifact = projectRuntimeToWebArtifact(runtime);

  assert.deepEqual(artifact.public.evidence, []);
  assert.equal(JSON.stringify(artifact).includes("UNRELEASED-EVIDENCE"), false);
});

test("does not project unknown or internal metadata", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  runtime.internal_metadata = { validation_result: "PRIVATE" };
  runtime.public.metadata.future_internal_note = "PRIVATE-NOTE";
  runtime.private.internal_review = "PRIVATE-REVIEW";

  const artifact = projectRuntimeToWebArtifact(runtime);
  const serialized = JSON.stringify(artifact);

  assert.equal(serialized.includes("PRIVATE"), false);
  assert.deepEqual(
    Object.keys(artifact.metadata),
    ["slug", "title", "summary", "estimated_duration", "language"]
  );
});

test("produces JSON-serializable output", async () => {
  const artifact = projectRuntimeToWebArtifact(await readJson(runtimeFixtureUrl));

  assert.doesNotThrow(() => JSON.stringify(artifact));
  assert.deepEqual(JSON.parse(JSON.stringify(artifact)), artifact);
});

test("rejects an invalid Runtime with a typed projection error", async () => {
  const runtime = await readJson(runtimeFixtureUrl);
  delete runtime.identity.id;

  assert.throws(
    () => projectRuntimeToWebArtifact(runtime),
    error => error instanceof WebArtifactProjectionError
      && error.code === "INVALID_RUNTIME_INPUT"
      && error.context.profile === "normalized_runtime_v1"
      && error.context.incidents.some(incident => incident.path === "$.identity.id")
  );
});

test("rejects Authoring and legacy contracts as incorrect Runtime inputs", async () => {
  const authoring = await readJson(authoringFixtureUrl);
  const legacy = await readJson(legacyFixtureUrl);

  for (const input of [authoring, legacy]) {
    assert.throws(
      () => projectRuntimeToWebArtifact(input),
      error => error instanceof WebArtifactProjectionError
        && error.code === "INVALID_RUNTIME_INPUT"
        && error.context.incidents.length > 0
    );
  }
});

test("rejects null, partial and already generated objects", async () => {
  const expectedArtifact = await readJson(expectedFixtureUrl);

  for (const input of [null, { runtime_contract_version: "1.0.0" }, expectedArtifact]) {
    assert.throws(
      () => projectRuntimeToWebArtifact(input),
      error => error instanceof WebArtifactProjectionError
        && error.code === "INVALID_RUNTIME_INPUT"
    );
  }
});
