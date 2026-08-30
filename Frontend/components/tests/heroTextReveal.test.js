import assert from "node:assert/strict";
import test from "node:test";

import { applyCharacterReveal, getCharacterRevealDuration } from "../heroTextReveal.js";

class StyleStub {
  constructor() { this.values = new Map(); }
  setProperty(name, value) { this.values.set(name, value); }
}

class ElementStub {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = new Map();
    this.className = "";
    this.style = new StyleStub();
    this.textContent = "";
  }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
}

class TextStub {
  constructor(textContent) { this.textContent = textContent; }
}

class DocumentStub {
  createElement(tagName) { return new ElementStub(tagName, this); }
  createTextNode(value) { return new TextStub(value); }
}

function descendants(element) {
  return element.children.flatMap(child => [child, ...(child.children ? descendants(child) : [])]);
}

test("splits words into staggered characters while preserving accessible text and spaces", () => {
  const documentRef = new DocumentStub();
  const heading = documentRef.createElement("h1");
  heading.textContent = "Real engineering.";

  const count = applyCharacterReveal(heading, { stagger: 32, duration: 480 });
  const [accessible, animated] = heading.children;
  const characters = descendants(animated).filter(child => child.className === "hero-text-reveal__character");

  assert.equal(count, 16);
  assert.equal(accessible.textContent, "Real engineering.");
  assert.equal(animated.getAttribute("aria-hidden"), "true");
  assert.equal(animated.children[1].textContent, " ");
  assert.equal(characters[0].style.values.get("--hero-character-delay"), "0ms");
  assert.equal(characters.at(-1).style.values.get("--hero-character-delay"), "480ms");
  assert.ok(characters.every(character => character.style.values.get("--hero-character-duration") === "480ms"));
});

test("supports an overlapping paragraph start and deterministic total duration", () => {
  const documentRef = new DocumentStub();
  const paragraph = documentRef.createElement("p");
  paragraph.textContent = "Field ready";

  applyCharacterReveal(paragraph, { stagger: 16, duration: 380, startDelay: 1180 });
  const characters = descendants(paragraph).filter(child => child.className === "hero-text-reveal__character");

  assert.equal(characters[0].style.values.get("--hero-character-delay"), "1180ms");
  assert.equal(characters[1].style.values.get("--hero-character-delay"), "1196ms");
  assert.equal(getCharacterRevealDuration(48, 32, 480), 1984);
});

test("rejects targets that cannot preserve semantic content", () => {
  assert.throws(() => applyCharacterReveal(null), /requires a text element/u);
});
