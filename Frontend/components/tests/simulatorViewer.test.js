import test from "node:test";
import assert from "node:assert/strict";
import { getSite } from "../../data/site.js";
import { createSimulatorViewer } from "../simulatorViewer.js";

function elementStub(tagName) {
  return {
    tagName,
    children: [],
    attributes: {},
    listeners: {},
    parentNode: null,
    open: false,
    appendChild(child) { child.parentNode = this; this.children.push(child); },
    append(...children) { children.forEach(child => this.appendChild(child)); },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? null; },
    addEventListener(name, listener) { this.listeners[name] = listener; },
    removeEventListener(name) { delete this.listeners[name]; },
    focus() { this.focused = true; },
    showModal() { this.open = true; },
    close() { this.open = false; },
    remove() { this.removed = true; this.parentNode = null; }
  };
}

function documentStub() {
  const body = elementStub("body");
  return { body, createElement: tagName => elementStub(tagName) };
}

function findByClass(root, className) {
  if (root.className === className) return root;
  for (const child of root.children ?? []) {
    const match = findByClass(child, className);
    if (match) return match;
  }
  return null;
}

test("simulator viewer embeds the local HTML in a modal dialog", () => {
  const documentRef = documentStub();
  const opener = elementStub("a");
  let closeRequested = 0;
  const viewer = createSimulatorViewer(getSite("en").simulators[0], () => { closeRequested += 1; }, opener, { documentRef });

  viewer.activate();
  const frame = findByClass(viewer.element, "simulator-viewer__frame");
  const closeButton = findByClass(viewer.element, "simulator-viewer__close");
  assert.equal(viewer.element.tagName, "dialog");
  assert.equal(viewer.element.open, true);
  assert.equal(viewer.element.parentNode, documentRef.body);
  assert.equal(frame.getAttribute("src"), "simulators/d2r-inspection-cell/index.html");
  assert.equal(frame.title, "D2R Inspection Cell · 3D Simulator");
  assert.equal(closeButton.textContent, "Back to catalog");

  closeButton.listeners.click();
  assert.equal(closeRequested, 1);
  viewer.destroy();
  assert.equal(viewer.element.removed, true);
  assert.equal(opener.focused, true);
});

test("simulator viewer updates its title and stays on the local HTML route", () => {
  const viewer = createSimulatorViewer(getSite("en").simulators[0], () => {}, null, { documentRef: documentStub() });
  viewer.update(getSite("es").simulators[1]);

  assert.equal(findByClass(viewer.element, "simulator-viewer__title").textContent, "Programación de cobot / Paletizado");
  assert.equal(findByClass(viewer.element, "simulator-viewer__close").textContent, "Volver al catálogo");
  assert.equal(findByClass(viewer.element, "simulator-viewer__frame").getAttribute("src"), "simulators/cobot/index.html");
});

test("simulator viewer rejects external iframe URLs", () => {
  assert.throws(
    () => createSimulatorViewer({ ...getSite("en").simulators[0], htmlUrl: "https://example.com/simulator.html" }, () => {}, null, { documentRef: documentStub() }),
    /local relative path/
  );
});
