import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ExperienceCompletionStatus,
  ExperiencePlayer,
  ExperiencePlayerError,
  ExperiencePlayerState
} from "../experiencePlayer.js";

const fixtureUrl = new URL(
  "../../validation/fixtures/generated-web-artifact-v1-valid.json",
  import.meta.url
);

const readArtifact = async () => JSON.parse(await readFile(fixtureUrl, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));

test("starts a local session from Generated Web Artifact v1", async () => {
  const artifact = await readArtifact();
  const player = new ExperiencePlayer({ experience: artifact });
  const initial = player.getState();

  assert.equal(initial.state, ExperiencePlayerState.NotStarted);
  assert.equal(initial.interaction, "start");
  assert.equal(initial.experience.id, "EXP-GENERIC-DIAG-001");
  assert.equal(initial.currentStage.id, "STAGE-INCIDENT");
  assert.deepEqual(artifact, await readArtifact());

  const introduction = player.start();
  assert.equal(introduction.state, ExperiencePlayerState.Active);
  assert.equal(introduction.interaction, "introduction");
  assert.equal(player.continue().interaction, "stage");
});

test("records a valid public decision and advances in public stage order", async () => {
  const player = new ExperiencePlayer({ experience: await readArtifact() });
  player.start();
  player.continue();

  const selection = player.selectDecision("DEC-INSPECT");
  assert.equal(selection.interaction, "selection");
  assert.equal(selection.selectedDecision, "DEC-INSPECT");
  assert.deepEqual(selection.decisionHistory, [{
    stageId: "STAGE-INCIDENT",
    decisionId: "DEC-INSPECT",
    action: "Inspect available evidence."
  }]);

  const next = player.continue();
  assert.equal(next.interaction, "stage");
  assert.equal(next.currentStage.id, "STAGE-VALIDATE");
  assert.deepEqual(next.progress, { currentStage: 2, totalStages: 2 });
});

test("completes every stage and restarts without persistence", async () => {
  const artifact = await readArtifact();
  const player = new ExperiencePlayer({ experience: artifact });
  player.start();
  player.continue();

  artifact.public.stages.forEach((stage, index) => {
    player.selectDecision(stage.decisions[0].id);
    const state = player.continue();
    if (index < artifact.public.stages.length - 1) {
      assert.equal(state.currentStage.id, artifact.public.stages[index + 1].id);
    }
  });

  const completed = player.getState();
  assert.equal(completed.state, ExperiencePlayerState.Completed);
  assert.equal(completed.completionStatus, ExperienceCompletionStatus.Completed);
  assert.equal(completed.interaction, "completion");
  assert.equal(completed.currentStage, null);
  assert.equal(completed.decisionHistory.length, 2);

  const reset = player.reset();
  assert.equal(reset.state, ExperiencePlayerState.NotStarted);
  assert.equal(reset.interaction, "start");
  assert.deepEqual(reset.decisionHistory, []);
});

test("rejects unavailable actions and decisions without changing state", async () => {
  const player = new ExperiencePlayer({ experience: await readArtifact() });
  const initial = player.getState();

  assert.throws(
    () => player.selectDecision("DEC-UNKNOWN"),
    error => error instanceof ExperiencePlayerError && error.code === "INVALID_PLAYER_STATE"
  );
  assert.deepEqual(player.getState(), initial);

  player.start();
  player.continue();
  const active = player.getState();
  assert.throws(
    () => player.selectDecision("DEC-UNKNOWN"),
    error => error instanceof ExperiencePlayerError && error.code === "INVALID_DECISION"
  );
  assert.deepEqual(player.getState(), active);
});

test("rejects unsupported, incorrect and structurally invalid artifacts", async () => {
  const artifact = await readArtifact();
  const unsupported = clone(artifact);
  unsupported.web_artifact_version = "2.0.0";
  const missingStages = clone(artifact);
  missingStages.public.stages = [];
  const duplicateDecision = clone(artifact);
  duplicateDecision.public.stages[1].decisions[0].id =
    duplicateDecision.public.stages[0].decisions[0].id;

  assert.throws(
    () => new ExperiencePlayer({ experience: unsupported }),
    error => error.code === "UNSUPPORTED_CONTRACT_VERSION"
  );
  [null, { experience: {} }, missingStages, duplicateDecision].forEach(candidate => {
    assert.throws(
      () => new ExperiencePlayer({ experience: candidate }),
      error => ["INVALID_EXPERIENCE_MODEL", "UNSUPPORTED_CONTRACT_VERSION"].includes(error.code)
    );
  });
});

test("supports future Generated Web Artifact v1 experiences without ID-specific logic", async () => {
  const artifact = await readArtifact();
  artifact.identity.id = "EXP-GENERIC-MACHINE-001";
  artifact.metadata.slug = "generic-machine-experience";
  artifact.metadata.title = "Generic machine experience";

  const player = new ExperiencePlayer({ experience: artifact });
  assert.equal(player.getState().experience.id, "EXP-GENERIC-MACHINE-001");

  const source = await readFile(new URL("../experiencePlayer.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /EXP-[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}/);
});

test("is deterministic, non-mutating and returns deeply immutable state", async () => {
  const source = await readArtifact();
  const before = clone(source);
  const first = new ExperiencePlayer({ experience: source });
  const second = new ExperiencePlayer({ experience: clone(source) });

  [first, second].forEach(player => {
    player.start();
    player.continue();
    player.selectDecision("DEC-INSPECT");
    player.continue();
  });

  assert.deepEqual(first.getState(), second.getState());
  assert.deepEqual(source, before);
  assert.equal(Object.isFrozen(source), false);
  assert.equal(Object.isFrozen(first.getState()), true);
  assert.equal(Object.isFrozen(first.getState().decisionHistory), true);
});

test("the browser Player source contains no reserved runtime implementation", async () => {
  const source = await readFile(new URL("../experiencePlayer.js", import.meta.url), "utf8");
  const reserved = [
    "private",
    "root_cause",
    "scoring",
    "correct_answer",
    "rationale",
    "consequence",
    "debrief",
    "fault_model",
    "diagnostic_model"
  ];

  reserved.forEach(term => assert.equal(source.includes(term), false, term));
});
