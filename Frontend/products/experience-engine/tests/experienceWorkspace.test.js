import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { ExperiencePlayer } from "../../../../experience-engine/player/experiencePlayer.js";
import { createEnvironmentNavigator } from "../components/environmentNavigator.js";
import { chooseEnvironmentPopoverPlacement } from "../components/environmentPopoverPosition.js";
import { createEnvironmentProgressStore } from "../components/environmentProgressStore.js";
import {
  CompletionPanel,
  createExperienceProgressResult,
  createExperienceWorkspace,
  createWorkspaceProjection,
  DecisionPanel
} from "../components/experienceWorkspace.js";

const artifactUrl = new URL(
  "../../../../experience-engine/validation/fixtures/generated-web-artifact-v1-valid.json",
  import.meta.url
);
const readArtifact = async () => JSON.parse(await readFile(artifactUrl, "utf8"));

function createState(overrides = {}) {
  return {
    interaction: "stage",
    experience: {
      title: "Generic experience",
      summary: "Generic summary"
    },
    completionStatus: "active",
    progress: { currentStage: 2, totalStages: 7 },
    context: {
      initial_context: "Initial context",
      operational_state: "Stopped",
      initiating_event: "Event",
      learner_role: "Engineer",
      safety_context: {}
    },
    currentStage: {
      id: "STAGE-02",
      title: "Stage",
      situation: "Situation",
      decisions: [{ id: "DEC-01", action: "Inspect" }]
    },
    selectedDecision: null,
    decisionHistory: [],
    media: [],
    completion: null,
    visual: {
      educational_purpose: "Compare observable states.",
      representation: "planned"
    },
    ...overrides
  };
}

test("projects only the public Player state", () => {
  const projection = createWorkspaceProjection(createState());

  assert.equal(projection.phase, "stage");
  assert.deepEqual(projection.progress, { currentStage: 2, totalStages: 7 });
  assert.deepEqual(projection.stage.decisions, [{ id: "DEC-01", action: "Inspect" }]);
  assert.equal(projection.visual.representation, "planned");
});

test("projects a selected decision and public completion", () => {
  const selection = createWorkspaceProjection(createState({
    interaction: "selection",
    selectedDecision: "DEC-01",
    decisionHistory: [{ decisionId: "DEC-01", action: "Inspect" }]
  }));
  const completion = createWorkspaceProjection(createState({
    interaction: "completion",
    completionStatus: "completed",
    currentStage: null,
    decisionHistory: [{ decisionId: "DEC-01", action: "Inspect" }]
  }));

  assert.equal(selection.selectedDecision.action, "Inspect");
  assert.equal(completion.status, "completed");
  assert.equal(completion.stage, null);
});

