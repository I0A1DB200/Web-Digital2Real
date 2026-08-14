import assert from "node:assert/strict";
import test from "node:test";

import { createNavbar } from "../navbar.js";

class ClassList {
  constructor(element) {
    this.element = element;
    this.values = new Set();
  }
  add(...values) { values.forEach(value => this.values.add(value)); this.sync(); }
  remove(...values) { values.forEach(value => this.values.delete(value)); this.sync(); }
  toggle(value, force) {
    const enabled = force ?? !this.values.has(value);
    enabled ? this.values.add(value) : this.values.delete(value);
    this.sync();
    return enabled;
  }
  contains(value) { return this.values.has(value); }
  set(value) { this.values = new Set(String(value).split(/\s+/u).filter(Boolean)); this.sync(); }
  sync() { this.element._className = [...this.values].join(" "); }
}

class ElementStub {
  constructor(tagName, documentRef) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = documentRef;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.listeners = new Map();
    this.dataset = {};
    this.classList = new ClassList(this);
    this._className = "";
    this.textContent = "";
    this.id = "";
  }
  get className() { return this._className; }
  set className(value) { this.classList.set(value); }
  append(...items) {
    items.forEach(item => {
      if (typeof item === "string") return;
      item.parentNode = this;
      this.children.push(item);
    });
  }
  appendChild(child) { this.append(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;
    (this.listeners.get(event.type) ?? []).forEach(listener => listener(event));
    if (event.bubbles !== false && this.parentNode) this.parentNode.dispatchEvent(event);
  }
  click() { this.dispatchEvent(event("click")); }
  focus() { this.ownerDocument.activeElement = this; }
  contains(candidate) { return candidate === this || this.children.some(child => child.contains(candidate)); }
  closest(selector) {
    if (selector === ".topbar__menu-toggle" && this.classList.contains("topbar__menu-toggle")) return this;
    if (selector === "button[data-view]" && this.tagName === "BUTTON" && this.dataset.view) return this;
    return this.parentNode?.closest?.(selector) ?? null;
  }
}

class DocumentStub {
  constructor() { this.listeners = new Map(); this.activeElement = null; }
  createElement(tagName) { return new ElementStub(tagName, this); }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type, listener) {
    if (this.listeners.get(type) === listener) this.listeners.delete(type);
  }
  dispatchEvent(value) { this.listeners.get(value.type)?.(value); }
}

class MediaQueryStub {
  constructor() { this.listeners = new Set(); }
  addEventListener(type, listener) { if (type === "change") this.listeners.add(listener); }
  removeEventListener(type, listener) { if (type === "change") this.listeners.delete(listener); }
  change(matches) { this.listeners.forEach(listener => listener({ matches })); }
}

const site = {
  navigation: [
    { label: "Engineering Notes", view: "engineering-notes" },
    { label: "Experience Lab", view: "experience-lab" },
    { label: "About", view: "about" }
  ]
};

function event(type, values = {}) {
  return { type, bubbles: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...values };
}

function all(root) { return root.children.flatMap(child => [child, ...all(child)]); }
function byClass(root, name) { return all(root).find(item => item.classList.contains(name)); }
function byView(root, view) {
  return all(root).find(item => item.dataset.view === view && item.classList.contains("topbar__link"));
}

function setup() {
  const documentRef = new DocumentStub();
  const media = new MediaQueryStub();
  const navigations = [];
  const header = createNavbar(site, "engineering-notes", view => navigations.push(view), {
    documentRef,
    windowRef: { matchMedia: () => media }
  });
  return { documentRef, media, navigations, header, toggle: byClass(header, "topbar__menu-toggle") };
}

test("renders data-driven navigation and accessible collapsed menu state", () => {
  const { header, toggle } = setup();
  assert.equal(toggle.textContent, "☰");
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-controls"), "main-navigation");
  assert.deepEqual(site.navigation.map(item => byView(header, item.view).textContent), site.navigation.map(item => item.label));
  assert.equal(byView(header, "engineering-notes").getAttribute("aria-current"), "page");
});

test("toggles, closes on navigation and preserves the selected data view", () => {
  const { header, toggle, navigations } = setup();
  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(header.classList.contains("is-menu-open"), true);
  byView(header, "about").click();
  assert.deepEqual(navigations, ["about"]);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

test("closes on outside pointer, Escape and desktop resize", () => {
  const { documentRef, media, header, toggle } = setup();
  toggle.click();
  documentRef.dispatchEvent(event("pointerdown", { target: new ElementStub("div", documentRef) }));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");

  toggle.click();
  const escape = event("keydown", { key: "Escape" });
  header.dispatchEvent(escape);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(documentRef.activeElement, toggle);

  toggle.click();
  media.change(false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

test("destroy removes document and viewport listeners", () => {
  const { documentRef, media, header } = setup();
  assert.equal(documentRef.listeners.has("pointerdown"), true);
  assert.equal(media.listeners.size, 1);
  header.destroy();
  assert.equal(documentRef.listeners.has("pointerdown"), false);
  assert.equal(media.listeners.size, 0);
});
