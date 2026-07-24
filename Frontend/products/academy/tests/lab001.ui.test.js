import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createLab001Presentation } from "../components/lab001View.js";
import { createLab001Session } from "../labs/lab-001/session.js";

function startSession() {
  const session = createLab001Session();
  session.initialize();
  return session;
}

function completeSession() {
  const session = startSession();
  session.pressStart(); session.runTicks(2); session.releaseStart(); session.advanceTick();
  session.pressStop(); session.runTicks(2); session.pressStart(); session.advanceTick();
  session.releaseStart(); session.releaseStop(); session.pressStart(); session.runTicks(2);
  session.engageEmergencyStop(); session.advanceTick(); session.pressReset(); session.advanceTick();
  session.releaseEmergencyStop(); session.releaseReset(); session.releaseStart(); session.advanceTick();
  session.pressStart(); session.runTicks(2);
  return session;
}

test("presentation derives the initial stopped state from an immutable runtime snapshot", () => {
  const session = startSession();
  const snapshot = session.getSnapshot();
  const presentation = createLab001Presentation(snapshot);
  assert.equal(presentation.status, "Ready");
  assert.equal(presentation.motor, "Off");
  assert.equal(presentation.conveyor, "Stopped");
  assert.equal(presentation.emergency, false);
  assert.equal(presentation.validation, "0 of 8 complete");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(presentation), true);
});

test("Start, release, Stop and Stop priority are reflected from the real session", () => {
  const session = startSession();
  session.pressStart();
  assert.equal(createLab001Presentation(session.runTicks(2)).conveyor, "Running");
  session.releaseStart();
  assert.equal(createLab001Presentation(session.advanceTick()).conveyor, "Running");
  session.pressStop();
  assert.equal(createLab001Presentation(session.runTicks(2)).conveyor, "Stopped");
  session.pressStart();
  assert.equal(createLab001Presentation(session.advanceTick()).conveyor, "Stopped");
});

test("Emergency and Reset presentation follow runtime command semantics", () => {
  const session = startSession();
  session.pressStart(); session.runTicks(2); session.engageEmergencyStop();
  assert.equal(createLab001Presentation(session.advanceTick()).status, "Emergency");
  session.pressReset(); session.advanceTick(); session.releaseEmergencyStop(); session.releaseReset(); session.releaseStart();
  const reset = session.advanceTick();
  assert.equal(createLab001Presentation(reset).status, "Stopped");
  assert.equal(reset.machine.state, "Stopped");
  session.pressStart();
  assert.equal(createLab001Presentation(session.runTicks(2)).status, "Running");
});

test("validation progress and completion are projections of runtime validation", () => {
  const session = startSession();
  session.pressStart();
  const progress = createLab001Presentation(session.runTicks(2));
  assert.equal(progress.objectives[0].state, "passed");
  assert.equal(progress.objectives[1].state, "current");
  const completed = completeSession();
  const presentation = createLab001Presentation(completed.getSnapshot());
  assert.equal(presentation.status, "Completed");
  assert.equal(presentation.validation, "Completed");
  assert.equal(presentation.objectives.every(objective => objective.state === "passed"), true);
});

test("full laboratory reset restores the canonical UI projection", () => {
  const session = completeSession();
  const reset = session.resetLab();
  const presentation = createLab001Presentation(reset);
  assert.equal(presentation.status, "Ready");
  assert.equal(presentation.conveyor, "Stopped");
  assert.equal(presentation.emergency, false);
  assert.equal(presentation.validation, "0 of 8 complete");
});

test("Academy UI source uses public session operations and no browser timing authority", async () => {
  const source = await readFile(new URL("../components/lab001View.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage/);
  assert.doesNotMatch(source, /session\.#[A-Za-z]|from ["'][^"']+\/(core|runtime|validation)\//);
  assert.match(source, /session\.applyLearnerCommand/);
  assert.match(source, /session\.runTicks/);
  assert.match(source, /session\.resetLab/);
  assert.match(source, /abortController\.abort/);
});

test("Academy stylesheet is scoped and consumes brand variables", async () => {
  const source = await readFile(new URL("../styles/lab001.css", import.meta.url), "utf8");
  assert.doesNotMatch(source, /(^|\n)\s*(body|html|:root|\.notebook|\.about|\.topbar|\.editorial-hero)\b/);
  assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  assert.match(source, /prefers-reduced-motion/);
});