test("a generated artifact opens and completes through Experience Lab without console access", async () => {
  const artifact = await readArtifact();
  artifact.identity.id = "EXP-SENSOR-SIGNAL-001";
  artifact.metadata.title = "Sensor ON, PLC Input OFF";
  artifact.metadata.summary = "Trace a field signal from the sensor to the controller input.";
  const catalog = {
    format: "Digital2Real Generated Web Artifact Catalog",
    version: 1,
    mode: "preview",
    experiences: [{
      id: artifact.identity.id,
      editorialId: "EE-0001",
      access: "free",
      class: artifact.identity.class,
      title: artifact.metadata.title,
      summary: artifact.metadata.summary,
      estimatedDuration: artifact.metadata.estimated_duration,
      cover: "assets/EXP-SENSOR-SIGNAL-001/ART-001-machine-overview.png",
      path: `experiences/${artifact.identity.id}.json`
    }],
    environments: [{
      id: "ENV-001",
      contractVersion: "2.0.0",
      slug: "automated-factory",
      title: "Automated Factory",
      lifecycle: "preview",
      capacity: 10,
      background: "environments/ENV-001-automated-factory.png",
      width: 1672,
      height: 941,
      theory: {
        defaultLocale: "es",
        sectionIds: ["TH-01-FIRST", "TH-02-SECOND"],
        locales: { es: "environments/ENV-001/theory.es.json", en: "environments/ENV-001/theory.en.json" }
      },
      hotspots: [{ experienceEditorialId: "EE-0001", x: 8.6, y: 36.8 }]
    }, {
      id: "ENV-002", slug: "motion-cell", title: "Motion Cell", lifecycle: "preview", capacity: 10,
      background: "environments/ENV-002-motion-pneumatics-profinet-cell.png",
      width: 1672, height: 941, hotspots: []
    }, {
      id: "ENV-003", slug: "diagnostic-cell", title: "Diagnostic Cell", lifecycle: "preview", capacity: 10,
      background: "environments/ENV-003-sequence-safety-hmi-diagnostic-cell.png",
      width: 1672, height: 941, hotspots: []
    }]
  };
  const documentRef = new FakeDocument();
  const responses = new Map([
    ["./generated/experience-engine/catalog.json", catalog],
    ["./generated/experience-engine/environments/ENV-001/theory.es.json", {
      theory_artifact_version: "1.0.0", environment_id: "ENV-001", locale: "es",
      sections: [
        { id: "TH-01-FIRST", title: "Ruta de señal", body: "Primera sección.", media_ids: ["TH-MEDIA-01"] },
        { id: "TH-02-SECOND", title: "Referencia PNP", body: "Segunda sección.", media_ids: [] }
      ],
      media: [{ id: "TH-MEDIA-01", type: "image", src: "environments/ENV-001/media/theory.png", alt: "Ruta de señal" }]
    }],
    [`./generated/experience-engine/experiences/${artifact.identity.id}.json`, artifact]
  ]);
  const workspace = createExperienceWorkspace({
    documentRef,
    fetchImpl: async location => ({
      ok: responses.has(location),
      status: responses.has(location) ? 200 : 404,
      json: async () => structuredClone(responses.get(location))
    }),
    importPlayer: async () => ({ ExperiencePlayer })
  });

  await workspace.initialise();
  assert.equal(workspace.element.findAll(element => element.className === "environment-card").length, 3);
  workspace.element.find(element => element.attributes["aria-label"] === "Open environment: Motion Cell").click();
  assert.match(workspace.element.text, /being prepared/);
  assert.match(workspace.element.text, /0 \/ 0/);
  findButton(workspace.element, "Back to environments").click();
  workspace.element.find(element => element.attributes["aria-label"] === "Open environment: Diagnostic Cell").click();
  assert.match(workspace.element.text, /being prepared/);
  assert.match(workspace.element.text, /0 \/ 0/);
  findButton(workspace.element, "Back to environments").click();
  const environment = workspace.element.find(
    element => element.attributes["aria-label"] === "Open environment: Automated Factory"
  );
  environment.click();
  assert.match(workspace.element.text, /0 \/ 1/);
  await findButton(workspace.element, "Open Theory").click();
  assert.match(workspace.element.text, /Ruta de señal/);
  assert.doesNotMatch(workspace.element.text, /Referencia PNP/);
  const theoryImage = workspace.element.find(element => element.className === "experience-media__asset");
  assert.equal(theoryImage.src, "./generated/experience-engine/environments/ENV-001/media/theory.png");
  findButton(workspace.element, "Continue Theory").click();
  assert.match(workspace.element.text, /Referencia PNP/);
  findButton(workspace.element, "Complete Theory").click();
  assert.match(workspace.element.text, /Theory 2 \/ 2/);
  const hotspot = workspace.element.find(element => element.className === "environment-hotspot");
  assert.equal(hotspot.tagName, "BUTTON");
  assert.equal(hotspot.attributes["aria-label"], "Inspect Sensor ON, PLC Input OFF");
  assert.equal(hotspot.style.properties["--hotspot-x"], "8.6%");
  assert.equal(hotspot.style.properties["--hotspot-y"], "36.8%");
  hotspot.click();
  assert.equal(hotspot.attributes["aria-expanded"], "true");
  assert.equal(workspace.element.findAll(element => element.className === "environment-popover").length, 1);
  assert.equal(workspace.element.find(element => element.className === "environment-view__details"), null);
  assert.match(workspace.element.text, /Sensor ON, PLC Input OFF/);
  assert.match(workspace.element.text, /Trace a field signal/);
  await findButton(workspace.element, "Begin investigation").click();
  assert.equal(workspace.getState().interaction, "start");
  assert.match(workspace.element.text, /material handling machine has stopped/i);

  findButton(workspace.element, "All experiences").click();
  assert.match(workspace.element.text, /0 \/ 1/);
  workspace.element.find(element => element.className === "environment-hotspot").click();
  await findButton(workspace.element, "Begin investigation").click();

  findButton(workspace.element, "Start experience").click();
  findButton(workspace.element, "Begin diagnosis").click();

  artifact.public.stages.forEach((stage, index) => {
    assert.equal(workspace.getState().currentStage.id, stage.id);
    findButton(workspace.element, stage.decisions[0].action).click();
    findButton(
      workspace.element,
      index === artifact.public.stages.length - 1 ? "Complete experience" : "Continue"
    ).click();
  });

  assert.equal(workspace.getState().interaction, "completion");
  assert.equal(workspace.getState().decisionHistory.length, 2);

  findButton(workspace.element, "Restart experience").click();
  assert.equal(workspace.getState().interaction, "start");
  findButton(workspace.element, "All experiences").click();
  assert.match(workspace.element.text, /1 \/ 1/);
});

