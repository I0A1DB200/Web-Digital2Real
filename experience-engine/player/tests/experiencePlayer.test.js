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

async function v2Artifact(decisionPointCount = 2) {
  const value = await readArtifact();
  value.web_artifact_version = "2.0.0";
  value.public.evidence = Array.from({ length: decisionPointCount }, (_, index) => ({
    id: `EVID-${index + 1}`, type: "diagnostic", source: "Controlled inspection",
    content: `Evidence ${index + 1}`, reliability: "confirmed", visibility: "public"
  }));
  value.public.stages = Array.from({ length: decisionPointCount }, (_, index) => ({
    id: `STAGE-${index + 1}`, title: `Stage ${index + 1}`, situation: `Situation ${index + 1}`,
    phase: index === 0 ? "incident" : index === decisionPointCount - 1 ? "solution" : "investigation",
    decisions: [
      { id: `DEC-${index + 1}-ADVANCE`, action: "Apply supported action", action_token: `ACTION-${index + 1}-1` },
      { id: `DEC-${index + 1}-RETRY`, action: "Review an unsupported action", action_token: `ACTION-${index + 1}-2` }
    ]
  }));
  value.public.interactions = value.public.stages.flatMap((stage, index) => [
    {
      action_token: `ACTION-${index + 1}-1`, outcome: "advance",
      next: index === decisionPointCount - 1 ? "COMPLETE" : `STAGE-${index + 2}`,
      unlocks: [`EVID-${index + 1}`]
    },
    { action_token: `ACTION-${index + 1}-2`, outcome: "retry", message: "Review the available evidence and try again." }
  ]);
  value.public.evaluation_policy = {
    provisional: true,
    outcomes: ["PASS", "PASS_WITH_GUIDANCE", "RETRY_RECOMMENDED"],
    mastery_outcomes: ["PASS"],
    thresholds: [
      { outcome: "RETRY_RECOMMENDED", minimum: 0, maximum: 49 },
      { outcome: "PASS_WITH_GUIDANCE", minimum: 50, maximum: 79 },
      { outcome: "PASS", minimum: 80, maximum: 100 }
    ]
  };
  return value;
}

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
  unsupported.web_artifact_version = "3.0.0";
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

test("dispatches Player V2 and retries without progression or evidence", async () => {
  const player = new ExperiencePlayer({ experience: await v2Artifact() });
  player.start(); player.continue();
  const first = player.selectDecision("DEC-1-RETRY");
  assert.equal(first.currentStage.id, "STAGE-1");
  assert.equal(first.attemptsByDecision["STAGE-1"], 1);
  assert.equal(first.feedback.message, "Review the available evidence and try again.");
  assert.deepEqual(first.unlockedEvidence, []);
  const second = player.selectDecision("DEC-1-RETRY");
  assert.equal(second.currentStage.id, "STAGE-1");
  assert.equal(second.attemptsByDecision["STAGE-1"], 2);
  assert.equal(second.decisionHistory.length, 2);
});

test("Player V2 advances only through explicit transition and unlocks declared evidence", async () => {
  const artifact = await v2Artifact(3);
  artifact.public.interactions.find(item => item.action_token === "ACTION-1-1").next = "STAGE-3";
  const player = new ExperiencePlayer({ experience: artifact });
  player.start(); player.continue();
  player.selectDecision("DEC-1-RETRY");
  const advanced = player.selectDecision("DEC-1-ADVANCE");
  assert.equal(advanced.currentStage.id, "STAGE-3");
  assert.equal(advanced.attemptsByDecision["STAGE-1"], 2);
  assert.deepEqual(advanced.resolvedDecisions, ["STAGE-1"]);
  assert.deepEqual(advanced.unlockedEvidence, ["EVID-1"]);
  assert.equal(advanced.feedback, null);
});

test("resolved V2 decision points cannot create additional attempts", async () => {
  const artifact = await v2Artifact();
  artifact.public.interactions.find(item => item.action_token === "ACTION-1-1").next = "STAGE-1";
  const player = new ExperiencePlayer({ experience: artifact });
  player.start(); player.continue(); player.selectDecision("DEC-1-ADVANCE");
  assert.throws(() => player.selectDecision("DEC-1-RETRY"), error => error.code === "DECISION_ALREADY_RESOLVED");
  assert.equal(player.getState().attemptsByDecision["STAGE-1"], 1);
});

test("Player V2 evaluates PASS, PASS_WITH_GUIDANCE and RETRY_RECOMMENDED at COMPLETE", async () => {
  const scenarios = [[4, "PASS", true], [3, "PASS_WITH_GUIDANCE", false], [2, "RETRY_RECOMMENDED", false]];
  for (const [firstAttemptCorrect, outcome, mastered] of scenarios) {
    const player = new ExperiencePlayer({ experience: await v2Artifact(5) });
    player.start(); player.continue();
    for (let index = 0; index < 5; index += 1) {
      if (index >= firstAttemptCorrect) player.selectDecision(`DEC-${index + 1}-RETRY`);
      player.selectDecision(`DEC-${index + 1}-ADVANCE`);
    }
    const state = player.getState();
    assert.equal(state.interaction, "completion");
    assert.equal(state.completionStatus, "completed");
    assert.deepEqual(state.evaluationResult, {
      totalDecisions: 5,
      firstAttemptCorrect,
      additionalAttempts: 5 - firstAttemptCorrect,
      firstAttemptSuccessRatio: { numerator: firstAttemptCorrect, denominator: 5 },
      displayPercentage: firstAttemptCorrect * 20,
      outcome,
      mastered
    });
  }
});

test("Player V2 reset clears transient session evaluation state", async () => {
  const player = new ExperiencePlayer({ experience: await v2Artifact() });
  player.start(); player.continue(); player.selectDecision("DEC-1-RETRY"); player.selectDecision("DEC-1-ADVANCE");
  const reset = player.reset();
  assert.deepEqual(reset.attemptsByDecision, {});
  assert.deepEqual(reset.resolvedDecisions, []);
  assert.deepEqual(reset.unlockedEvidence, []);
  assert.deepEqual(reset.decisionHistory, []);
  assert.equal(reset.feedback, null);
  assert.equal(reset.evaluationResult, null);
});

test("Player V2 imports only the public evaluator boundary and contains no thresholds", async () => {
  const source = await readFile(new URL("../experiencePlayer.js", import.meta.url), "utf8");
  assert.match(source, /\.\.\/evaluation\/experienceEvaluator\.js/);
  assert.doesNotMatch(source, /minimum:\s*(?:50|80)|maximum:\s*(?:49|79)/);
  assert.doesNotMatch(source, /decision_logic|is_correct|rationale|fault_model|diagnostic_model/);
});
