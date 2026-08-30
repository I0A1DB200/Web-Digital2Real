import { chooseEnvironmentPopoverPlacement } from "./environmentPopoverPosition.js";
import { createEnvironmentProgressStore } from "./environmentProgressStore.js";

export function createEnvironmentNavigator({
  documentRef,
  baseUrl,
  environments,
  experiences,
  onOpenExperience,
  onOpenTheory = null,
  onTheorySectionCompleted = null,
  progressStore = createEnvironmentProgressStore(),
  windowRef = globalThis.window,
  resizeObserverFactory = defaultResizeObserverFactory
}) {
  const element = documentRef.createElement("div");
  element.className = "environment-navigator";
  const ui = environmentUiCopy(documentRef.documentElement?.lang);
  const experienceByEditorialId = new Map(
    experiences.filter(experience => experience.enabled !== false
      && !["archived", "disabled"].includes(experience.status))
      .map(experience => [experience.editorialId, experience])
  );
  let selectedEnvironment = null;
  let stage = null;
  let progressElement = null;
  let hotspotRecords = [];
  let activeRecord = null;
  let activePopover = null;
  let activeConnector = null;
  let resizeObserver = null;
  const unsubscribeProgress = progressStore.subscribe?.(renderProgress);

  function renderCatalog() {
    leaveEnvironment();
    selectedEnvironment = null;
    const fragment = createShell(documentRef);
    const list = createElement(documentRef, "div", "environment-catalog");
    environments.forEach(environment => {
      const card = createElement(documentRef, "button", "environment-card");
      card.type = "button";
      card.setAttribute("aria-label", `${ui.openEnvironment}: ${environment.title}`);
      const image = createElement(documentRef, "img", "environment-card__image");
      image.src = `${baseUrl}/${environment.background}`;
      image.alt = "";
      card.appendChild(image);
      appendText(documentRef, card, "span", "environment-card__id", environment.id);
      appendText(documentRef, card, "h2", "", environment.title);
      card.addEventListener("click", () => renderEnvironment(environment.id));
      list.appendChild(card);
    });
    if (!environments.length) {
      appendText(documentRef, list, "p", "experience-workspace__empty", ui.noEnvironments);
    }
    fragment.appendChild(list);
    element.replaceChildren(fragment);
  }

  function renderEnvironment(environmentId) {
    leaveEnvironment();
    const environment = environments.find(item => item.id === environmentId);
    if (!environment) throw new Error(`Environment ${environmentId} is not available.`);
    selectedEnvironment = environment;
    const shell = createElement(documentRef, "div", "experience-workspace__shell");
    const back = createElement(documentRef, "button", "experience-action experience-action--quiet");
    back.type = "button";
    back.textContent = ui.backToEnvironments;
    back.addEventListener("click", renderCatalog);
    shell.appendChild(back);
    const heading = createElement(documentRef, "header", "environment-view__header");
    const title = createElement(documentRef, "div", "environment-view__title");
    appendText(documentRef, title, "span", "experience-workspace__eyebrow", environment.id);
    appendText(documentRef, title, "h1", "", environment.title);
    heading.appendChild(title);
    if (environment.theory && typeof onOpenTheory === "function") {
      const theory = createButton(documentRef, ui.openTheory, "experience-action experience-action--primary");
      theory.addEventListener("click", async () => renderTheory(environment, await onOpenTheory(environment)));
      heading.appendChild(theory);
    }
    shell.appendChild(heading);
    progressElement = createElement(documentRef, "section", "environment-progress");
    heading.appendChild(progressElement);
    renderProgress();

    stage = createElement(documentRef, "div", "environment-stage");
    stage.style.setProperty("--environment-ratio", `${environment.width} / ${environment.height}`);
    const image = createElement(documentRef, "img", "environment-stage__image");
    image.src = `${baseUrl}/${environment.background}`;
    image.alt = environment.title;
    image.addEventListener("load", positionActivePopover);
    stage.appendChild(image);
    hotspotRecords = environment.hotspots.flatMap(hotspot => {
      const experience = experienceByEditorialId.get(hotspot.experienceEditorialId);
      if (!experience) return [];
      const marker = createElement(documentRef, "button", "environment-hotspot");
      marker.type = "button";
      marker.style.setProperty("--hotspot-x", `${hotspot.x}%`);
      marker.style.setProperty("--hotspot-y", `${hotspot.y}%`);
      marker.setAttribute("aria-label", `${ui.inspect} ${experience.title}`);
      marker.setAttribute("aria-expanded", "false");
      const record = { hotspot, experience, marker };
      marker.addEventListener("click", event => {
        event?.stopPropagation?.();
        togglePopover(record);
      });
      stage.appendChild(marker);
      return [record];
    });
    shell.appendChild(stage);

    if (!environment.hotspots.length) {
      appendText(
        documentRef,
        shell,
        "p",
        "environment-view__pending",
        ui.environmentPending
      );
    }
    element.replaceChildren(shell);
    documentRef.addEventListener?.("click", handleOutsideClick);
    documentRef.addEventListener?.("keydown", handleKeydown);
    windowRef?.addEventListener?.("resize", positionActivePopover);
  }

  function renderTheory(environment, theory) {
    leaveEnvironment();
    const shell = createElement(documentRef, "div", "experience-workspace__shell");
    const back = createButton(documentRef, ui.backToEnvironment, "experience-action experience-action--quiet");
    back.addEventListener("click", () => renderEnvironment(environment.id));
    shell.appendChild(back);
    const header = createElement(documentRef, "header", "experience-workspace__catalog-header");
    appendText(documentRef, header, "span", "experience-workspace__eyebrow", `${environment.id} · ${ui.theory}`);
    appendText(documentRef, header, "h1", "", environment.title);
    appendText(documentRef, header, "p", "experience-workspace__lede", ui.theoryLede);
    shell.appendChild(header);
    const mediaById = new Map(theory.media.map(item => [item.id, item]));
    let sectionIndex = 0;
    const content = createElement(documentRef, "div", "");
    shell.appendChild(content);
    const renderSection = () => {
      const section = theory.sections[sectionIndex];
      const panel = createElement(documentRef, "section", "experience-panel environment-theory__section");
      const sectionContent = createElement(documentRef, "div", "environment-theory__content");
      appendText(documentRef, sectionContent, "span", "experience-panel__label", `${ui.theory} ${sectionIndex + 1} / ${theory.sections.length}`);
      appendText(documentRef, sectionContent, "h2", "", section.title);
      appendText(documentRef, sectionContent, "p", "experience-stage__situation", section.body);
      section.media_ids.forEach(id => {
        const media = mediaById.get(id);
        if (!media) return;
        const image = createElement(documentRef, "img", "experience-media__asset");
        image.src = `${baseUrl}/${media.src}`;
        image.alt = media.alt;
        sectionContent.appendChild(image);
      });
      panel.appendChild(sectionContent);
      const actions = createElement(documentRef, "div", "environment-theory__actions");
      const next = createButton(documentRef, sectionIndex === theory.sections.length - 1 ? ui.completeTheory : ui.continueTheory, "experience-action experience-action--primary");
      next.addEventListener("click", () => {
        onTheorySectionCompleted?.(environment.id, section.id);
        if (sectionIndex === theory.sections.length - 1) renderEnvironment(environment.id);
        else { sectionIndex += 1; renderSection(); }
      });
      actions.appendChild(next);
      panel.appendChild(actions);
      content.replaceChildren(panel);
    };
    renderSection();
    element.replaceChildren(shell);
  }

  function togglePopover(record) {
    if (activeRecord === record) {
      closePopover({ restoreFocus: true });
      return;
    }
    closePopover({ restoreFocus: false });
    activeRecord = record;
    const popoverId = `environment-popover-${selectedEnvironment.id}-${record.experience.editorialId}`;
    record.marker.setAttribute("aria-expanded", "true");
    record.marker.setAttribute("aria-controls", popoverId);

    activeConnector = createElement(documentRef, "span", "environment-popover__connector");
    activeConnector.setAttribute("aria-hidden", "true");
    stage.appendChild(activeConnector);
    activePopover = createElement(documentRef, "section", "environment-popover");
    activePopover.id = popoverId;
    activePopover.setAttribute("role", "dialog");
    activePopover.setAttribute("aria-modal", "false");
    const titleId = `${popoverId}-title`;
    activePopover.setAttribute("aria-labelledby", titleId);
    appendText(documentRef, activePopover, "span", "environment-experience__id", record.experience.editorialId);
    const title = appendText(documentRef, activePopover, "h2", "", record.experience.title);
    title.id = titleId;
    appendText(documentRef, activePopover, "p", "", record.experience.summary);
    const controls = createElement(documentRef, "div", "environment-popover__actions");
    const start = createButton(documentRef, ui.beginInvestigation, "experience-action experience-action--primary");
    start.addEventListener("click", event => {
      event?.stopPropagation?.();
      closePopover({ restoreFocus: false });
      return onOpenExperience(record.experience.id, selectedEnvironment.id);
    });
    const close = createButton(documentRef, ui.close, "experience-action experience-action--quiet");
    close.setAttribute("aria-label", `${ui.close} ${record.experience.title}`);
    close.addEventListener("click", event => {
      event?.stopPropagation?.();
      closePopover({ restoreFocus: true });
    });
    controls.appendChild(start);
    controls.appendChild(close);
    activePopover.appendChild(controls);
    activePopover.addEventListener("click", event => event?.stopPropagation?.());
    stage.appendChild(activePopover);
    resizeObserver = resizeObserverFactory(positionActivePopover);
    resizeObserver?.observe?.(stage);
    resizeObserver?.observe?.(activePopover);
    positionActivePopover();
    close.focus?.();
  }

  function positionActivePopover() {
    if (!stage || !activeRecord || !activePopover || !activeConnector) return;
    const viewerRect = stage.getBoundingClientRect?.();
    const markerRect = activeRecord.marker.getBoundingClientRect?.();
    const popoverRect = activePopover.getBoundingClientRect?.();
    if (!viewerRect || !markerRect || !popoverRect || !viewerRect.width || !viewerRect.height
      || !popoverRect.width || !popoverRect.height) return;
    const localRect = rect => ({
      x: rect.left - viewerRect.left,
      y: rect.top - viewerRect.top,
      width: rect.width,
      height: rect.height
    });
    const placement = chooseEnvironmentPopoverPlacement({
      viewer: { x: 0, y: 0, width: viewerRect.width, height: viewerRect.height },
      popover: { width: popoverRect.width, height: popoverRect.height },
      anchor: localRect(markerRect),
      obstacles: hotspotRecords
        .filter(record => record !== activeRecord)
        .map(record => localRect(record.marker.getBoundingClientRect()))
    });
    activePopover.dataset.placement = placement.placement;
    activePopover.style.setProperty("--popover-x", `${placement.x}px`);
    activePopover.style.setProperty("--popover-y", `${placement.y}px`);
    activeConnector.style.setProperty("--connector-x", `${placement.connector.x}px`);
    activeConnector.style.setProperty("--connector-y", `${placement.connector.y}px`);
    activeConnector.style.setProperty("--connector-length", `${placement.connector.length}px`);
    activeConnector.style.setProperty("--connector-angle", `${placement.connector.angle}deg`);
  }

  function closePopover({ restoreFocus }) {
    if (!activeRecord) return;
    const marker = activeRecord.marker;
    resizeObserver?.disconnect?.();
    resizeObserver = null;
    activePopover?.remove?.();
    activeConnector?.remove?.();
    marker.setAttribute("aria-expanded", "false");
    marker.removeAttribute?.("aria-controls");
    activeRecord = null;
    activePopover = null;
    activeConnector = null;
    if (restoreFocus) marker.focus?.();
  }

  function handleOutsideClick(event) {
    if (!activeRecord) return;
    const target = event?.target;
    if (activeRecord.marker.contains?.(target) || activePopover?.contains?.(target)) return;
    closePopover({ restoreFocus: true });
  }

  function handleKeydown(event) {
    if (event?.key !== "Escape" || !activeRecord) return;
    event.preventDefault?.();
    closePopover({ restoreFocus: true });
  }

  function renderProgress() {
    if (!selectedEnvironment || !progressElement) return;
    const available = [...new Set(selectedEnvironment.hotspots
      .map(item => experienceByEditorialId.get(item.experienceEditorialId))
      .filter(Boolean))];
    if (selectedEnvironment.contractVersion === "2.0.0") {
      const progress = progressStore.getEnvironmentProgress(selectedEnvironment.id);
      const heading = createElement(documentRef, "div", "environment-progress__heading");
      appendText(documentRef, heading, "span", "", ui.environmentProgress);
      const summary = createElement(documentRef, "p", "environment-progress__summary");
      summary.textContent = `${ui.theory} ${progress.theory.completedSections} / ${progress.theory.totalSections} · ${ui.experiencesCompleted} ${progress.experiences.completed} / ${progress.experiences.total} · ${ui.experiencesMastered} ${progress.experiences.mastered} / ${progress.experiences.total}`;
      progressElement.replaceChildren(heading, summary);
      return;
    }
    const completed = available.filter(item => progressStore.isCompleted(item.id)).length;
    const total = available.length;
    const percentage = total ? Math.min(100, Math.max(0, completed / total * 100)) : 0;
    const heading = createElement(documentRef, "div", "environment-progress__heading");
    appendText(documentRef, heading, "span", "", ui.environmentProgress);
    appendText(documentRef, heading, "strong", "", `${completed} / ${total}`);
    const track = createElement(documentRef, "div", "environment-progress__track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(total));
    track.setAttribute("aria-valuenow", String(completed));
    track.setAttribute("aria-label", `${selectedEnvironment.id} ${selectedEnvironment.title}: ${ui.environmentProgress}`);
    track.setAttribute("aria-valuetext", ui.completedValue(completed, total));
    const fill = createElement(documentRef, "span", "environment-progress__fill");
    fill.style.setProperty("--environment-progress", `${percentage}%`);
    fill.dataset.empty = String(percentage === 0);
    track.appendChild(fill);
    const summary = createElement(documentRef, "p", "environment-progress__summary");
    summary.textContent = ui.completedSummary(completed);
    progressElement.replaceChildren(heading, track, summary);
  }

  function completeExperience(experienceId) {
    progressStore.complete(experienceId);
    renderProgress();
  }

  function leaveEnvironment() {
    closePopover({ restoreFocus: false });
    resizeObserver?.disconnect?.();
    resizeObserver = null;
    documentRef.removeEventListener?.("click", handleOutsideClick);
    documentRef.removeEventListener?.("keydown", handleKeydown);
    windowRef?.removeEventListener?.("resize", positionActivePopover);
    stage = null;
    progressElement = null;
    hotspotRecords = [];
  }

  function restore() {
    if (selectedEnvironment) renderEnvironment(selectedEnvironment.id);
    else renderCatalog();
  }

  function destroy() {
    unsubscribeProgress?.();
    leaveEnvironment();
    selectedEnvironment = null;
    element.replaceChildren();
  }

  renderCatalog();
  return Object.freeze({
    element,
    renderCatalog,
    renderEnvironment,
    restore,
    completeExperience,
    refreshProgress: renderProgress,
    destroy
  });
}

function createShell(documentRef) {
  const ui = environmentUiCopy(documentRef.documentElement?.lang);
  const shell = createElement(documentRef, "div", "experience-workspace__shell");
  const header = createElement(documentRef, "header", "experience-workspace__catalog-header");
  appendText(documentRef, header, "span", "experience-workspace__eyebrow", ui.experienceLab);
  appendText(documentRef, header, "h1", "", ui.catalogTitle);
  appendText(
    documentRef,
    header,
    "p",
    "experience-workspace__lede",
    ui.catalogLede
  );
  shell.appendChild(header);
  return shell;
}

function environmentUiCopy(locale) {
  const language = typeof locale === "string" ? locale.toLowerCase().split("-")[0] : "en";
  return language === "es" ? {
    experienceLab: "Laboratorio de Experiences",
    catalogTitle: "Entornos industriales. Decisiones de diagnóstico reales.",
    catalogLede: "Selecciona un entorno, inspecciona la máquina e inicia una investigación disponible.",
    openEnvironment: "Abrir entorno",
    noEnvironments: "No hay entornos disponibles.",
    backToEnvironments: "Volver a entornos",
    backToEnvironment: "Volver al entorno",
    openTheory: "Abrir teoría",
    theory: "Teoría",
    theoryLede: "Fundamentos técnicos para las Experiences de diagnóstico de este entorno.",
    continueTheory: "Continuar teoría",
    completeTheory: "Completar teoría",
    inspect: "Inspeccionar",
    environmentPending: "Este entorno se está preparando. Las Experiences estarán disponibles cuando completen su revisión.",
    beginInvestigation: "Iniciar investigación",
    close: "Cerrar",
    environmentProgress: "Progreso del entorno",
    experiencesCompleted: "Experiences completadas",
    experiencesMastered: "Experiences dominadas",
    completedValue: (completed, total) => `${completed} de ${total} Experiences completadas`,
    completedSummary: completed => `${completed} ${completed === 1 ? "Experience completada" : "Experiences completadas"}`
  } : {
    experienceLab: "Experience Lab",
    catalogTitle: "Industrial environments. Real diagnostic decisions.",
    catalogLede: "Select an environment, inspect the machine and begin an available investigation.",
    openEnvironment: "Open environment",
    noEnvironments: "No environments are available.",
    backToEnvironments: "Back to environments",
    backToEnvironment: "Back to environment",
    openTheory: "Open Theory",
    theory: "Theory",
    theoryLede: "Technical foundations for the diagnostic Experiences in this environment.",
    continueTheory: "Continue Theory",
    completeTheory: "Complete Theory",
    inspect: "Inspect",
    environmentPending: "This environment is being prepared. Experiences will become available here as they complete review.",
    beginInvestigation: "Begin investigation",
    close: "Close",
    environmentProgress: "Environment progress",
    experiencesCompleted: "Experiences completed",
    experiencesMastered: "Experiences mastered",
    completedValue: (completed, total) => `${completed} of ${total} Experiences completed`,
    completedSummary: completed => `${completed} ${completed === 1 ? "Experience" : "Experiences"} completed`
  };
}

function defaultResizeObserverFactory(callback) {
  return typeof globalThis.ResizeObserver === "function"
    ? new globalThis.ResizeObserver(callback)
    : null;
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