test("renders safe errors for missing experiences and unsupported contracts", async () => {
  const documentRef = new FakeDocument();
  const catalog = { version: 1, experiences: [], environments: [] };
  const workspace = createExperienceWorkspace({
    documentRef,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => catalog }),
    importPlayer: async () => ({ ExperiencePlayer })
  });

  await workspace.initialise();
  await assert.rejects(workspace.openExperience("EXP-MISSING-MACHINE-001"));
  assert.match(workspace.element.text, /not available/);
  assert.doesNotMatch(workspace.element.text, /root_cause|scoring|fault_model/);
});

test("selects the document locale and falls back through generated catalog metadata", async () => {
  const artifact = await readArtifact();
  const documentRef = new FakeDocument();
  documentRef.documentElement = { lang: "en-GB" };
  const requests = [];
  const catalog = {
    version: 1,
    experiences: [{
      id: artifact.identity.id,
      editorialId: "EE-0001",
      access: "free",
      class: artifact.identity.class,
      title: "Título por defecto",
      summary: "Resumen por defecto",
      estimatedDuration: 35,
      defaultLocale: "es",
      locales: {
        es: "experiences/item.es.json",
        en: "experiences/item.en.json"
      },
      localizedMetadata: {
        es: { title: "Título por defecto", summary: "Resumen por defecto" },
        en: { title: "English title", summary: "English summary" }
      }
    }],
    environments: []
  };
  const responses = new Map([
    ["./generated/experience-engine/catalog.json", catalog],
    ["./generated/experience-engine/experiences/item.en.json", artifact]
  ]);
  const workspace = createExperienceWorkspace({
    documentRef,
    fetchImpl: async location => {
      requests.push(location);
      return {
        ok: responses.has(location),
        status: responses.has(location) ? 200 : 404,
        json: async () => structuredClone(responses.get(location))
      };
    },
    importPlayer: async () => ({ ExperiencePlayer })
  });

  await workspace.initialise();
  await workspace.openExperience(artifact.identity.id);
  assert.ok(requests.includes("./generated/experience-engine/experiences/item.en.json"));
});

test("maps completed Player V2 outcomes to the minimal progress boundary", () => {
  for (const [outcome, mastered] of [["PASS", true], ["PASS_WITH_GUIDANCE", false], ["RETRY_RECOMMENDED", false]]) {
    assert.deepEqual(createExperienceProgressResult({
      interaction: "completion", completionStatus: "completed", evaluationResult: { outcome, mastered }
    }), { completed: true, mastered });
  }
  assert.throws(() => createExperienceProgressResult({ interaction: "stage", completionStatus: "active" }));
});

