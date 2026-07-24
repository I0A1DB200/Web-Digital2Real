const defaultBaseUrl = "./generated/experience-engine";

export function createExperienceWorkspace({
  baseUrl = defaultBaseUrl,
  fetchImpl = globalThis.fetch?.bind(globalThis),
  importPlayer = location => import(location),
  documentRef = globalThis.document
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Experience Workspace requires a document.");
  }
  if (typeof fetchImpl !== "function" || typeof importPlayer !== "function") {
    throw new Error("Experience Workspace requires fetch and module import boundaries.");
  }

  const element = documentRef.createElement("section");
  element.className = "experience-workspace";
  element.setAttribute("aria-live", "polite");

  let catalog = null;
  let player = null;
  let sessionTimestamp = 0;
  let destroyed = false;

  async function initialise() {
    renderStatus("Loading Experience Lab…");
    try {
      catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
      assertCatalog(catalog);
      if (!destroyed) renderCatalog();
    } catch (error) {
      if (!destroyed) renderError(error);
    }
    return controller;
  }

  async function openExperience(experienceId) {
    if (destroyed) throw new Error("Experience Workspace has been destroyed.");
    if (!catalog) {
      catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
      assertCatalog(catalog);
    }

    const item = catalog.experiences.find(experience => experience.id === experienceId);
    if (!item) throw new Error(`Experience ${experienceId} is not available in this package.`);
    renderStatus(`Loading ${item.title}…`);

    try {
      const [model, playerModule] = await Promise.all([
        loadJson(`${baseUrl}/${item.path}`, fetchImpl),
        importPlayer(resolveModuleUrl(`${baseUrl}/player/experiencePlayer.js`, documentRef))
      ]);
      if (typeof playerModule.ExperiencePlayer !== "function") {
        throw new Error("The generated package does not expose ExperiencePlayer.");
      }
      player = new playerModule.ExperiencePlayer({ experience: model });
      sessionTimestamp = 0;
      renderPlayer();
      return player.getState();
    } catch (error) {
      renderError(error);
      throw error;
    }
  }

  function startExperience() {
    requirePlayer();
    player.start({ timestamp: sessionTimestamp });
    renderPlayer();
  }

  function continueExperience() {
    requirePlayer();
    player.continue();
    renderPlayer();
  }

  function selectDecision(decisionId) {
    requirePlayer();
    sessionTimestamp += 1;
    player.selectDecision(decisionId, { timestamp: sessionTimestamp });
    renderPlayer();
  }

  function restartExperience() {
    requirePlayer();
    player.reset();
    sessionTimestamp = 0;
    renderPlayer();
  }

  function closeExperience() {
    player = null;
    sessionTimestamp = 0;
    renderCatalog();
  }

  function renderPlayer() {
    const state = player.getState();
    const projection = createWorkspaceProjection(state);
    element.replaceChildren(ExperienceWorkspace({
      documentRef,
      projection,
      state,
      onStart: startExperience,
      onContinue: continueExperience,
      onDecision: selectDecision,
      onRestart: restartExperience,
      onClose: closeExperience
    }));
  }

  function renderCatalog() {
    const shell = createElement(documentRef, "div", "experience-workspace__shell");
    const header = createElement(documentRef, "header", "experience-workspace__catalog-header");
    appendText(documentRef, header, "span", "experience-workspace__eyebrow", "Experience Lab");
    appendText(documentRef, header, "h1", "", "Industrial diagnosis through evidence and decisions.");
    appendText(
      documentRef,
      header,
      "p",
      "experience-workspace__lede",
      "Select an experience and work through the incident as a controlled diagnostic session."
    );
    shell.appendChild(header);

    const list = createElement(documentRef, "div", "experience-workspace__catalog");
    if (!catalog.experiences.length) {
      appendText(documentRef, list, "p", "experience-workspace__empty", "No experiences are available in this package.");
    }
    catalog.experiences.forEach(item => {
      const article = createElement(documentRef, "article", "experience-card");
      const meta = createElement(documentRef, "div", "experience-card__meta");
      appendText(documentRef, meta, "span", "", item.difficulty);
      appendText(documentRef, meta, "span", "", `${item.estimatedDuration} min`);
      appendText(documentRef, meta, "span", "", item.status.replaceAll("_", " "));
      article.appendChild(meta);
      appendText(documentRef, article, "h2", "", item.title);
      appendText(documentRef, article, "p", "", item.summary);
      const button = createButton(documentRef, "Open experience", "experience-action experience-action--primary");
      button.addEventListener("click", () => openExperience(item.id));
      article.appendChild(button);
      list.appendChild(article);
    });
    shell.appendChild(list);
    element.replaceChildren(shell);
  }

  function renderStatus(message) {
    const status = createElement(documentRef, "div", "experience-workspace__status");
    status.setAttribute("role", "status");
    appendText(documentRef, status, "p", "", message);
    element.replaceChildren(status);
  }

  function renderError(error) {
    const panel = createElement(documentRef, "div", "experience-workspace__status experience-workspace__status--error");
    panel.setAttribute("role", "alert");
    appendText(documentRef, panel, "span", "experience-workspace__eyebrow", "Experience unavailable");
    appendText(documentRef, panel, "h2", "", "The Experience Lab could not be loaded.");
    appendText(documentRef, panel, "p", "", error instanceof Error ? error.message : String(error));
    const back = createButton(documentRef, "Back to Experience Lab", "experience-action");
    back.addEventListener("click", renderCatalog);
    panel.appendChild(back);
    element.replaceChildren(panel);
  }

  function requirePlayer() {
    if (!player) throw new Error("No experience is open.");
  }

  function destroy() {
    destroyed = true;
    player = null;
    catalog = null;
    element.replaceChildren();
  }

  const controller = Object.freeze({
    element,
    initialise,
    openExperience,
    getState: () => player?.getState() ?? null,
    destroy
  });
  return controller;
}

