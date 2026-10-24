import { experienceUiCopy, supportedLocale, localeStorage, readLocale, saveLocale } from "./experienceLocale.js";
import { createEnvironmentNavigator } from "./environmentNavigator.js";
import { createEnvironmentProgressStore } from "./environmentProgressStore.js";

const defaultBaseUrl = "./generated/experience-engine";

export function createExperienceWorkspace({
  baseUrl = defaultBaseUrl,
  fetchImpl = globalThis.fetch?.bind(globalThis),
  importPlayer = location => import(location),
  documentRef = globalThis.document,
  progressStore = createEnvironmentProgressStore(),
  preferenceStorage = localeStorage(),
  localePreference = null
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Experience Workspace requires a document.");
  }
  if (typeof fetchImpl !== "function" || typeof importPlayer !== "function") {
    throw new Error("Experience Workspace requires fetch and module import boundaries.");
  }
  let locale = localePreference?.getLocale() ?? readLocale(preferenceStorage, documentRef.documentElement?.lang);
  let workspaceUi = experienceUiCopy(locale);

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
  let switchingLanguage = false;
  let loadingExperience = false;
  let loadingCatalog = false;
  let commands = [];
  let languageError = false;
  let currentContent = null;

  function show(content) {
    currentContent = content;
    element.setAttribute("lang", locale);
    if (languageError) {
      const message = createElement(documentRef, "p", "experience-language__error");
      message.textContent = workspaceUi.languageFailed;
      message.setAttribute("role", "alert");
      element.replaceChildren(message, content);
    } else element.replaceChildren(content);
  }

  async function setLanguage(requested) {
    const nextLocale = supportedLocale(requested);
    if (destroyed || switchingLanguage || loadingExperience || loadingCatalog || nextLocale === locale) return false;
    switchingLanguage = true;
    languageError = false;
    const previousContent = currentContent;
    if (previousContent) { previousContent.inert = true; show(previousContent); }
    let nextNavigator = null;
    try {
      let nextPlayer = player;
      if (player) {
        const item = catalog.experiences.find(item => item.id === activeExperienceId);
        const [artifact, module] = await Promise.all([
          loadJson(`${baseUrl}/${selectArtifactPath(item, nextLocale)}`, fetchImpl),
          importPlayer(resolveModuleUrl(`${baseUrl}/player/experiencePlayer.js`, documentRef))
        ]);
        nextPlayer = new module.ExperiencePlayer({ experience: artifact });
        // Reapply only this session's accepted commands to a detached Player.
        // No UI, completion registration or persistence occurs during replay.
        commands.forEach(([method, argument]) => nextPlayer[method](argument));
        if (JSON.stringify(sessionPosition(nextPlayer.getState())) !== JSON.stringify(sessionPosition(player.getState()))) {
          throw new Error("Localized Experience changed the session contract.");
        }
      }
      const view = navigator?.getViewState();
      if (catalog) {
        nextNavigator = buildNavigator(nextLocale);
        await nextNavigator.restoreView(view);
      }
      if (destroyed) { nextNavigator?.destroy(); return false; }
      locale = nextLocale;
      workspaceUi = experienceUiCopy(locale);
      if (!localePreference) saveLocale(preferenceStorage, locale);
      navigator?.destroy();
      navigator = nextNavigator;
      player = nextPlayer;
      switchingLanguage = false;
      if (player) renderPlayer();
      else if (navigator) show(navigator.element);
      else await initialise();
      return true;
    } catch {
      nextNavigator?.destroy();
      if (!destroyed) {
        languageError = true;
        switchingLanguage = false;
        if (previousContent) show(previousContent);
      }
      return false;
    } finally {
      switchingLanguage = false;
      if (previousContent) previousContent.inert = false;

    }
  }

  async function initialise() {
    loadingCatalog = true;
    renderStatus(workspaceUi.loadingLab);
    try {
      catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
      assertCatalog(catalog);
      loadingCatalog = false;
      if (!destroyed) renderCatalog();
    } catch (error) {
      loadingCatalog = false;
      catalog = null;
      if (!destroyed) renderError(error);
    }
    return controller;
  }

  async function openExperience(experienceId, environmentId = null) {
    if (destroyed) throw new Error("Experience Workspace has been destroyed.");
    if (switchingLanguage) return null;
    loadingExperience = true;

    try {
      if (!catalog) {
        catalog = await loadJson(`${baseUrl}/catalog.json`, fetchImpl);
        assertCatalog(catalog);
      }
      const item = localizeCatalogItem(
        catalog.experiences.find(experience => experience.id === experienceId),
        locale
      );
      if (!item) throw new Error(`Experience ${experienceId} is not available.`);
      renderStatus(workspaceUi.loading(item.title));

      const artifactPath = selectArtifactPath(item, locale);
      const [artifact, playerModule] = await Promise.all([
        loadJson(`${baseUrl}/${artifactPath}`, fetchImpl),
        importPlayer(resolveModuleUrl(`${baseUrl}/player/experiencePlayer.js`, documentRef))
      ]);
      if (typeof playerModule.ExperiencePlayer !== "function") {
        throw new Error("The generated package does not expose ExperiencePlayer.");
      }
      if (destroyed) return null;
      player = new playerModule.ExperiencePlayer({ experience: artifact });
      commands = [];
      loadingExperience = false;
      activeExperienceId = item.id;
      activeEnvironmentId = environmentId;
      completionRecorded = false;
      renderPlayer();
      return player.getState();
    } catch (error) {
      loadingExperience = false;
      if (!destroyed) renderError(error);
      throw error;
    }
  }

  function startExperience() {
    requirePlayer();
    player.start();
    commands.push(["start"]);
    renderPlayer();
  }

  function continueExperience() {
    requirePlayer();
    const leavingResult = player.getState().interaction === "result";
    player.continue();
    commands.push(["continue"]);
    renderPlayer(leavingResult);
  }

  function selectDecision(decisionId) {
    requirePlayer();
    player.selectDecision(decisionId);
    commands.push(["selectDecision", decisionId]);
    renderPlayer();
  }

  function restartExperience() {
    requirePlayer();
    player.reset();
    commands = [];
    completionRecorded = false;
    renderPlayer();
  }

  function closeExperience() {
    player = null;
    commands = [];
    navigator.restore();
    show(navigator.element);
    activeExperienceId = null;
    activeEnvironmentId = null;
    completionRecorded = false;
  }

  function renderPlayer(focusContent = false) {
    const state = player.getState();
    if (state.completionStatus === "completed"
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
    const presentation = ExperienceWorkspace({
      documentRef,
      projection: createWorkspaceProjection(state, baseUrl),
      onStart: startExperience,
      onContinue: continueExperience,
      onDecision: selectDecision,
      onRestart: restartExperience,
      onClose: closeExperience
    });
    presentation.setAttribute("lang", state.experience.language);
    show(presentation);
    if (state.interaction === "result" || focusContent) {
      const heading = element.querySelector?.("h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus();
    }
  }

  function renderCatalog() {
    player = null;
    commands = [];
    activeExperienceId = null;
    activeEnvironmentId = null;
    completionRecorded = false;
    navigator?.destroy();
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
    navigator = buildNavigator(locale);
    show(navigator.element);
  }

  function buildNavigator(targetLocale) {
    return createEnvironmentNavigator({
      locale: targetLocale,
      documentRef,
      baseUrl,
      environments: catalog.environments,
      experiences: catalog.experiences.map(item => (
        localizeCatalogItem(item, targetLocale)
      )),
      onOpenExperience: openExperience,
      onOpenTheory: async environment => {
        const theoryLocale = selectTheoryLocale(environment.theory, targetLocale);
        const theory = await loadJson(`${baseUrl}/${environment.theory.locales[theoryLocale]}`, fetchImpl);
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
  }

  function renderStatus(message) {
    const status = createElement(documentRef, "div", "experience-workspace__status");
    status.setAttribute("role", "status");
    appendText(documentRef, status, "p", "", message);
    show(status);
  }

  function renderError(error) {
    const panel = createElement(documentRef, "div", "experience-workspace__status experience-workspace__status--error");
    panel.setAttribute("role", "alert");
    appendText(documentRef, panel, "span", "experience-workspace__eyebrow", workspaceUi.experienceUnavailable);
    appendText(documentRef, panel, "h2", "", workspaceUi.labUnavailable);
    appendText(documentRef, panel, "p", "", safeErrorMessage(error, workspaceUi));
    const back = createButton(documentRef, workspaceUi.backToLab, "experience-action");
    back.addEventListener("click", () => catalog ? renderCatalog() : initialise());
    panel.appendChild(back);
    show(panel);
  }

  function requirePlayer() {
    if (!player) throw new Error("No experience is open.");
  }

  const releaseLocaleGuard = localePreference?.beforeChange(setLanguage);

  function destroy() {
    releaseLocaleGuard?.();
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
    setLanguage,
    getLocale: () => locale,
    openExperience,
    getState: () => player?.getState() ?? null,
    destroy
  });
  return controller;
}

function sessionPosition(state) {
  return {
    id: state.experience.id, version: state.experience.contentVersion,
    state: state.state, interaction: state.interaction,
    completionStatus: state.completionStatus, progress: state.progress,
    stage: state.currentStage?.id, selectedDecision: state.selectedDecision,
    decisions: state.decisionHistory.map(item => [item.stageId, item.decisionId]),
    attempts: state.attemptsByDecision, resolved: state.resolvedDecisions,
    evidence: state.unlockedEvidence, evaluation: state.evaluationResult
  };
}

export function createExperienceProgressResult(state) {
  if (state?.completionStatus !== "completed") {
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
  const projectAsset = asset => ({
    ...asset,
    src: baseUrl ? `${baseUrl}/${asset.src}` : asset.src
  });
  const cover = state.visual?.assets?.find(asset => asset.id === state.visual.cover_asset_id);
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
    cover: cover ? projectAsset(cover) : null,
    media: state.media.map(projectAsset),
    result: state.result ? {
      evidence: state.result.evidence.map(evidence => ({
        ...evidence,
        media: evidence.media.map(projectAsset)
      }))
    } : null,
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
    const stageLayout = createElement(
      documentRef,
      "div",
      projection.media.length
        ? "experience-stage-layout experience-stage-layout--with-media"
        : "experience-stage-layout"
    );
    const stageContent = createElement(documentRef, "div", "experience-stage-layout__content");
    stageContent.appendChild(StagePanel({ documentRef, stage: projection.stage, ui }));
    if (projection.media.length) {
      const stageMedia = createElement(documentRef, "div", "experience-stage-layout__media");
      stageMedia.appendChild(MediaPanel({ documentRef, media: projection.media, ui }));
      stageLayout.appendChild(stageContent);
      stageLayout.appendChild(stageMedia);
    } else {
      stageLayout.appendChild(stageContent);
    }
    if (projection.stage.decisions.length) {
      stageContent.appendChild(DecisionPanel({ documentRef, decisions: projection.stage.decisions, feedback: projection.feedback, onDecision, ui }));
    } else {
      stageContent.appendChild(ContinuePanel({ documentRef, onContinue, ui }));
    }
    shell.appendChild(stageLayout);
  } else if (projection.phase === "result") {
    shell.appendChild(ResultPanel({ documentRef, result: projection.result, onContinue, ui }));
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

export function ResultPanel({ documentRef, result, onContinue, ui = experienceUiCopy() }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-result");
  panel.setAttribute("aria-labelledby", "experience-result-title");
  const title = appendText(documentRef, panel, "h2", "", ui.result);
  title.id = "experience-result-title";
  result.evidence.forEach(evidence => {
    const group = createElement(documentRef, "section", "experience-result__evidence");
    appendText(documentRef, group, "h3", "", evidence.source);
    appendText(documentRef, group, "p", "experience-stage__situation", evidence.content);
    if (evidence.media.length) group.appendChild(MediaPanel({
      documentRef, media: evidence.media, ui, label: ui.evidenceMedia, showLoadErrors: true
    }));
    panel.appendChild(group);
  });
  const button = createButton(documentRef, ui.continue, "experience-action experience-action--primary");
  button.addEventListener("click", onContinue);
  panel.appendChild(button);
  return panel;
}

export function MediaPanel({ documentRef, media, ui = experienceUiCopy(), label = ui.stageMedia, showLoadErrors = false }) {
  const panel = createElement(documentRef, "section", "experience-panel experience-media");
  panel.setAttribute("aria-label", label);
  media.forEach(asset => {
    const figure = createElement(documentRef, "figure", "experience-media__item");
    let element;
    let zoomButton = null;
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
    if (showLoadErrors) {
      let failed = false;
      element.addEventListener("error", () => {
        if (failed) return;
        failed = true;
        element.remove();
        zoomButton?.remove();
        const notice = appendText(documentRef, figure, "p", "experience-stage__objective", ui.mediaUnavailable(asset.alt));
        notice.setAttribute("role", "status");
      });
    }
    element.src = asset.src;
    figure.appendChild(element);
    if (asset.type === "image") {
      zoomButton = createButton(documentRef, ui.expandMedia, "experience-media__zoom");
      zoomButton.setAttribute("aria-expanded", "false");
      zoomButton.addEventListener("click", () => {
        const expanded = figure.dataset.expanded === "true";
        figure.dataset.expanded = String(!expanded);
        zoomButton.setAttribute("aria-expanded", String(!expanded));
        zoomButton.textContent = expanded ? ui.expandMedia : ui.collapseMedia;
      });
      figure.appendChild(zoomButton);
    }
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
  const hasCover = !isStart && Boolean(projection.cover);
  const layout = createElement(
    documentRef,
    "div",
    hasCover ? "experience-introduction__layout experience-introduction__layout--with-media" : "experience-introduction__layout"
  );
  const content = createElement(documentRef, "div", "experience-introduction__content");
  const media = createElement(documentRef, "div", "experience-introduction__media");
  if (hasCover) {
    media.appendChild(MediaPanel({ documentRef, media: [projection.cover], ui }));
  }
  appendText(documentRef, content, "h2", "", projection.context.learner_role);
  appendText(documentRef, content, "p", "experience-introduction__context", projection.context.initial_context);

  const facts = createElement(documentRef, "dl", "experience-facts");
  appendFact(documentRef, facts, ui.operationalState, projection.context.operational_state);
  appendFact(documentRef, facts, ui.initiatingEvent, projection.context.initiating_event);
  content.appendChild(facts);
  if (projection.visual?.educational_purpose) {
    appendText(
      documentRef,
      content,
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
  content.appendChild(button);
  layout.appendChild(content);
  layout.appendChild(media);
  panel.appendChild(layout);
  return panel;
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
