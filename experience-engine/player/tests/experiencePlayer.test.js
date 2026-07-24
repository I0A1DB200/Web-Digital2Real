import assert from "node:assert/strict";
import test from "node:test";

import {
  ExperienceCompletionStatus,
  ExperiencePlayer,
  ExperiencePlayerState
} from "../experiencePlayer.js";

function createExperience() {
  return {
    experience: {
      id: "EXP-TEST-PLAYER-001",
      version: "2.0",
      slug: "player-test",
      title: "Player test",
      summary: "A normalized test experience.",
      difficulty: "foundation",
      estimated_duration: 10
    },
    competencies: [{ id: "COMP-01" }],
    learning_objectives: [{ id: "OBJ-01" }],
    scenario: {
      initial_context: "A machine is stopped.",
      operational_state: "Stopped",
      initiating_event: "A fault occurred.",
      learner_role: "Engineer",
      safety_context: { safe_state: "Stopped", intervention_constraints: [] }
    },
    stages: [
      {
        id: "STAGE-01",
        title: "Observe",
        situation: "The machine is stopped.",
        objective: "Inspect initial evidence.",
        available_evidence: ["EVID-INITIAL"],
        decisions: ["DEC-INSPECT", "DEC-UNSAFE"]
      },
      {
        id: "STAGE-02",
        title: "Recover",
        situation: "The cause is isolated.",
        objective: "Validate recovery.",
        available_evidence: ["EVID-DIAGNOSTIC"],
        decisions: ["DEC-COMPLETE", "DEC-WARN"]
      }
    ],
    evidence: [
      {
        id: "EVID-INITIAL",
        type: "initial_observation",
        source: "Field",
        content: "The machine is stationary.",
        interpretation: "Movement is absent.",
        reliability: "high",
        revealed_by: []
      },
      {
        id: "EVID-DIAGNOSTIC",
        type: "diagnostic",
        source: "Controller",
        content: "The prerequisite is incomplete.",
        interpretation: "The fault is isolated.",
        reliability: "confirmed",
        revealed_by: ["DEC-INSPECT"]
      },
      {
        id: "EVID-RESULT",
        type: "functional_test",
        source: "Controlled test",
        content: "Operation is restored.",
        interpretation: "Recovery is validated.",
        reliability: "confirmed",
        revealed_by: ["DEC-COMPLETE"]
      }
    ],
    decisions: [
      {
        id: "DEC-INSPECT",
        stage_id: "STAGE-01",
        action: "Inspect the prerequisite.",
        rationale: "Use evidence first.",
        classification: "strong",
        consequence: "The cause is isolated.",
        evidence_revealed: ["EVID-DIAGNOSTIC"],
        next_stage: "STAGE-02",
        score_effect: 20,
        safety_effect: 30,
        time_cost: 3
      },
      {
        id: "DEC-UNSAFE",
        stage_id: "STAGE-01",
        action: "Bypass the safety gate.",
        rationale: "Unsafe shortcut.",
        classification: "unsafe",
        consequence: "The action is blocked.",
        evidence_revealed: [],
        next_stage: "BLOCKED",
        score_effect: -50,
        safety_effect: -50,
        time_cost: 1
      },
      {
        id: "DEC-COMPLETE",
        stage_id: "STAGE-02",
        action: "Validate and complete.",
        rationale: "Confirm complete recovery.",
        classification: "strong",
        consequence: "Recovery is complete.",
        evidence_revealed: ["EVID-RESULT"],
        next_stage: "COMPLETE",
        score_effect: 40,
        safety_effect: 30,
        time_cost: 4
      },
      {
        id: "DEC-WARN",
        stage_id: "STAGE-02",
        action: "Stop after partial validation.",
        rationale: "Recovery evidence is incomplete.",
        classification: "weak",
        consequence: "The session completes with warnings.",
        evidence_revealed: [],
        next_stage: "COMPLETE",
        score_effect: -10,
        safety_effect: 15,
        time_cost: 1
      }
    ],
    diagnostic_model: {
      hypotheses: [{ id: "HYP-PRIVATE", statement: "Private root cause" }],
      confirmed_root_cause: "HYP-PRIVATE",
      rejected_hypotheses: [],
      critical_path: ["DEC-INSPECT", "DEC-COMPLETE"]
    },
    evaluation: {
      dimensions: [],
      scoring: {
        initial_score: 50,
        minimum_score: 0,
        maximum_score: 100,
        safety_threshold: 40
      },
      completion_conditions: ["Complete the strong path."]
    },
    debrief: {
      fault_summary: "Private root cause",
      correct_reasoning: ["Inspect first."],
      common_errors: [],
      recovery: ["Validate recovery."],
      prevention: [],
      engineering_lessons: ["Evidence before action."]
    },
    references: {
      notebook: ["Notebook topic"],
      vendor_documentation: [],
      standards: []
    },
    web: {
      publication_status: "technical_review",
      route: "/experiences/player-test",
      cover_image: "none",
      tags: [],
      featured: false
    },
    metadata: {
      created_at: "2026-07-24",
      updated_at: "2026-07-24",
      author: "Test",
      reviewer: "Test",
      technical_validation: { status: "pending", reviewed_at: null, evidence: [] }
    }
  };
}