export function createWorkspaceProjection(state) {
  if (!state) return Object.freeze({ phase: "catalog" });
  return Object.freeze({
    phase: state.interaction,
    title: state.experience.title,
    summary: state.experience.summary,
    status: state.completionStatus,
    progress: state.progress,
    context: state.context,
    stage: state.currentStage,
    evidence: state.revealedEvidence,
    decisions: state.currentStage?.decisions ?? [],
    consequence: state.lastOutcome,
    result: state.completionStatus,
    selectedDecisions: state.selectedDecisions,
    decisionHistory: state.decisionHistory,
    debrief: state.debrief,
    notebookReferences: state.notebookReferences
  });
}

export function ExperienceWorkspace({
  documentRef,
  projection,
  state,
  onStart,
  onContinue,
  onDecision,
  onRestart,
  onClose
}) {
  const shell = createElement(documentRef, "div", "experience-workspace__shell");
  shell.appendChild(ExperienceHeader({ documentRef, projection, onClose }));

  if (projection.phase !== "start") {
    shell.appendChild(ProgressIndicator({ documentRef, progress: projection.progress, phase: projection.phase }));
  }

  if (projection.phase === "start") {
    shell.appendChild(createIntroduction(documentRef, projection, onStart, true));
  } else if (projection.phase === "introduction") {
    shell.appendChild(createIntroduction(documentRef, projection, onContinue, false));
  } else if (projection.phase === "stage") {
    shell.appendChild(StagePanel({ documentRef, stage: projection.stage }));
    shell.appendChild(EvidencePanel({ documentRef, evidence: projection.evidence }));
    shell.appendChild(DecisionPanel({ documentRef, decisions: projection.decisions, onDecision }));
  } else if (projection.phase === "consequence") {
    shell.appendChild(ConsequencePanel({
      documentRef,
      consequence: projection.consequence,
      onContinue,
      isTerminal: state.state === "Completed" || state.state === "Blocked"
    }));
    shell.appendChild(EvidencePanel({ documentRef, evidence: projection.evidence }));
  } else if (projection.phase === "debrief") {
    shell.appendChild(DebriefPanel({ documentRef, projection, onRestart }));
  }

  return shell;
}

export function ExperienceHeader({ documentRef, projection, onClose }) {
  const header = createElement(documentRef, "header", "experience-header");
  const copy = createElement(documentRef, "div", "");
  appendText(documentRef, copy, "span", "experience-workspace__eyebrow", "Experience Engine");
  appendText(documentRef, copy, "h1", "", projection.title);
  appendText(documentRef, copy, "p", "experience-workspace__lede", projection.summary);
  header.appendChild(copy);
  const close = createButton(documentRef, "All experiences", "experience-action experience-action--quiet");
  close.addEventListener("click", onClose);
  header.appendChild(close);
  return header;
}

export function StagePanel({ documentRef, stage }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-stage");
  panel.setAttribute("aria-labelledby", "experience-stage-title");
  appendText(documentRef, panel, "span", "experience-panel__label", "Current situation");
  const title = appendText(documentRef, panel, "h2", "", stage.title);
  title.id = "experience-stage-title";
  appendText(documentRef, panel, "p", "experience-stage__situation", stage.situation);
  if (stage.objective) appendText(documentRef, panel, "p", "experience-stage__objective", stage.objective);
  return panel;
}

export function EvidencePanel({ documentRef, evidence }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", "Evidence discovered");
  appendText(documentRef, panel, "h2", "", `${evidence.length} observations`);
  const list = createElement(documentRef, "div", "experience-evidence");
  evidence.forEach(item => {
    const article = createElement(documentRef, "article", "experience-evidence__item");
    const meta = createElement(documentRef, "div", "experience-evidence__meta");
    appendText(documentRef, meta, "span", "", item.type.replaceAll("_", " "));
    appendText(documentRef, meta, "span", "", item.reliability);
    article.appendChild(meta);
    appendText(documentRef, article, "h3", "", item.source);
    appendText(documentRef, article, "p", "", item.content);
    list.appendChild(article);
  });
  panel.appendChild(list);
  return panel;
}

