const VIEWER_TITLE_ID = "d2r-simulator-viewer-title";

export function createSimulatorViewer(simulator, onClose, returnFocusTo = null, { documentRef = globalThis.document } = {}) {
  if (!simulator || typeof simulator !== "object") {
    throw new TypeError("Simulator viewer requires simulator data.");
  }

  if (typeof onClose !== "function") {
    throw new TypeError("Simulator viewer requires a close callback.");
  }

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Simulator viewer requires a document.");
  }

  const dialog = documentRef.createElement("dialog");
  dialog.className = "simulator-viewer";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", VIEWER_TITLE_ID);

  const toolbar = documentRef.createElement("header");
  toolbar.className = "simulator-viewer__toolbar";

  const title = documentRef.createElement("h2");
  title.id = VIEWER_TITLE_ID;
  title.className = "simulator-viewer__title";

  const closeButton = documentRef.createElement("button");
  closeButton.type = "button";
  closeButton.className = "simulator-viewer__close";
  closeButton.addEventListener("click", onClose);

  const frame = documentRef.createElement("iframe");
  frame.className = "simulator-viewer__frame";
  frame.setAttribute("allowfullscreen", "");
  frame.loading = "eager";

  toolbar.append(title, closeButton);
  dialog.append(toolbar, frame);

  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  dialog.addEventListener("cancel", handleCancel);

  function update(nextSimulator) {
    if (!nextSimulator || typeof nextSimulator !== "object") {
      throw new TypeError("Simulator viewer update requires simulator data.");
    }

    title.textContent = nextSimulator.title;
    closeButton.textContent = nextSimulator.closeLabel;
    closeButton.setAttribute("aria-label", nextSimulator.closeLabel);
    frame.title = nextSimulator.frameTitle;
    const nextUrl = requireLocalPath(nextSimulator.htmlUrl);
    if (frame.getAttribute("src") !== nextUrl) frame.setAttribute("src", nextUrl);
  }

  function activate() {
    if (dialog.parentNode !== documentRef.body) documentRef.body.appendChild(dialog);
    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  }

  function destroy() {
    closeButton.removeEventListener("click", onClose);
    dialog.removeEventListener("cancel", handleCancel);
    if (dialog.open) dialog.close();
    dialog.remove();
    returnFocusTo?.focus?.({ preventScroll: true });
  }

  update(simulator);
  return { element: dialog, activate, destroy, update };
}

function requireLocalPath(value) {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.includes(":") || value.split("/").includes("..")) {
    throw new TypeError("Simulator HTML must use a local relative path.");
  }
  return value;
}