function createPlayer() {
  return new ExperiencePlayer({ experience: createExperience() });
}

test("starts a session from a normalized immutable model", () => {
  const source = createExperience();
  const player = new ExperiencePlayer({ experience: source });
  source.experience.title = "Changed externally";

  const initial = player.getSnapshot();
  assert.equal(initial.state, ExperiencePlayerState.NotStarted);
  assert.equal(initial.experience.title, "Player test");
  assert.deepEqual(initial.revealedEvidence.map(item => item.id), ["EVID-INITIAL"]);

  const active = player.start({ timestamp: 10 });
  assert.equal(active.state, ExperiencePlayerState.Active);
  assert.equal(active.startedAt, 10);
  assert.equal(active.currentStage.id, "STAGE-01");
  assert.deepEqual(active.currentStage.decisions, [
    { id: "DEC-INSPECT", action: "Inspect the prerequisite." },
    { id: "DEC-UNSAFE", action: "Bypass the safety gate." }
  ]);
});

test("does not expose private diagnosis or debrief during an active session", () => {
  const snapshot = createPlayer().start({ timestamp: 0 });
  const serialized = JSON.stringify(snapshot);

  assert.equal(snapshot.debrief, null);
  assert.deepEqual(snapshot.notebookReferences, []);
  assert.equal(serialized.includes("Private root cause"), false);
  assert.equal(serialized.includes("diagnostic_model"), false);
});

test("records decisions and progressively reveals evidence", () => {
  const player = createPlayer();
  player.start({ timestamp: 10 });
  const snapshot = player.selectDecision("DEC-INSPECT", { timestamp: 12 });

  assert.equal(snapshot.currentStage.id, "STAGE-02");
  assert.deepEqual(snapshot.revealedEvidence.map(item => item.id), ["EVID-INITIAL", "EVID-DIAGNOSTIC"]);
  assert.deepEqual(snapshot.currentStage.evidence.map(item => item.id), ["EVID-DIAGNOSTIC"]);
  assert.equal(snapshot.score, 70);
  assert.equal(snapshot.safetyScore, 30);
  assert.equal(snapshot.elapsedTime, 3);
  assert.deepEqual(snapshot.selectedDecisions, ["DEC-INSPECT"]);
  assert.deepEqual(snapshot.decisionHistory[0], {
    decisionId: "DEC-INSPECT",
    originatingStage: "STAGE-01",
    timestamp: 12,
    resultingStage: "STAGE-02",
    evidenceRevealed: ["EVID-DIAGNOSTIC"],
    scoreEffect: 20,
    safetyEffect: 30,
    timeCost: 3
  });
});

test("rejects unavailable decisions and non-monotonic timestamps", () => {
  const player = createPlayer();
  player.start({ timestamp: 10 });

  assert.throws(() => player.selectDecision("DEC-COMPLETE", { timestamp: 11 }), error => error.code === "DECISION_NOT_AVAILABLE");
  assert.throws(() => player.selectDecision("DEC-INSPECT", { timestamp: 9 }), error => error.code === "NON_MONOTONIC_TIMESTAMP");
  assert.equal(player.getSnapshot().currentStage.id, "STAGE-01");
});