export function DecisionPanel({ documentRef, decisions, onDecision }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", "Engineering decision");
  appendText(documentRef, panel, "h2", "", "What should be done next?");
  const list = createElement(documentRef, "div", "experience-decisions");
  decisions.forEach((decision, index) => {
    const button = createButton(documentRef, "", "experience-decision");
    appendText(documentRef, button, "span", "experience-decision__index", String(index + 1).padStart(2, "0"));
    appendText(documentRef, button, "span", "experience-decision__action", decision.action);
    button.addEventListener("click", () => onDecision(decision.id));
    list.appendChild(button);
  });
  panel.appendChild(list);
  return panel;
}

export function ConsequencePanel({ documentRef, consequence, onContinue, isTerminal }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-consequence");
  appendText(documentRef, panel, "span", "experience-panel__label", "Consequence");
  appendText(documentRef, panel, "h2", "", consequence.classification.replaceAll("_", " "));
  appendText(documentRef, panel, "p", "experience-consequence__text", consequence.consequence);
  appendText(documentRef, panel, "p", "experience-consequence__reason", consequence.rationale);
  const button = createButton(
    documentRef,
    isTerminal ? "Open debrief" : "Continue",
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function ProgressIndicator({ documentRef, progress, phase }) {
  const wrapper = createElement(documentRef, "div", "experience-progress");
  const label = phase === "debrief"
    ? "Debrief"
    : `Stage ${progress.currentStage} / ${progress.totalStages}`;
  appendText(documentRef, wrapper, "span", "", label);
  const track = createElement(documentRef, "div", "experience-progress__track");
  const fill = createElement(documentRef, "span", "experience-progress__fill");
  fill.style.setProperty("--experience-progress", `${(progress.currentStage / progress.totalStages) * 100}%`);
  track.appendChild(fill);
  wrapper.appendChild(track);
  return wrapper;
}

export function DebriefPanel({ documentRef, projection, onRestart }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-debrief");
  appendText(documentRef, panel, "span", "experience-panel__label", "Diagnostic debrief");
  appendText(documentRef, panel, "h2", "", formatStatus(projection.result));
  appendText(documentRef, panel, "p", "experience-debrief__diagnosis", projection.debrief.fault_summary);

  appendList(
    documentRef,
    panel,
    "Decisions taken",
    projection.decisionHistory.map(record => record.action)
  );
  appendList(
    documentRef,
    panel,
    "Evidence found",
    projection.evidence.map(item => `${item.source}: ${item.content}`)
  );
  appendList(documentRef, panel, "Correct reasoning", projection.debrief.correct_reasoning);
  appendList(documentRef, panel, "Recovery", projection.debrief.recovery);

  const restart = createButton(documentRef, "Restart experience", "experience-action experience-action--primary");
  restart.addEventListener("click", onRestart);
  panel.appendChild(restart);
  return panel;
}

function createIntroduction(documentRef, projection, action, isStart) {
  const panel = createElement(documentRef, "section", "experience-panel experience-introduction");
  appendText(documentRef, panel, "span", "experience-panel__label", isStart ? "Ready to begin" : "Incident brief");
  appendText(documentRef, panel, "h2", "", projection.context.learnerRole);
  appendText(documentRef, panel, "p", "experience-introduction__context", projection.context.initialContext);

  const facts = createElement(documentRef, "dl", "experience-facts");
  appendFact(documentRef, facts, "Operational state", projection.context.operationalState);
  appendFact(documentRef, facts, "Initiating event", projection.context.initiatingEvent);
  if (projection.context.businessImpact) {
    appendFact(documentRef, facts, "Operational impact", projection.context.businessImpact);
  }
  panel.appendChild(facts);

  const button = createButton(
    documentRef,
    isStart ? "Start experience" : "Begin diagnosis",
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", action);
  panel.appendChild(button);
  return panel;
}

async function loadJson(location, fetchImpl) {
  const response = await fetchImpl(location, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load ${location} (${response.status}).`);
  return response.json();
}

function assertCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.experiences)) {
    throw new Error("The generated Experience Engine catalog is invalid.");
  }
}

function resolveModuleUrl(location, documentRef) {
  return new URL(location, documentRef.baseURI).href;
}

function createElement(documentRef, tagName, className) {
  const element = documentRef.createElement(tagName);
  if (className) element.className = className;
  return element;
}

function appendText(documentRef, parent, tagName, className, text) {
  const element = createElement(documentRef, tagName, className);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function createButton(documentRef, text, className) {
  const button = createElement(documentRef, "button", className);
  button.type = "button";
  button.textContent = text;
  return button;
}

function appendFact(documentRef, list, term, description) {
  appendText(documentRef, list, "dt", "", term);
  appendText(documentRef, list, "dd", "", description);
}

function appendList(documentRef, parent, title, items) {
  const section = createElement(documentRef, "section", "experience-debrief__section");
  appendText(documentRef, section, "h3", "", title);
  const list = createElement(documentRef, "ul", "");
  items.forEach(item => appendText(documentRef, list, "li", "", item));
  section.appendChild(list);
  parent.appendChild(section);
}

function formatStatus(status) {
  return status.split("_").map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join(" ");
}