test("presents Player V2 feedback and completion evaluation without evaluating or persisting it", async () => {
  const documentRef = new FakeDocument();
  const feedback = { decisionId: "DEC-01", message: "Review the evidence and try again.", attemptNumber: 2 };
  const evaluationResult = {
    totalDecisions: 5, firstAttemptCorrect: 3, additionalAttempts: 2,
    firstAttemptSuccessRatio: { numerator: 3, denominator: 5 }, displayPercentage: 60,
    outcome: "PASS_WITH_GUIDANCE", mastered: false
  };
  const projection = createWorkspaceProjection(createState({ feedback, evaluationResult }));
  const decisions = DecisionPanel({ documentRef, decisions: projection.stage.decisions, feedback: projection.feedback, onDecision() {} });
  const completion = CompletionPanel({
    documentRef,
    projection: createWorkspaceProjection(createState({ interaction: "completion", currentStage: null, evaluationResult })),
    onRestart() {}
  });

  assert.equal(projection.feedback, feedback);
  assert.equal(projection.evaluationResult, evaluationResult);
  assert.match(decisions.text, /Review the evidence and try again/);
  assert.match(completion.text, /First-attempt correct3 \/ 5/);
  assert.match(completion.text, /Additional attempts2/);
  assert.match(completion.text, /PASS WITH GUIDANCE/);
  const source = await readFile(new URL("../components/experienceWorkspace.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /evaluateExperience|mastery_outcomes|thresholds/);
});

test("keeps one accessible anchored popover and closes it through every supported interaction", () => {
  const documentRef = new FakeDocument();
  const opened = [];
  let resizeCallback = null;
  const navigator = createEnvironmentNavigator({
    documentRef,
    baseUrl: ".",
    environments: [{
      id: "ENV-TEST", slug: "test", title: "Test", lifecycle: "preview", capacity: 10,
      background: "environment.png", width: 1672, height: 941,
      hotspots: [
        { experienceEditorialId: "EE-0101", x: 25, y: 50 },
        { experienceEditorialId: "EE-0102", x: 75, y: 50 }
      ]
    }],
    experiences: [
      { id: "EXP-TEST-A-101", editorialId: "EE-0101", title: "First", summary: "First summary" },
      { id: "EXP-TEST-B-102", editorialId: "EE-0102", title: "Second", summary: "Second summary" }
    ],
    onOpenExperience: id => opened.push(id),
    resizeObserverFactory: callback => {
      resizeCallback = callback;
      return { observe() {}, disconnect() {} };
    },
    windowRef: new FakeEventTarget()
  });

  navigator.renderEnvironment("ENV-TEST");
  const hotspots = navigator.element.findAll(item => item.className === "environment-hotspot");
  hotspots[0].rect = { left: 190, top: 210, width: 20, height: 20 };
  hotspots[1].rect = { left: 590, top: 210, width: 20, height: 20 };
  hotspots[0].click();
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 1);
  assert.equal(hotspots[0].attributes["aria-expanded"], "true");
  assert.ok(hotspots[0].attributes["aria-controls"]);
  assert.ok(resizeCallback);
  resizeCallback();
  const positionedPopover = navigator.element.find(item => item.className === "environment-popover");
  assert.ok(positionedPopover.style.properties["--popover-x"]);
  assert.ok(positionedPopover.style.properties["--popover-y"]);

  hotspots[0].click();
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 0);
  assert.equal(documentRef.activeElement, hotspots[0]);

  hotspots[0].click();
  hotspots[1].click();
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 1);
  assert.match(navigator.element.text, /Second summary/);
  assert.equal(hotspots[0].attributes["aria-expanded"], "false");
  documentRef.dispatch("keydown", { key: "Escape" });
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 0);
  assert.equal(documentRef.activeElement, hotspots[1]);

  hotspots[1].click();
  documentRef.dispatch("click", { target: new FakeElement("div", documentRef) });
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 0);
  hotspots[0].click();
  findButton(navigator.element, "Begin investigation").click();
  assert.deepEqual(opened, ["EXP-TEST-A-101"]);
  assert.equal(navigator.element.findAll(item => item.className === "environment-popover").length, 0);
});

test("positions popovers inside the viewer, avoids hotspots and uses a deterministic docked fallback", () => {
  const input = {
    viewer: { x: 0, y: 0, width: 800, height: 450 },
    popover: { width: 300, height: 160 },
    anchor: { x: 100, y: 210, width: 20, height: 20 },
    obstacles: [{ x: 145, y: 150, width: 60, height: 140 }]
  };
  const placement = chooseEnvironmentPopoverPlacement(input);
  assert.notEqual(placement.placement, "right");
  assert.ok(placement.x >= 12 && placement.y >= 12);
  assert.ok(placement.x + input.popover.width <= input.viewer.width - 12);
  assert.ok(placement.y + input.popover.height <= input.viewer.height - 12);

  const blocked = chooseEnvironmentPopoverPlacement({
    ...input,
    obstacles: [{ x: 0, y: 0, width: 800, height: 450 }]
  });
  const repeated = chooseEnvironmentPopoverPlacement({
    ...input,
    obstacles: [{ x: 0, y: 0, width: 800, height: 450 }]
  });
  assert.equal(blocked.docked, true);
  assert.deepEqual(blocked, repeated);
});

