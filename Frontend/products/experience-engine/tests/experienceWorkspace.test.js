import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createWorkspaceProjection } from "../components/experienceWorkspace.js";

function state(overrides = {}) {
  return {
    interaction: "stage",
    experience: {
      title: "Generic experience",
      summary: "Generic summary"
    },
    completionStatus: "active",
    progress: { currentStage: 2, totalStages: 7, visitedStages: 2 },
    context: {
      initialContext: "Initial context",
      operationalState: "Stopped",
      initiatingEvent: "Event",
      learnerRole: "Engineer",
      safetyContext: {},
      businessImpact: null
    },
    currentStage: {
      id: "STAGE-02",
      title: "Stage",
      situation: "Situation",
      objective: "Objective",
      evidence: [],
      decisions: [{ id: "DEC-01", action: "Inspect" }]
    },
    revealedEvidence: [{ id: "EVID-01", source: "Field", content: "Stopped" }],
    selectedDecisions: ["DEC-00"],
    decisionHistory: [{ decisionId: "DEC-00", action: "Observe safely" }],
    lastOutcome: null,
    debrief: null,
    notebookReferences: [],
    ...overrides
  };
}

test("projects the Player state without deriving diagnostic logic", () => {
  const projection = createWorkspaceProjection(state());

  assert.equal(projection.phase, "stage");
  assert.deepEqual(projection.progress, { currentStage: 2, totalStages: 7, visitedStages: 2 });
  assert.deepEqual(projection.decisions, [{ id: "DEC-01", action: "Inspect" }]);
  assert.deepEqual(projection.evidence, [{ id: "EVID-01", source: "Field", content: "Stopped" }]);
  assert.equal(projection.decisionHistory[0].action, "Observe safely");
});

test("projects consequence and debrief phases from Player-owned state", () => {
  const consequence = createWorkspaceProjection(state({
    interaction: "consequence",
    lastOutcome: { classification: "strong", consequence: "Evidence found" }
  }));
  const debrief = createWorkspaceProjection(state({
    interaction: "debrief",
    completionStatus: "completed",
    debrief: { fault_summary: "Root cause" }
  }));

  assert.equal(consequence.consequence.consequence, "Evidence found");
  assert.equal(debrief.result, "completed");
  assert.equal(debrief.debrief.fault_summary, "Root cause");
});

test("workspace source exports every reusable component and avoids YAML interpretation", async () => {
  const source = await readFile(
    new URL("../components/experienceWorkspace.js", import.meta.url),
    "utf8"
  );
  const components = [
    "ExperienceWorkspace",
    "ExperienceHeader",
    "StagePanel",
    "EvidencePanel",
    "DecisionPanel",
    "ConsequencePanel",
    "ProgressIndicator",
    "DebriefPanel"
  ];

  components.forEach(component => {
    assert.match(source, new RegExp(`export function ${component}\\b`));
  });
  assert.doesNotMatch(source, /ya?ml|fault_model|diagnostic_model/i);
  assert.doesNotMatch(source, /EXP-SIEMENS-DRIVE-002/);
});

test("application integrates the generic Experience Lab entry point", async () => {
  const [app, site, styles] = await Promise.all([
    readFile(new URL("../../../app.js", import.meta.url), "utf8"),
    readFile(new URL("../../../data/site.js", import.meta.url), "utf8"),
    readFile(new URL("../../../styles.css", import.meta.url), "utf8")
  ]);

  assert.match(app, /export async function openExperience\(experienceId\)/);
  assert.match(app, /window\.openExperience = openExperience/);
  assert.match(app, /"experience-lab": renderExperienceLabView/);
  assert.match(site, /view: "experience-lab"/);
  assert.match(styles, /experience-workspace\.css/);
});
