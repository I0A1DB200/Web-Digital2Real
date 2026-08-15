import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createNotebookCarousel,
  deriveNotebookCategories
} from "../components/notebookCarousel.js";

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.values = new Set();
  }

  add(...values) {
    values.filter(Boolean).forEach(value => this.values.add(value));
    this.sync();
  }

  remove(...values) {
    values.forEach(value => this.values.delete(value));
    this.sync();
  }

  contains(value) {
    return this.values.has(value);
  }

  setFrom(value) {
    this.values = new Set(String(value).split(/\s+/u).filter(Boolean));
    this.sync();
  }

  sync() {
    this.element._className = [...this.values].join(" ");
  }
}

class FakeElement {
  constructor(tagName, documentRef) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = documentRef;
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new FakeClassList(this);
    this.disabled = false;
    this.textContent = "";
    this.type = "";
    this._className = "";
  }

  get className() {
    return this._className;
  }

  set className(value) {
    this.classList.setFrom(value);
  }

  append(...children) {
    children.forEach(child => this.appendChild(child));
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children.forEach(child => { child.parentNode = null; });
    this.children = [];
    this.append(...children);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

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
    return !event.defaultPrevented;
  }

  click() {
    if (this.disabled) return;
    this.dispatchEvent(createEvent("click"));
  }

  contains(candidate) {
    return candidate === this || this.children.some(child => child.contains(candidate));
  }
}