test("persists idempotent completion without storing Player content", () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const first = createEnvironmentProgressStore({ storage });
  assert.equal(first.complete("EXP-TEST-A-101"), true);
  assert.equal(first.complete("EXP-TEST-A-101"), false);
  const second = createEnvironmentProgressStore({ storage });
  assert.equal(second.isCompleted("EXP-TEST-A-101"), true);
  assert.deepEqual(second.getSnapshot().completedExperienceIds, ["EXP-TEST-A-101"]);
  assert.doesNotMatch([...values.values()][0], /stage|decision|feedback|private/);
});

test("environment progress counts unique active assignments and updates without navigation", () => {
  const experiences = Array.from({ length: 10 }, (_, index) => ({
    id: `EXP-TEST-${index}`, editorialId: `EE-TEST-${index}`, title: `Test ${index}`
  }));
  const excluded = [
    { id: "archived", editorialId: "EE-0009", status: "archived" },
    { id: "disabled", editorialId: "EE-DISABLED", status: "disabled" },
    { id: "off", editorialId: "EE-OFF", enabled: false }
  ];
  const progressStore = createEnvironmentProgressStore({ storage: null });
  excluded.forEach(item => progressStore.complete(item.id));
  const navigator = createEnvironmentNavigator({
    documentRef: new FakeDocument(), baseUrl: ".", windowRef: null,
    experiences: [...experiences, ...excluded], progressStore,
    environments: [{
      id: "ENV-TEST", title: "Test environment", capacity: 99,
      width: 100, height: 50, background: "test.png",
      hotspots: [...experiences, ...excluded, experiences[0], { editorialId: "missing" }]
        .map(item => ({ experienceEditorialId: item.editorialId, x: 50, y: 50 }))
    }, { id: "ENV-EMPTY", title: "Empty", width: 100, height: 50, hotspots: [] }]
  });
  navigator.renderEnvironment("ENV-TEST");
  const check = (completed, total) => {
    const bar = navigator.element.find(item => item.attributes.role === "progressbar");
    assert.equal(bar.attributes["aria-valuemin"], "0");
    assert.equal(bar.attributes["aria-valuemax"], String(total));
    assert.equal(bar.attributes["aria-valuenow"], String(completed));
    assert.match(bar.attributes["aria-label"], /ENV-/);
    assert.equal(bar.children[0].style.properties["--environment-progress"], `${total ? completed / total * 100 : 0}%`);
    assert.equal(bar.children[0].dataset.empty, String(completed === 0));
    const card = navigator.element.find(item => item.className === "environment-progress");
    assert.equal(card.parent.className, "environment-view__header");
    assert.equal(card.children[0].children[1].text, `${completed} / ${total}`);
    assert.equal(card.children[2].text, `${completed} ${completed === 1 ? "Experience" : "Experiences"} completed`);
  };
  check(0, 10);
  experiences.forEach((item, index) => {
    progressStore.complete(item.id);
    if ([1, 2, 5, 10].includes(index + 1)) check(index + 1, 10);
  });
  progressStore.complete(experiences[0].id);
  check(10, 10);
  navigator.renderEnvironment("ENV-EMPTY");
  check(0, 0);
  navigator.destroy();
  progressStore.complete("unassigned");
  assert.equal(navigator.element.children.length, 0);
});

test("progress subscriptions notify once and can unsubscribe", () => {
  const store = createEnvironmentProgressStore({ storage: null });
  let calls = 0;
  const unsubscribe = store.subscribe(() => { calls += 1; });
  store.complete("first");
  store.complete("first");
  assert.equal(calls, 1);
  unsubscribe();
  store.complete("second");
  assert.equal(calls, 1);
});

test("the canonical archived EE-0009 stays outside the generated catalog", async () => {
  const catalog = JSON.parse(await readFile(new URL("../../../generated/experience-engine/catalog.json", import.meta.url), "utf8"));
  assert.equal(catalog.experiences.some(item => item.editorialId === "EE-0009"), false);
  assert.equal(catalog.environments.some(item => item.hotspots.some(hotspot => hotspot.experienceEditorialId === "EE-0009")), false);
  const source = await readFile(new URL("../../../../content/experiences/sensors/EE-0009-photoelectric-sensor-misalignment/experience.yaml", import.meta.url), "utf8");
  assert.match(source, /status: "archived"/);
});

