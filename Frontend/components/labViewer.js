const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function createLabViewer(lab, onClose, returnFocusTo = null) {
  if (!lab || typeof lab !== "object") {
    throw new TypeError("Lab viewer requires laboratory data.");
  }

  if (typeof onClose !== "function") {
    throw new TypeError("Lab viewer requires a close callback.");
  }

  const title = getText(lab.title, "Laboratory");
  const titleId = `lab-viewer-title-${getIdentifier(lab.slug ?? lab.id ?? title)}`;
  const overlay = document.createElement("section");
  overlay.className = "lab-viewer";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", titleId);

  const backdrop = document.createElement("div");
  backdrop.className = "lab-viewer__backdrop";

  const panel = document.createElement("div");
  panel.className = "lab-viewer__panel";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "lab-viewer__close";
  closeButton.setAttribute("aria-label", "Close laboratory");
  closeButton.textContent = "×";

  const videoContainer = createVideo(lab, title);
  const content = createContent(lab, title, titleId);
  panel.append(closeButton, videoContainer, content);
  overlay.append(backdrop, panel);

  let isActive = false;
  let isDestroyed = false;

  function requestClose() {
    onClose();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(overlay);

    if (focusableElements.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!overlay.contains(document.activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function activate() {
    if (isActive || isDestroyed) {
      return;
    }

    isActive = true;
    document.body.classList.add("is-locked");
    closeButton.addEventListener("click", requestClose);
    backdrop.addEventListener("click", requestClose);
    document.addEventListener("keydown", handleKeydown);
    closeButton.focus();
  }

  function destroy() {
    if (isDestroyed) {
      return;
    }

    isDestroyed = true;
    isActive = false;
    closeButton.removeEventListener("click", requestClose);
    backdrop.removeEventListener("click", requestClose);
    document.removeEventListener("keydown", handleKeydown);
    overlay.querySelectorAll("video").forEach(video => video.pause());
    overlay.remove();
    document.body.classList.remove("is-locked");

    if (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) {
      returnFocusTo.focus();
    }
  }

  return {
    element: overlay,
    activate,
    destroy
  };
}

function createVideo(lab, title) {
  const container = document.createElement("div");
  container.className = "lab-viewer__video";

  if (typeof lab.video !== "string" || lab.video.length === 0) {
    return container;
  }

  const video = document.createElement("video");
  video.controls = true;
  video.setAttribute("aria-label", `${title} laboratory video`);

  if (typeof lab.cover === "string" && lab.cover.length > 0) {
    video.poster = lab.cover;
  }

  const source = document.createElement("source");
  source.src = lab.video;
  source.type = "video/mp4";
  video.appendChild(source);
  container.appendChild(video);

  return container;
}

function createContent(lab, title, titleId) {
  const content = document.createElement("div");
  content.className = "lab-viewer__content";

  const identifier = document.createElement("span");
  identifier.className = "lab-viewer__id";
  identifier.textContent = getText(lab.id, "");

  const heading = document.createElement("h2");
  heading.id = titleId;
  heading.textContent = title;

  const description = document.createElement("p");
  description.textContent = getText(lab.description, "");

  const specifications = document.createElement("dl");
  specifications.className = "lab-viewer__specs";
  appendSpecification(specifications, "Status", lab.status);
  appendSpecification(specifications, "Version", lab.version);
  appendSpecification(specifications, "Released", lab.released);

  const tags = document.createElement("div");
  tags.className = "lab-viewer__tags";
  const technologies = Array.isArray(lab.technologies) ? lab.technologies : [];

  technologies.forEach(technology => {
    appendTextItem(tags, technology);
  });

  content.append(identifier, heading, description, specifications, tags);
  return content;
}

function appendSpecification(list, label, value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return;
  }

  const group = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = String(value);
  group.append(term, description);
  list.appendChild(group);
}

function appendTextItem(container, value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return;
  }

  const item = document.createElement("span");
  item.textContent = String(value);
  container.appendChild(item);
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(element => {
    return element instanceof HTMLElement && !element.hidden;
  });
}

function getIdentifier(value) {
  const identifier = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return identifier || "laboratory";
}

function getText(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
