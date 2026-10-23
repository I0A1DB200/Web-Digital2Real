import assert from "node:assert/strict";
import test from "node:test";

import { createNotebookCard } from "../components/notebookCard.js";

class ClassListStub {
  constructor(element) { this.element = element; this.values = new Set(); }
  set(value) { this.values = new Set(String(value).split(/\s+/u).filter(Boolean)); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  contains(value) { return this.values.has(value); }
}

class ElementStub {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new ClassListStub(this);
    this._className = "";
    this.textContent = "";
  }
  get className() { return this._className; }
  set className(value) { this._className = String(value); this.classList.set(value); }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  click() { this.listeners.get("click")?.(); }
}

class DocumentStub {
  createElement(tagName) { return new ElementStub(tagName, this); }
}

function descendants(root) {
  return root.children.flatMap(child => [child, ...descendants(child)]);
}

function byClass(root, className) {
  return descendants(root).find(element => element.classList.contains(className));
}

const article = Object.freeze({
  id: "article-042",
  title: "Reliable control under real operating constraints",
  excerpt: "A long supporting description remains in source data and is presentation-clamped by shared CSS.",
  categories: Object.freeze(["Industrial Automation"]),
  readingTime: 1,
  coverImage: "./assets/images/notebook/example.png",
  coverAlt: "Industrial equipment"
});

test("renders one full-image editorial card with shared branding and footer", () => {
  const documentRef = new DocumentStub();
  const opened = [];
  const card = createNotebookCard(article, selected => opened.push(selected), { documentRef });

  assert.equal(card.tagName, "BUTTON");
  assert.equal(card.children[0].className, "notebook-card__thumbnail");
  assert.equal(card.children[1].className, "notebook-card__content");
  assert.equal(byClass(card, "notebook-card__brand").textContent, "D2R");
  assert.equal(byClass(card, "notebook-card__identity").textContent, "Engineering Note #042");
  assert.equal(byClass(card, "notebook-card__excerpt"), undefined);
  assert.equal(byClass(card, "notebook-card__category").textContent, "Industrial Automation");
  assert.equal(byClass(card, "notebook-card__accent").getAttribute("aria-hidden"), "true");
  assert.equal(byClass(card, "notebook-card__open-icon").getAttribute("aria-hidden"), "true");
  assert.equal(card.getAttribute("aria-label"), `Read ${article.title}`);

  card.click();
  assert.deepEqual(opened, [article]);
});

test("keeps missing-image cards inside the same canonical component", () => {
  const documentRef = new DocumentStub();
  const card = createNotebookCard({ ...article, coverImage: "" }, undefined, { documentRef });

  assert.equal(card.tagName, "ARTICLE");
  assert.equal(card.classList.contains("notebook-card--text-only"), true);
  assert.equal(byClass(card, "notebook-card__open-icon"), undefined);
});