test("completes the strong path and reveals terminal content", () => {
  const player = createPlayer();
  player.start({ timestamp: 0 });
  player.selectDecision("DEC-INSPECT", { timestamp: 1 });
  const completed = player.selectDecision("DEC-COMPLETE", { timestamp: 2 });

  assert.equal(completed.state, ExperiencePlayerState.Completed);
  assert.equal(completed.completionStatus, ExperienceCompletionStatus.Completed);
  assert.equal(completed.currentStage, null);
  assert.equal(completed.score, 100);
  assert.equal(completed.safetyScore, 60);
  assert.equal(completed.debrief.fault_summary, "Private root cause");
  assert.deepEqual(completed.notebookReferences, ["Notebook topic"]);
  assert.throws(() => player.selectDecision("DEC-COMPLETE", { timestamp: 3 }), error => error.code === "INVALID_PLAYER_STATE");
});

test("marks weak terminal recovery as completed with warnings", () => {
  const player = createPlayer();
  player.start({ timestamp: 0 });
  player.selectDecision("DEC-INSPECT", { timestamp: 1 });
  const completed = player.selectDecision("DEC-WARN", { timestamp: 2 });

  assert.equal(completed.state, ExperiencePlayerState.Completed);
  assert.equal(completed.completionStatus, ExperienceCompletionStatus.CompletedWithWarnings);
});

test("blocks unsafe terminal actions without revealing new evidence", () => {
  const player = createPlayer();
  player.start({ timestamp: 0 });
  const blocked = player.selectDecision("DEC-UNSAFE", { timestamp: 1 });

  assert.equal(blocked.state, ExperiencePlayerState.Blocked);
  assert.equal(blocked.completionStatus, ExperienceCompletionStatus.Blocked);
  assert.equal(blocked.score, 0);
  assert.equal(blocked.safetyScore, -50);
  assert.deepEqual(blocked.revealedEvidence.map(item => item.id), ["EVID-INITIAL"]);
});

test("blocks completion below the configured safety threshold", () => {
  const experience = createExperience();
  const completion = experience.decisions.find(decision => decision.id === "DEC-COMPLETE");
  completion.safety_effect = 0;
  const player = new ExperiencePlayer({ experience });
  player.start({ timestamp: 0 });
  player.selectDecision("DEC-INSPECT", { timestamp: 1 });

  const blocked = player.selectDecision("DEC-COMPLETE", { timestamp: 2 });

  assert.equal(blocked.state, ExperiencePlayerState.Blocked);
  assert.equal(blocked.completionStatus, ExperienceCompletionStatus.Blocked);
  assert.equal(blocked.safetyScore, 30);
  assert.equal(blocked.decisionHistory.at(-1).resultingStage, "BLOCKED");
});

test("reset clears session state while preserving the static experience", () => {
  const player = createPlayer();
  player.start({ timestamp: 5 });
  player.selectDecision("DEC-INSPECT", { timestamp: 6 });
  const reset = player.reset();

  assert.equal(reset.state, ExperiencePlayerState.NotStarted);
  assert.equal(reset.score, 50);
  assert.equal(reset.safetyScore, 0);
  assert.equal(reset.startedAt, null);
  assert.deepEqual(reset.selectedDecisions, []);
  assert.deepEqual(reset.visitedStages, ["STAGE-01"]);
  assert.deepEqual(reset.revealedEvidence.map(item => item.id), ["EVID-INITIAL"]);
});

test("returns deeply immutable snapshots", () => {
  const snapshot = createPlayer().start({ timestamp: 0 });

  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.currentStage), true);
  assert.equal(Object.isFrozen(snapshot.currentStage.decisions), true);
  assert.equal(Object.isFrozen(snapshot.revealedEvidence[0]), true);
  assert.throws(() => {
    snapshot.currentStage.title = "Changed";
  }, TypeError);
});

test("replays identical choices deterministically", () => {
  const execute = () => {
    const player = createPlayer();
    player.start({ timestamp: 100 });
    player.selectDecision("DEC-INSPECT", { timestamp: 110 });
    return player.selectDecision("DEC-COMPLETE", { timestamp: 120 });
  };

  assert.deepEqual(execute(), execute());
});

test("rejects malformed normalized references before a session starts", () => {
  const experience = createExperience();
  experience.stages[0].decisions = ["DEC-MISSING"];

  assert.throws(() => new ExperiencePlayer({ experience }), error => error.code === "INVALID_EXPERIENCE_MODEL");
});
