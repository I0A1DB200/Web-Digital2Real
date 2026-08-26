import { chooseEnvironmentPopoverPlacement } from "./environmentPopoverPosition.js";
import { createEnvironmentProgressStore } from "./environmentProgressStore.js";

export function createEnvironmentNavigator({
  documentRef,
  baseUrl,
  environments,
  experiences,
  onOpenExperience,
  progressStore = createEnvironmentProgressStore(),
  windowRef = globalThis.window,
  resizeObserverFactory = defaultResizeObserverFactory
}) {
  const element = documentRef.createElement("div");
  element.className = "environment-navigator";
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
      card.setAttribute("aria-label", `Open environment: ${environment.title}`);
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
      appendText(documentRef, list, "p", "experience-workspace__empty", "No environments are available.");
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
    back.textContent = "Back to environments";
    back.addEventListener("click", renderCatalog);
    shell.appendChild(back);
    const heading = createElement(documentRef, "header", "environment-view__header");
    const title = createElement(documentRef, "div", "environment-view__title");
    appendText(documentRef, title, "span", "experience-workspace__eyebrow", environment.id);
    appendText(documentRef, title, "h1", "", environment.title);
    heading.appendChild(title);
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
      marker.setAttribute("aria-label", `Inspect ${experience.title}`);
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
        "This environment is being prepared. Experiences will become available here as they complete review."
      );
    }
    element.replaceChildren(shell);
    documentRef.addEventListener?.("click", handleOutsideClick);
    documentRef.addEventListener?.("keydown", handleKeydown);
    windowRef?.addEventListener?.("resize", positionActivePopover);
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
    const start = createButton(documentRef, "Begin investigation", "experience-action experience-action--primary");
    start.addEventListener("click", event => {
      event?.stopPropagation?.();
      closePopover({ restoreFocus: false });
      return onOpenExperience(record.experience.id);
    });
    const close = createButton(documentRef, "Close", "experience-action experience-action--quiet");
    close.setAttribute("aria-label", `Close ${record.experience.title}`);
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
    const completed = available.filter(item => progressStore.isCompleted(item.id)).length;
    const total = available.length;
    const percentage = total ? Math.min(100, Math.max(0, completed / total * 100)) : 0;
    const heading = createElement(documentRef, "div", "environment-progress__heading");
    appendText(documentRef, heading, "span", "", "Environment progress");
    appendText(documentRef, heading, "strong", "", `${completed} / ${total}`);
    const track = createElement(documentRef, "div", "environment-progress__track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(total));
    track.setAttribute("aria-valuenow", String(completed));
    track.setAttribute("aria-label", `${selectedEnvironment.id} ${selectedEnvironment.title}: Environment progress`);
    track.setAttribute("aria-valuetext", `${completed} of ${total} Experiences completed`);
    const fill = createElement(documentRef, "span", "environment-progress__fill");
    fill.style.setProperty("--environment-progress", `${percentage}%`);
    fill.dataset.empty = String(percentage === 0);
    track.appendChild(fill);
    const summary = createElement(documentRef, "p", "environment-progress__summary");
    summary.textContent = `${completed} ${completed === 1 ? "Experience" : "Experiences"} completed`;
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
    destroy
  });
}

function createShell(documentRef) {
  const shell = createElement(documentRef, "div", "experience-workspace__shell");
  const header = createElement(documentRef, "header", "experience-workspace__catalog-header");
  appendText(documentRef, header, "span", "experience-workspace__eyebrow", "Experience Lab");
  appendText(documentRef, header, "h1", "", "Industrial environments. Real diagnostic decisions.");
  appendText(
    documentRef,
    header,
    "p",
    "experience-workspace__lede",
    "Select an environment, inspect the machine and begin an available investigation."
  );
  shell.appendChild(header);
  return shell;
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