test("workspace and application use generated JSON without ID-specific handling", async () => {
  const workspaceSource = await readFile(
    new URL("../components/experienceWorkspace.js", import.meta.url),
    "utf8"
  );
  const navigatorSource = await readFile(
    new URL("../components/environmentNavigator.js", import.meta.url),
    "utf8"
  );
  const app = await readFile(new URL("../../../app.js", import.meta.url), "utf8");
  const site = await readFile(new URL("../../../data/site.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../styles/experience-workspace.css", import.meta.url), "utf8");

  assert.match(workspaceSource, /generated\/experience-engine/);
  assert.match(workspaceSource, /new playerModule\.ExperiencePlayer\(\{ experience: artifact \}\)/);
  assert.doesNotMatch(workspaceSource, /ya?ml|EXP-[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}/i);
  assert.doesNotMatch(
    workspaceSource,
    /private|root_cause|scoring|correct_answer|rationale|consequence|debrief|fault_model|diagnostic_model/
  );
  assert.match(
    styles,
    /grid-template-columns:\s*clamp\(220px, 28vw, 280px\) minmax\(0, 1fr\)/
  );
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /aspect-ratio:\s*var\(--environment-ratio\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.environment-hotspot\s*\{\s*animation:\s*none;/s);
  assert.match(styles, /\.experience-card:focus-visible/);
  assert.doesNotMatch(styles, /EXP-SENSOR-PHOTOELECTRIC-009|EE-0009/);
  assert.doesNotMatch(workspaceSource, /EXP-SENSOR-SIGNAL-001|EE-0001/);
  assert.doesNotMatch(navigatorSource, /EXP-SENSOR-SIGNAL-001|EE-0001|capacity:\s*10/);
  assert.match(app, /export async function openExperience\(experienceId\)/);
  assert.match(app, /"experience-lab": renderExperienceLabView/);
  assert.match(site, /view: "experience-lab"/);
});

function findButton(root, text) {
  const button = root.find(
    element => element.tagName === "BUTTON"
      && (element.text === text || element.text.endsWith(text))
  );
  assert.ok(button, `Button not found: ${text}`);
  return button;
}

class FakeDocument {
  constructor() {
    this.baseURI = "https://digital2real.example/";
    this.listeners = {};
    this.activeElement = null;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  addEventListener(name, listener) {
    this.listeners[name] ??= new Set();
    this.listeners[name].add(listener);
  }

  removeEventListener(name, listener) {
    this.listeners[name]?.delete(listener);
  }

  dispatch(name, event = {}) {
    this.listeners[name]?.forEach(listener => listener(event));
  }
}

class FakeElement {
  constructor(tagName, documentRef = null) {
    this.tagName = tagName.toUpperCase();
    this.documentRef = documentRef;
    this.children = [];
    this.parent = null;
    this.attributes = {};
    this.listeners = {};
    const properties = {};
    this.style = {
      properties,
      setProperty(name, value) { properties[name] = value; }
    };
    this.className = "";
    this.textContent = "";
    this.type = "";
    this.id = "";
    this.dataset = {};
    this.rect = null;
  }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children.forEach(child => { child.parent = null; });
    children.forEach(child => { child.parent = this; });
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(name, listener) {
    this.listeners[name] = listener;
  }

  click() {
    return this.listeners.click?.({ target: this, stopPropagation() {} });
  }

  focus() {
    if (this.documentRef) this.documentRef.activeElement = this;
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter(child => child !== this);
    this.parent = null;
  }

  contains(target) {
    return target === this || this.children.some(child => child.contains(target));
  }

  getBoundingClientRect() {
    if (this.rect) return this.rect;
    if (this.className === "environment-stage") {
      return { left: 0, top: 0, width: 800, height: 450 };
    }
    if (this.className === "environment-popover") {
      return { left: 0, top: 0, width: 300, height: 160 };
    }
    return { left: 100, top: 100, width: 20, height: 20 };
  }

  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const match = child.find(predicate);
      if (match) return match;
    }
    return null;
  }

  findAll(predicate) {
    return [
      ...(predicate(this) ? [this] : []),
      ...this.children.flatMap(child => child.findAll(predicate))
    ];
  }

  get text() {
    return `${this.textContent}${this.children.map(child => child.text).join("")}`;
  }
}

class FakeEventTarget {
  constructor() {
    this.listeners = {};
  }

  addEventListener(name, listener) {
    this.listeners[name] = listener;
  }

  removeEventListener(name, listener) {
    if (this.listeners[name] === listener) delete this.listeners[name];
  }
}
