import { createEnvironmentNavigator } from "./environmentNavigator.js";
import { createEnvironmentProgressStore } from "./environmentProgressStore.js";

const defaultBaseUrl = "./generated/experience-engine";

export function createExperienceWorkspace({
  baseUrl = defaultBaseUrl,
  fetchImpl = globalThis.fetch?.bind(globalThis),
  importPlayer = location => import(location),
  documentRef = globalThis.document,
  progressStore = createEnvironmentProgressStore()
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Experience Workspace requires a document.");
  }
  if (typeof fetchImpl !== "function" || typeof importPlayer !== "function") {
    throw new Error("Experience Workspace requires fetch and module import boundaries.");
  }
  const workspaceUi = experienceUiCopy(documentRef.documentElement?.lang);

  const element = documentRef.createElement("section");
  element.className = "experience-workspace";
  element.setAttribute("aria-live", "polite");

  let catalog = null;
  let player = null;
  let navigator = null;
  let activeExperienceId = null;
  let activeEnvironmentId = null;
  let completionRecorded = false;
  let destroyed = false;

  async function initialise() {
    renderStatus(workspaceUi.loadingLab);
    try {
      catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
      assertCatalog(catalog);
      if (!destroyed) renderCatalog();
    } catch (error) {
      if (!destroyed) renderError(error);
    }
    return controller;
  }

  async function openExperience(experienceId, environmentId = null) {
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
      renderStatus(workspaceUi.loading(item.title));

      const artifactPath = selectArtifactPath(item, documentRef.documentElement?.lang);
      const [artifact, playerModule] = await Promise.all([
        loadJson(`${baseUrl}/${artifactPath}`, fetchImpl),
        importPlayer(resolveModuleUrl(`${baseUrl}/player/experiencePlayer.js`, documentRef))
      ]);
      if (typeof playerModule.ExperiencePlayer !== "function") {
        throw new Error("The generated package does not expose ExperiencePlayer.");
      }
      player = new playerModule.ExperiencePlayer({ experience: artifact });
      activeExperienceId = item.id;
      activeEnvironmentId = environmentId;
      completionRecorded = false;
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
    navigator.restore();
    element.replaceChildren(navigator.element);
    activeExperienceId = null;
    activeEnvironmentId = null;
    completionRecorded = false;
  }

  function renderPlayer() {
    const state = player.getState();
    if (state.interaction === "completion" && state.completionStatus === "completed"
      && activeExperienceId && !completionRecorded) {
      const environment = catalog.environments.find(item => item.id === activeEnvironmentId);
      if (environment?.contractVersion === "2.0.0") {
        progressStore.recordExperienceResult(activeEnvironmentId, activeExperienceId, createExperienceProgressResult(state));
        navigator?.refreshProgress();
      } else {
        progressStore.complete(activeExperienceId);
        navigator?.completeExperience(activeExperienceId);
      }
      completionRecorded = true;
    }
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
    catalog.environments.filter(item => item.contractVersion === "2.0.0").forEach(environment => {
      const experienceIds = environment.hotspots.map(hotspot =>
        catalog.experiences.find(item => item.editorialId === hotspot.experienceEditorialId)?.id).filter(Boolean);
      progressStore.registerEnvironment({
        environmentId: environment.id,
        contractVersion: environment.contractVersion,
        experienceIds,
        theorySectionIds: environment.theory?.sectionIds ?? []
      });
    });
    navigator = createEnvironmentNavigator({
      documentRef,
      baseUrl,
      environments: catalog.environments,
      experiences: catalog.experiences.map(item => (
        localizeCatalogItem(item, documentRef.documentElement?.lang)
      )),
      onOpenExperience: openExperience,
      onOpenTheory: async environment => {
        const locale = selectTheoryLocale(environment.theory, documentRef.documentElement?.lang);
        const theory = await loadJson(`${baseUrl}/${environment.theory.locales[locale]}`, fetchImpl);
        const experienceIds = environment.hotspots.map(hotspot =>
          catalog.experiences.find(item => item.editorialId === hotspot.experienceEditorialId)?.id).filter(Boolean);
        progressStore.registerEnvironment({
          environmentId: environment.id, contractVersion: environment.contractVersion,
          experienceIds, theorySectionIds: theory.sections.map(section => section.id)
        });
        return theory;
      },
      onTheorySectionCompleted: (environmentId, sectionId) => progressStore.markTheorySectionCompleted(environmentId, sectionId),
      progressStore
    });
    element.replaceChildren(navigator.element);
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
    appendText(documentRef, panel, "span", "experience-workspace__eyebrow", workspaceUi.experienceUnavailable);
    appendText(documentRef, panel, "h2", "", workspaceUi.labUnavailable);
    appendText(documentRef, panel, "p", "", safeErrorMessage(error, workspaceUi));
    const back = createButton(documentRef, workspaceUi.backToLab, "experience-action");
    back.addEventListener("click", renderCatalog);
    panel.appendChild(back);
    element.replaceChildren(panel);
  }

  function requirePlayer() {
    if (!player) throw new Error("No experience is open.");
  }

  function destroy() {
    destroyed = true;
    navigator?.destroy();
    player = null;
    catalog = null;
    navigator = null;
    activeExperienceId = null;
    activeEnvironmentId = null;
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

export function createExperienceProgressResult(state) {
  if (state?.interaction !== "completion" || state.completionStatus !== "completed") {
    throw new TypeError("Experience progress requires a completed Player state.");
  }
  return Object.freeze({ completed: true, mastered: state.evaluationResult?.mastered === true });
}

function selectTheoryLocale(theory, requested) {
  if (!theory?.locales) throw new Error("Environment Theory is unavailable.");
  const normalized = typeof requested === "string" ? requested.toLowerCase().split("-")[0] : "";
  return Object.hasOwn(theory.locales, normalized) ? normalized : theory.defaultLocale;
}

export function createWorkspaceProjection(state, baseUrl = "") {
  if (!state) return Object.freeze({ phase: "catalog" });
  return Object.freeze({
    phase: state.interaction,
    title: state.experience.title,
    summary: state.experience.summary,
    language: state.experience.language,
    status: state.completionStatus,
    progress: state.progress,
    context: state.context,
    stage: state.currentStage,
    selectedDecision: state.currentStage?.decisions.find(
      decision => decision.id === state.selectedDecision
    ) ?? null,
    decisionHistory: state.decisionHistory,
    feedback: state.feedback ?? null,
    evaluationResult: state.evaluationResult ?? null,
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
  const ui = experienceUiCopy(projection.language);
  const shell = createElement(documentRef, "div", "experience-workspace__shell");
  shell.appendChild(ExperienceHeader({ documentRef, projection, onClose, ui }));

  if (!["start", "completion"].includes(projection.phase)) {
    shell.appendChild(ProgressIndicator({ documentRef, progress: projection.progress, ui }));
  }

  if (projection.phase === "start") {
    shell.appendChild(createIntroduction(documentRef, projection, onStart, true, ui));
  } else if (projection.phase === "introduction") {
    shell.appendChild(createIntroduction(documentRef, projection, onContinue, false, ui));
  } else if (projection.phase === "stage") {
    shell.appendChild(StagePanel({ documentRef, stage: projection.stage, ui }));
    if (projection.media.length) {
      shell.appendChild(MediaPanel({ documentRef, media: projection.media, ui }));
    }
    if (projection.stage.decisions.length) {
      shell.appendChild(DecisionPanel({ documentRef, decisions: projection.stage.decisions, feedback: projection.feedback, onDecision, ui }));
    } else {
      shell.appendChild(ContinuePanel({ documentRef, onContinue, ui }));
    }
  } else if (projection.phase === "selection") {
    shell.appendChild(SelectionPanel({
      documentRef,
      decision: projection.selectedDecision,
      onContinue,
      finalStage: projection.progress.currentStage === projection.progress.totalStages,
      ui
    }));
  } else if (projection.phase === "completion") {
    shell.appendChild(CompletionPanel({ documentRef, projection, onRestart, ui }));
  }

  return shell;
}

export function ExperienceHeader({ documentRef, projection, onClose, ui = experienceUiCopy(projection.language) }) {
  const header = createElement(documentRef, "header", "experience-header");
  const copy = createElement(documentRef, "div", "");
  appendText(documentRef, copy, "span", "experience-workspace__eyebrow", ui.engine);
  appendText(documentRef, copy, "h1", "", projection.title);
  appendText(documentRef, copy, "p", "experience-workspace__lede", projection.summary);
  header.appendChild(copy);
  const close = createButton(documentRef, ui.allExperiences, "experience-action experience-action--quiet");
  close.addEventListener("click", onClose);
  header.appendChild(close);
  return header;
}

export function StagePanel({ documentRef, stage, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-stage");
  panel.setAttribute("aria-labelledby", "experience-stage-title");
  appendText(documentRef, panel, "span", "experience-panel__label", ui.currentSituation);
  const title = appendText(documentRef, panel, "h2", "", stage.title);
  title.id = "experience-stage-title";
  appendText(documentRef, panel, "p", "experience-stage__situation", stage.situation);
  if (stage.objective) appendText(documentRef, panel, "p", "experience-stage__objective", stage.objective);
  return panel;
}

export function DecisionPanel({ documentRef, decisions, feedback, onDecision, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", ui.engineeringDecision);
  appendText(documentRef, panel, "h2", "", ui.whatNext);
  const list = createElement(documentRef, "div", "experience-decisions");
  decisions.forEach((decision, index) => {
    const button = createButton(documentRef, "", "experience-decision");
    appendText(documentRef, button, "span", "experience-decision__index", String(index + 1).padStart(2, "0"));
    appendText(documentRef, button, "span", "experience-decision__action", decision.action);
    button.addEventListener("click", () => onDecision(decision.id));
    list.appendChild(button);
  });
  panel.appendChild(list);
  if (feedback?.message) {
    const notice = appendText(documentRef, panel, "p", "experience-stage__objective", feedback.message);
    notice.setAttribute("role", "status");
  }
  return panel;
}

export function ContinuePanel({ documentRef, onContinue, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", ui.incidentObserved);
  const button = createButton(
    documentRef,
    ui.continue,
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function MediaPanel({ documentRef, media, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-media");
  panel.setAttribute("aria-label", ui.stageMedia);
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

export function SelectionPanel({ documentRef, decision, onContinue, finalStage, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", ui.decisionRecorded);
  appendText(documentRef, panel, "h2", "", decision.action);
  appendText(
    documentRef,
    panel,
    "p",
    "experience-stage__situation",
    ui.selectionRecorded
  );
  const button = createButton(
    documentRef,
    finalStage ? ui.completeExperience : ui.continue,
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function ProgressIndicator({ documentRef, progress, ui = experienceUiCopy() }) {
  const wrapper = createElement(documentRef, "div", "experience-progress");
  appendText(documentRef, wrapper, "span", "", `${ui.stage} ${progress.currentStage} / ${progress.totalStages}`);
  const track = createElement(documentRef, "div", "experience-progress__track");
  const fill = createElement(documentRef, "span", "experience-progress__fill");
  fill.style.setProperty("--experience-progress", `${(progress.currentStage / progress.totalStages) * 100}%`);
  track.appendChild(fill);
  wrapper.appendChild(track);
  return wrapper;
}

export function CompletionPanel({ documentRef, projection, onRestart, ui = experienceUiCopy(projection.language) }) {
  const panel = createElement(documentRef, "section", "experience-panel");
  appendText(documentRef, panel, "span", "experience-panel__label", ui.experienceComplete);
  appendText(documentRef, panel, "h2", "", projection.completion?.title ?? ui.sessionCompleted);
  appendText(
    documentRef,
    panel,
    "p",
    "experience-stage__situation",
    projection.completion?.summary ?? ui.completedStages(projection.progress.totalStages)
  );
  if (projection.completion?.process) {
    appendList(documentRef, panel, ui.correctProcess, projection.completion.process);
  }
  if (projection.completion?.lesson) {
    appendText(documentRef, panel, "p", "experience-stage__objective", projection.completion.lesson);
  }
  if (projection.completion?.avoided_errors) {
    appendList(documentRef, panel, ui.avoidedErrors, projection.completion.avoided_errors);
  }
  if (projection.completion?.industrial_value) {
    appendList(documentRef, panel, ui.industrialValue, projection.completion.industrial_value);
  }
  if (projection.evaluationResult) {
    const result = projection.evaluationResult;
    const facts = createElement(documentRef, "dl", "experience-facts");
    appendFact(documentRef, facts, ui.decisions, String(result.totalDecisions));
    appendFact(documentRef, facts, ui.firstAttemptCorrect, `${result.firstAttemptCorrect} / ${result.totalDecisions}`);
    appendFact(documentRef, facts, ui.additionalAttempts, String(result.additionalAttempts));
    appendFact(documentRef, facts, ui.result, result.outcome.replaceAll("_", " "));
    panel.appendChild(facts);
  } else {
    appendList(
      documentRef,
      panel,
      ui.decisionsTaken,
      projection.decisionHistory.map(record => record.action)
    );
  }
  if (projection.media.length) {
    panel.appendChild(MediaPanel({ documentRef, media: projection.media, ui }));
  }
  const restart = createButton(documentRef, ui.restartExperience, "experience-action experience-action--primary");
  restart.addEventListener("click", onRestart);
  panel.appendChild(restart);
  return panel;
}

function createIntroduction(documentRef, projection, action, isStart, ui) {
  const panel = createElement(documentRef, "section", "experience-panel experience-introduction");
  appendText(documentRef, panel, "span", "experience-panel__label", isStart ? ui.readyToBegin : ui.incidentBrief);
  appendText(documentRef, panel, "h2", "", projection.context.learner_role);
  appendText(documentRef, panel, "p", "experience-introduction__context", projection.context.initial_context);

  const facts = createElement(documentRef, "dl", "experience-facts");
  appendFact(documentRef, facts, ui.operationalState, projection.context.operational_state);
  appendFact(documentRef, facts, ui.initiatingEvent, projection.context.initiating_event);
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
    isStart ? ui.startExperience : ui.beginDiagnosis,
    "experience-action experience-action--primary"
  );
  button.addEventListener("click", action);
  panel.appendChild(button);
  return panel;
}

function experienceUiCopy(locale = "en") {
  const language = typeof locale === "string" ? locale.toLowerCase().split("-")[0] : "en";
  return language === "es" ? {
    language: "es",
    loadingLab: "Cargando el Laboratorio de Experiences…",
    loading: title => `Cargando ${title}…`,
    experienceUnavailable: "Experience no disponible",
    labUnavailable: "No se pudo cargar el Laboratorio de Experiences.",
    unavailable: "La Experience solicitada no está disponible.",
    backToLab: "Volver al Laboratorio de Experiences",
    engine: "Experience Engine",
    allExperiences: "Todas las Experiences",
    currentSituation: "Situación actual",
    engineeringDecision: "Decisión técnica",
    whatNext: "¿Qué debería hacerse a continuación?",
    incidentObserved: "Incidente observado",
    continue: "Continuar",
    stageMedia: "Contenido multimedia de la etapa",
    decisionRecorded: "Decisión registrada",
    selectionRecorded: "Tu selección se ha registrado para esta sesión local.",
    completeExperience: "Completar Experience",
    stage: "Etapa",
    experienceComplete: "Experience completada",
    sessionCompleted: "Sesión de diagnóstico completada",
    completedStages: count => `Has completado ${count} etapas.`,
    correctProcess: "Proceso correcto",
    avoidedErrors: "Errores evitados",
    industrialValue: "Valor industrial",
    decisions: "Decisiones",
    firstAttemptCorrect: "Correctas al primer intento",
    additionalAttempts: "Intentos adicionales",
    result: "Resultado",
    decisionsTaken: "Decisiones tomadas",
    restartExperience: "Reiniciar Experience",
    readyToBegin: "Listo para comenzar",
    incidentBrief: "Resumen del incidente",
    operationalState: "Estado operativo",
    initiatingEvent: "Evento inicial",
    startExperience: "Iniciar Experience",
    beginDiagnosis: "Iniciar diagnóstico"
  } : {
    language: "en",
    loadingLab: "Loading Experience Lab…",
    loading: title => `Loading ${title}…`,
    experienceUnavailable: "Experience unavailable",
    labUnavailable: "The Experience Lab could not be loaded.",
    unavailable: "The requested experience is unavailable.",
    backToLab: "Back to Experience Lab",
    engine: "Experience Engine",
    allExperiences: "All experiences",
    currentSituation: "Current situation",
    engineeringDecision: "Engineering decision",
    whatNext: "What should be done next?",
    incidentObserved: "Incident observed",
    continue: "Continue",
    stageMedia: "Stage media",
    decisionRecorded: "Decision recorded",
    selectionRecorded: "Your selection has been recorded for this local session.",
    completeExperience: "Complete experience",
    stage: "Stage",
    experienceComplete: "Experience complete",
    sessionCompleted: "Diagnostic session completed",
    completedStages: count => `You completed ${count} stages.`,
    correctProcess: "Correct process",
    avoidedErrors: "Avoided errors",
    industrialValue: "Industrial value",
    decisions: "Decisions",
    firstAttemptCorrect: "First-attempt correct",
    additionalAttempts: "Additional attempts",
    result: "Result",
    decisionsTaken: "Decisions taken",
    restartExperience: "Restart experience",
    readyToBegin: "Ready to begin",
    incidentBrief: "Incident brief",
    operationalState: "Operational state",
    initiatingEvent: "Initiating event",
    startExperience: "Start experience",
    beginDiagnosis: "Begin diagnosis"
  };
}

async function loadJson(location, fetchImpl) {
  const response = await fetchImpl(location, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load the requested experience (${response.status}).`);
  return response.json();
}

function assertCatalog(catalog) {
  if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.experiences)
    || !Array.isArray(catalog.environments)) {
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

function safeErrorMessage(error, ui = experienceUiCopy()) {
  if (ui.language === "es" || !error || typeof error.message !== "string") return ui.unavailable;
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
