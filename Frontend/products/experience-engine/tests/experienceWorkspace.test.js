import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { ExperiencePlayer } from "../../../../experience-engine/player/experiencePlayer.js";
import {
  createExperienceWorkspace,
  createWorkspaceProjection
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
  artifact.identity.id = "EXP-SENSOR-PHOTOELECTRIC-009";
  artifact.metadata.title = "Photoelectric Sensor Misalignment";
  artifact.metadata.summary = "A packaging station intermittently fails to detect incoming boxes.";
  const catalog = {
    format: "Digital2Real Generated Web Artifact Catalog",
    version: 1,
    mode: "preview",
    experiences: [{
      id: artifact.identity.id,
      class: artifact.identity.class,
      title: artifact.metadata.title,
      summary: artifact.metadata.summary,
      estimatedDuration: artifact.metadata.estimated_duration,
      cover: "assets/EXP-SENSOR-PHOTOELECTRIC-009/ART-001-machine-overview.png",
      path: `experiences/${artifact.identity.id}.json`
    }]
  };
  const documentRef = new FakeDocument();
  const responses = new Map([
    ["./generated/experience-engine/catalog.json", catalog],
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
  const card = workspace.element.find(element => element.className === "experience-card");
  assert.ok(card);
  assert.equal(card.tagName, "A");
  assert.equal(card.attributes.href, "#experience-lab");
  assert.equal(card.attributes["aria-label"], "Begin investigation: Photoelectric Sensor Misalignment");
  assert.match(card.text, /Photoelectric Sensor Misalignment/);
  assert.match(card.text, /A packaging station intermittently fails to detect incoming boxes/);
  assert.match(card.text, /→ Begin Investigation/);
  assert.doesNotMatch(card.text, /EXP-SENSOR-PHOTOELECTRIC-009|learning|20 min|CASE/);
  assert.equal(card.find(element => element.className === "experience-card__meta"), null);
  assert.equal(card.find(element => element.className.includes("experience-action")), null);

  await card.click();
  assert.equal(workspace.getState().interaction, "start");
  assert.match(workspace.element.text, /material handling machine has stopped/i);

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
});

test("renders safe errors for missing experiences and unsupported contracts", async () => {
  const documentRef = new FakeDocument();
  const catalog = { version: 1, experiences: [] };
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
    }]
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
  assert.match(workspace.element.text, /English title/);
  await workspace.openExperience(artifact.identity.id);
  assert.ok(requests.includes("./generated/experience-engine/experiences/item.en.json"));
});

test("workspace and application use generated JSON without ID-specific handling", async () => {
  const workspaceSource = await readFile(
    new URL("../components/experienceWorkspace.js", import.meta.url),
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
  assert.match(styles, /grid-template-columns:\s*minmax\(14rem, 3fr\) minmax\(0, 7fr\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.experience-card:focus-visible/);
  assert.doesNotMatch(styles, /EXP-SENSOR-PHOTOELECTRIC-009|EE-0009/);
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
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.style = { setProperty() {} };
    this.className = "";
    this.textContent = "";
    this.type = "";
    this.id = "";
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  addEventListener(name, listener) {
    this.listeners[name] = listener;
  }

  click() {
    return this.listeners.click?.();
  }

  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const match = child.find(predicate);
      if (match) return match;
    }
    return null;
  }

  get text() {
    return `${this.textContent}${this.children.map(child => child.text).join("")}`;
  }
}