class FakeDocument {
  constructor() {
    this.activeElement = null;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

const articles = Object.freeze([
  article("article-001", "One", ["Controls"]),
  article("article-002", "Two", ["Networks"]),
  article("article-003", "Three", ["Controls", "Safety"]),
  article("article-004", "Four", ["Networks"]),
  article("article-005", "Five", ["Controls"]),
  article("article-006", "A deliberately long Engineering Note title that must remain available", ["Safety"]),
  { ...article("article-007", "Without cover", []), coverImage: undefined }
]);

function article(id, title, categories) {
  return Object.freeze({ id, title, categories: Object.freeze(categories), coverImage: `${id}.png` });
}

function createEvent(type, properties = {}) {
  return {
    type,
    bubbles: true,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    ...properties
  };
}

function cardFactory(documentRef) {
  return (publication, onActivate) => {
    const card = documentRef.createElement("button");
    card.type = "button";
    card.className = "notebook-card reveal";
    card.textContent = publication.title;
    card.setAttribute("data-article-id", publication.id);
    card.addEventListener("click", () => onActivate(publication, card));
    return card;
  };
}

function setup(source = articles) {
  const documentRef = new FakeDocument();
  const opened = [];
  const carousel = createNotebookCarousel(
    source,
    (publication, opener) => opened.push({ publication, opener }),
    { documentRef, cardFactory: cardFactory(documentRef) }
  );
  return { carousel, opened };
}

function descendants(root) {
  return root.children.flatMap(child => [child, ...descendants(child)]);
}

function byClass(root, className) {
  return descendants(root).filter(element => element.classList.contains(className));
}

function byText(root, text) {
  return descendants(root).find(element => element.textContent === text);
}

function activeCard(root) {
  return byClass(root, "notebook-carousel__card")
    .find(card => card.getAttribute("aria-current") === "true");
}

function visibleArticles(root) {
  return byClass(root, "notebook-carousel__card")
    .map(card => [card.getAttribute("data-position"), card.getAttribute("data-article-id")]);
}

test("derives categories dynamically in canonical first-seen order without mutation", () => {
  const before = JSON.stringify(articles);
  assert.deepEqual(deriveNotebookCategories(articles), ["Controls", "Networks", "Safety"]);
  assert.equal(JSON.stringify(articles), before);
});

test("has deterministic All state and renders a circular five-card window without mutation", () => {
  const before = JSON.stringify(articles);
  const { carousel } = setup();
  assert.deepEqual(carousel.getState(), {
    activeCategory: "All",
    activeIndex: 0,
    categories: ["Controls", "Networks", "Safety"],
    filteredCount: 7
  });
  assert.deepEqual(visibleArticles(carousel.element), [
    ["-2", "article-006"],
    ["-1", "article-007"],
    ["0", "article-001"],
    ["1", "article-002"],
    ["2", "article-003"]
  ]);
  assert.equal(activeCard(carousel.element).getAttribute("data-article-id"), "article-001");
  assert.equal(activeCard(carousel.element).classList.contains("reveal"), false);
  assert.equal(JSON.stringify(articles), before);
});

test("filters from canonical categories and resets the active index", () => {
  const { carousel } = setup();
  byText(carousel.element, "→").click();
  byText(carousel.element, "→").click();
  assert.equal(carousel.getState().activeIndex, 2);

  const filter = byText(carousel.element, "Networks");
  filter.click();
  assert.equal(filter.getAttribute("aria-pressed"), "false");
  const currentFilter = byText(carousel.element, "Networks");
  assert.equal(currentFilter.getAttribute("aria-pressed"), "true");
  assert.equal(carousel.getState().activeCategory, "Networks");
  assert.equal(carousel.getState().activeIndex, 0);
  assert.equal(carousel.getState().filteredCount, 2);
  assert.equal(activeCard(carousel.element).getAttribute("data-article-id"), "article-002");
  assert.deepEqual(visibleArticles(carousel.element), [
    ["0", "article-002"],
    ["1", "article-004"]
  ]);
  byText(carousel.element, "←").click();
  assert.equal(activeCard(carousel.element).getAttribute("data-article-id"), "article-004");
});

test("responsive filters share canonical categories and active state with desktop pills", () => {
  const { carousel } = setup();
  const desktopLabels = byClass(carousel.element, "notebook-carousel__filter")
    .map(button => button.textContent);
  const menuLabels = byClass(carousel.element, "notebook-carousel__filter-menu-option")
    .map(button => button.textContent);
  assert.deepEqual(desktopLabels, ["All", "Controls", "Networks", "Safety"]);
  assert.deepEqual(menuLabels, desktopLabels);

  byText(carousel.element, "→").click();
  byText(carousel.element, "→").click();
  const toggle = byClass(carousel.element, "notebook-carousel__filter-toggle")[0];
  const menu = byClass(carousel.element, "notebook-carousel__filter-menu")[0];
  assert.equal(toggle.getAttribute("aria-label"), "Choose Engineering Notes category");
  assert.equal(toggle.getAttribute("aria-controls"), menu.id);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(menu.hidden, true);

  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(menu.hidden, false);
  byClass(menu, "notebook-carousel__filter-menu-option")
    .find(button => button.textContent === "Networks")
    .click();

  assert.equal(carousel.getState().activeCategory, "Networks");
  assert.equal(carousel.getState().activeIndex, 0);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(menu.hidden, true);
  assert.equal(
    byClass(carousel.element, "notebook-carousel__filter")
      .find(button => button.textContent === "Networks")
      .getAttribute("aria-pressed"),
    "true"
  );
  assert.equal(
    byClass(carousel.element, "notebook-carousel__filter-menu-option")
      .find(button => button.textContent === "Networks")
      .getAttribute("aria-pressed"),
    "true"
  );
});

test("responsive filter menu toggles and closes on Escape", () => {
  const { carousel } = setup();
  const toggle = byClass(carousel.element, "notebook-carousel__filter-toggle")[0];
  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");

  const escape = createEvent("keydown", { key: "Escape" });
  toggle.dispatchEvent(escape);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(byClass(carousel.element, "notebook-carousel__filter-menu")[0].hidden, true);
});

test("Previous and Next wrap circularly while preserving canonical order", () => {
  const { carousel } = setup();
  const previous = byText(carousel.element, "←");
  assert.equal(previous.disabled, false);
  previous.click();
  assert.equal(carousel.getState().activeIndex, articles.length - 1);
  assert.deepEqual(visibleArticles(carousel.element), [
    ["-2", "article-005"],
    ["-1", "article-006"],
    ["0", "article-007"],
    ["1", "article-001"],
    ["2", "article-002"]
  ]);
  byText(carousel.element, "→").click();
  assert.equal(carousel.getState().activeIndex, 0);
  assert.equal(byText(carousel.element, "→").disabled, false);
  assert.equal(byText(carousel.element, "←").disabled, false);

  for (let step = 0; step < 3; step += 1) byText(carousel.element, "→").click();
  assert.deepEqual(visibleArticles(carousel.element), [
    ["-2", "article-002"],
    ["-1", "article-003"],
    ["0", "article-004"],
    ["1", "article-005"],
    ["2", "article-006"]
  ]);
});

test("a neighboring card centers while the active card opens exactly once with its opener", () => {
  const { carousel, opened } = setup();
  const neighbor = byClass(carousel.element, "notebook-carousel__card")
    .find(card => card.getAttribute("data-position") === "1");
  neighbor.click();
  assert.equal(carousel.getState().activeIndex, 1);
  assert.equal(opened.length, 0);

  const active = activeCard(carousel.element);
  active.click();
  assert.equal(opened.length, 1);
  assert.equal(opened[0].publication.id, "article-002");
  assert.equal(opened[0].opener, active);
});

test("Left and Right navigation is scoped to events dispatched inside the carousel", () => {
  const { carousel } = setup();
  const right = createEvent("keydown", { key: "ArrowRight" });
  activeCard(carousel.element).dispatchEvent(right);
  assert.equal(right.defaultPrevented, true);
  assert.equal(carousel.getState().activeIndex, 1);

  const outside = createEvent("keydown", { key: "ArrowRight" });
  assert.equal(outside.defaultPrevented, false);
  assert.equal(carousel.getState().activeIndex, 1);
  activeCard(carousel.element).dispatchEvent(createEvent("keydown", { key: "ArrowLeft" }));
  assert.equal(carousel.getState().activeIndex, 0);
  activeCard(carousel.element).dispatchEvent(createEvent("keydown", { key: "ArrowLeft" }));
  assert.equal(carousel.getState().activeIndex, articles.length - 1);
  activeCard(carousel.element).dispatchEvent(createEvent("keydown", { key: "ArrowRight" }));
  assert.equal(carousel.getState().activeIndex, 0);
});

test("horizontal touch swipe moves one article and ignores short or vertical gestures", () => {
  const { carousel } = setup();
  const viewport = byClass(carousel.element, "notebook-carousel__viewport")[0];
  viewport.dispatchEvent(createEvent("pointerdown", { pointerType: "touch", clientX: 200, clientY: 100 }));
  viewport.dispatchEvent(createEvent("pointerup", { pointerType: "touch", clientX: 120, clientY: 105 }));
  assert.equal(carousel.getState().activeIndex, 1);

  viewport.dispatchEvent(createEvent("pointerdown", { pointerType: "touch", clientX: 120, clientY: 100 }));
  viewport.dispatchEvent(createEvent("pointerup", { pointerType: "touch", clientX: 95, clientY: 102 }));
  assert.equal(carousel.getState().activeIndex, 1);

  viewport.dispatchEvent(createEvent("pointerdown", { pointerType: "touch", clientX: 120, clientY: 100 }));
  viewport.dispatchEvent(createEvent("pointerup", { pointerType: "touch", clientX: 60, clientY: 190 }));
  assert.equal(carousel.getState().activeIndex, 1);

  byText(carousel.element, "←").click();
  viewport.dispatchEvent(createEvent("pointerdown", { pointerType: "touch", clientX: 120, clientY: 100 }));
  viewport.dispatchEvent(createEvent("pointerup", { pointerType: "touch", clientX: 200, clientY: 105 }));
  assert.equal(carousel.getState().activeIndex, articles.length - 1);
});

test("exposes accessible carousel, filter, active-card and position semantics", () => {
  const { carousel } = setup();
  assert.equal(carousel.element.getAttribute("role"), "region");
  assert.equal(carousel.element.getAttribute("aria-label"), "Engineering Notes carousel");
  assert.equal(activeCard(carousel.element).getAttribute("aria-current"), "true");
  assert.equal(byText(carousel.element, "All").getAttribute("aria-pressed"), "true");
  assert.equal(byClass(carousel.element, "notebook-carousel__position")[0].textContent, "1 of 7");
  assert.ok(byClass(carousel.element, "notebook-carousel__card").length <= 5);
});

test("handles empty and one-article collections without navigation or visual clones", () => {
  const empty = setup([]).carousel;
  assert.equal(empty.getState().filteredCount, 0);
  assert.equal(byText(empty.element, "←").disabled, true);
  assert.equal(byText(empty.element, "→").disabled, true);

  const one = setup([articles[5]]).carousel;
  assert.equal(activeCard(one.element).textContent, articles[5].title);
  assert.equal(byClass(one.element, "notebook-carousel__card").length, 1);
  assert.equal(byText(one.element, "←").disabled, true);
  assert.equal(byText(one.element, "→").disabled, true);
});

test("small collections render each article once and wrap deterministically", () => {
  for (const count of [2, 3, 4, 5]) {
    const { carousel } = setup(articles.slice(0, count));
    const visible = visibleArticles(carousel.element);
    const identifiers = visible.map(([, identifier]) => identifier);
    assert.equal(visible.length, count);
    assert.equal(new Set(identifiers).size, count);
    assert.equal(byText(carousel.element, "←").disabled, false);
    assert.equal(byText(carousel.element, "→").disabled, false);

    byText(carousel.element, "←").click();
    assert.equal(carousel.getState().activeIndex, count - 1);
    byText(carousel.element, "→").click();
    assert.equal(carousel.getState().activeIndex, 0);
  }
});

test("contains no autoplay, timer or wheel interception", async () => {
  const source = await readFile(new URL("../components/notebookCarousel.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /setInterval|setTimeout|autoplay/u);
  assert.doesNotMatch(source, /(?:wheel|mousewheel)/u);
  assert.doesNotMatch(source, /Controls|Networks|Safety/u);
  assert.equal((source.match(/let activeCategory/gu) ?? []).length, 1);
});
