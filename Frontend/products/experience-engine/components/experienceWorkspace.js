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

    try {
      if (!catalog) {
        catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
        assertCatalog(catalog);
      }
      const item = localizeCatalogItem(
        catalog.experiences.find(experience => experience.id === experienceId),
        documentRef.documentElement?.lang
      );
      if (!item) throw new Error(`Experience ${experienceId} is not available.`);
      renderStatus(`Loading ${item.title}…`);

      const artifactPath = selectArtifactPath(item, documentRef.documentElement?.lang);
      const [artifact, playerModule] = await Promise.all([
        loadJson(`${baseUrl}/${artifactPath}`, fetchImpl),
        importPlayer(resolveModuleUrl(`${baseUrl}/player/experiencePlayer.js`, documentRef))
      ]);
      if (typeof playerModule.ExperiencePlayer !== "function") {
        throw new Error("The generated package does not expose ExperiencePlayer.");
      }
      player = new playerModule.ExperiencePlayer({ experience: artifact });
      renderPlayer();
      return player.getState();
    } catch (error) {
      renderError(error);
      throw error;
    }
  }

  function startExperience() {
    requirePlayer();
    player.start();
    renderPlayer();
  }

  function continueExperience() {
    requirePlayer();
    player.continue();
    renderPlayer();
  }

  function selectDecision(decisionId) {
    requirePlayer();
    player.selectDecision(decisionId);
    renderPlayer();
  }

  function restartExperience() {
    requirePlayer();
    player.reset();
    renderPlayer();
  }

  function closeExperience() {
    player = null;
    renderCatalog();
  }

  function renderPlayer() {
    const state = player.getState();
    element.replaceChildren(ExperienceWorkspace({
      documentRef,
      projection: createWorkspaceProjection(state, baseUrl),
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
      appendText(documentRef, list, "p", "experience-workspace__empty", "No experiences are available.");
    }
    catalog.experiences
      .map(item => localizeCatalogItem(item, documentRef.documentElement?.lang))
      .forEach(item => {
      const card = createElement(documentRef, "a", "experience-card");
      card.setAttribute("href", "#experience-lab");
      card.setAttribute("aria-label", `Begin investigation: ${item.title}`);
      card.addEventListener("click", event => {
        event?.preventDefault?.();
        return openExperience(item.id);
      });

      const visual = createElement(documentRef, "div", "experience-card__visual");
      if (item.cover) {
        const cover = createElement(documentRef, "img", "experience-card__cover");
        cover.src = `${baseUrl}/${item.cover}`;
        cover.alt = "";
        visual.appendChild(cover);
      }
      card.appendChild(visual);

      const content = createElement(documentRef, "div", "experience-card__content");
      appendText(documentRef, content, "h2", "", item.title);
      appendText(documentRef, content, "p", "", item.summary);
      appendText(
        documentRef,
        content,
        "span",
        "experience-card__cta",
        "→ Begin Investigation"
      );
      card.appendChild(content);
      list.appendChild(card);
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
    appendText(documentRef, panel, "p", "", safeErrorMessage(error));
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

export function createWorkspaceProjection(state, baseUrl = "") {
  if (!state) return Object.freeze({ phase: "catalog" });
  return Object.freeze({
    phase: state.interaction,
    title: state.experience.title,
    summary: state.experience.summary,
    status: state.completionStatus,
    progress: state.progress,
    context: state.context,
    stage: state.currentStage,
    selectedDecision: state.currentStage?.decisions.find(
      decision => decision.id === state.selectedDecision
    ) ?? null,
    decisionHistory: state.decisionHistory,
    visual: state.visual,
    media: state.media.map(asset => ({
      ...asset,
      src: baseUrl ? `${baseUrl}/${asset.src}` : asset.src
    })),
    completion: state.completion
  });
}

export function ExperienceWorkspace({
  documentRef,
  projection,
  onStart,
  onContinue,
  onDecision,
  onRestart,
  onClose
}) {
  const shell = createElement(documentRef, "div", "experience-workspace__shell");
  shell.appendChild(ExperienceHeader({ documentRef, projection, onClose }));

  if (!["start", "completion"].includes(projection.phase)) {
    shell.appendChild(ProgressIndicator({ documentRef, progress: projection.progress }));
  }

  if (projection.phase === "start") {
    shell.appendChild(createIntroduction(documentRef, projection, onStart, true));
  } else if (projection.phase === "introduction") {
    shell.appendChild(createIntroduction(documentRef, projection, onContinue, false));
  } else if (projection.phase === "stage") {
    shell.appendChild(StagePanel({ documentRef, stage: projection.stage }));
    if (projection.media.length) {
      shell.appendChild(MediaPanel({ documentRef, media: projection.media }));
    }
    if (projection.stage.decisions.length) {
      shell.appendChild(DecisionPanel({ documentRef, decisions: projection.stage.decisions, onDecision }));
    } else {
      shell.appendChild(ContinuePanel({ documentRef, onContinue }));
    }
  } else if (projection.phase === "selection") {
    shell.appendChild(SelectionPanel({
      documentRef,
      decision: projection.selectedDecision,
      onContinue,
      finalStage: projection.progress.currentStage === projection.progress.totalStages
    }));
  } else if (projection.phase === "completion") {
    shell.appendChild(CompletionPanel({ documentRef, projection, onRestart }));
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

export function ContinuePanel({ documentRef, onContinue }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", "Incident observed");
  const button = createButton(
    documentRef,
    "Continue",
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function MediaPanel({ documentRef, media }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-media");
  panel.setAttribute("aria-label", "Multimedia de la etapa");
  media.forEach(asset => {
    const figure = createElement(documentRef, "figure", "experience-media__item");
    let element;
    if (asset.type === "video") {
      element = createElement(documentRef, "video", "experience-media__asset");
      element.autoplay = asset.autoplay === true;
      element.loop = asset.loop === true;
      element.muted = true;
      element.playsInline = true;
      element.controls = true;
      element.setAttribute("aria-label", asset.alt);
    } else {
      element = createElement(documentRef, "img", "experience-media__asset");
      element.alt = asset.alt;
    }
    element.src = asset.src;
    figure.appendChild(element);
    if (asset.caption) appendText(documentRef, figure, "figcaption", "", asset.caption);
    panel.appendChild(figure);
  });
  return panel;
}

export function SelectionPanel({ documentRef, decision, onContinue, finalStage }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", "Decision recorded");
  appendText(documentRef, panel, "h2", "", decision.action);
  appendText(
    documentRef,
    panel,
    "p",
    "experience-stage__situation",
    "Your selection has been recorded for this local session."
  );
  const button = createButton(
    documentRef,
    finalStage ? "Complete experience" : "Continue",
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function ProgressIndicator({ documentRef, progress }) {
  const wrapper = createElement(documentRef, "div", "experience-progress");
  appendText(documentRef, wrapper, "span", "", `Stage ${progress.currentStage} / ${progress.totalStages}`);
  const track = createElement(documentRef, "div", "experience-progress__track");
  const fill = createElement(documentRef, "span", "experience-progress__fill");
  fill.style.setProperty("--experience-progress", `${(progress.currentStage / progress.totalStages) * 100}%`);
  track.appendChild(fill);
  wrapper.appendChild(track);
  return wrapper;
}

export function CompletionPanel({ documentRef, projection, onRestart }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", "Experience complete");
  appendText(documentRef, panel, "h2", "", projection.completion?.title ?? "Diagnostic session completed");
  appendText(
    documentRef,
    panel,
    "p",
    "experience-stage__situation",
    projection.completion?.summary ?? `You completed ${projection.progress.totalStages} stages.`
  );
  if (projection.completion?.process) {
    appendList(documentRef, panel, "Proceso correcto", projection.completion.process);
  }
  if (projection.completion?.lesson) {
    appendText(documentRef, panel, "p", "experience-stage__objective", projection.completion.lesson);
  }
  if (projection.completion?.avoided_errors) {
    appendList(documentRef, panel, "Errores evitados", projection.completion.avoided_errors);
  }
  if (projection.completion?.industrial_value) {
    appendList(documentRef, panel, "Valor industrial", projection.completion.industrial_value);
  }
  appendList(
    documentRef,
    panel,
    "Decisions taken",
    projection.decisionHistory.map(record => record.action)
  );
  if (projection.media.length) {
    panel.appendChild(MediaPanel({ documentRef, media: projection.media }));
  }
  const restart = createButton(documentRef, "Restart experience", "experience-action experience-action--primary");
  restart.addEventListener("click", onRestart);
  panel.appendChild(restart);
  return panel;
}

function createIntroduction(documentRef, projection, action, isStart) {
  const panel = createElement(documentRef, "section", "experience-panel experience-introduction");
  appendText(documentRef, panel, "span", "experience-panel__label", isStart ? "Ready to begin" : "Incident brief");
  appendText(documentRef, panel, "h2", "", projection.context.learner_role);
  appendText(documentRef, panel, "p", "experience-introduction__context", projection.context.initial_context);

  const facts = createElement(documentRef, "dl", "experience-facts");
  appendFact(documentRef, facts, "Operational state", projection.context.operational_state);
  appendFact(documentRef, facts, "Initiating event", projection.context.initiating_event);
  panel.appendChild(facts);
  if (projection.visual?.educational_purpose) {
    appendText(
      documentRef,
      panel,
      "p",
      "experience-stage__objective",
      projection.visual.educational_purpose
    );
  }

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
  if (!response.ok) throw new Error(`Could not load the requested experience (${response.status}).`);
  return response.json();
}

function assertCatalog(catalog) {
  if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.experiences)) {
    throw new Error("The generated Experience Engine catalog is invalid.");
  }
}

function selectArtifactPath(item, requestedLocale) {
  if (!item.locales) return item.path;
  const normalized = typeof requestedLocale === "string"
    ? requestedLocale.toLowerCase().split("-")[0]
    : "";
  const path = item.locales[normalized] ?? item.locales[item.defaultLocale];
  if (!path) throw new Error(`No localized artifact is available for ${item.id}.`);
  return path;
}

function localizeCatalogItem(item, requestedLocale) {
  if (!item || !item.localizedMetadata) return item;
  const normalized = typeof requestedLocale === "string"
    ? requestedLocale.toLowerCase().split("-")[0]
    : "";
  const copy = item.localizedMetadata[normalized]
    ?? item.localizedMetadata[item.defaultLocale];
  return copy ? { ...item, ...copy } : item;
}

function safeErrorMessage(error) {
  if (!error || typeof error.message !== "string") return "The requested experience is unavailable.";
  return error.message;
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
  const section = createElement(documentRef, "section", "");
  appendText(documentRef, section, "h3", "", title);
  const list = createElement(documentRef, "ul", "");
  items.forEach(item => appendText(documentRef, list, "li", "", item));
  section.appendChild(list);
  parent.appendChild(section);
}
