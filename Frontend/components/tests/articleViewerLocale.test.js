import assert from "node:assert/strict";
import test from "node:test";
import { createArticleViewer } from "../articleViewer.js";
import { getNotebook } from "../../../content/notebooks/notebook.js";

// DOM contract test; this does not replace real-browser focus/layout QA.
class Element {
  constructor(tag, document) {
    this.tagName = tag; this.ownerDocument = document; this.children = []; this.parentNode = null;
    this.attributes = {}; this.listeners = {}; this.dataset = {}; this.scrollTop = 0;
    const classes = new Set();
    this.classList = { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key) };
  }
  get childElementCount() { return this.children.length; }
  get isConnected() { return this === this.ownerDocument.body || Boolean(this.parentNode?.isConnected); }
  get nextSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this) + 1] ?? null; }
  append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
  appendChild(node) { node.remove(); node.parentNode = this; this.children.push(node); return node; }
  prepend(node) { node.remove(); node.parentNode = this; this.children.unshift(node); }
  insertBefore(node, next) { if (!next) return this.appendChild(node); node.remove(); node.parentNode = this; this.children.splice(this.children.indexOf(next), 0, node); }
  replaceWith(node) { const parent = this.parentNode; const index = parent.children.indexOf(this); this.remove(); node.parentNode = parent; parent.children.splice(index, 0, node); }
  remove() { if (this.parentNode) { const siblings = this.parentNode.children; siblings.splice(siblings.indexOf(this), 1); this.parentNode = null; } }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, callback) { this.listeners[key] = callback; }
  removeEventListener(key) { delete this.listeners[key]; }
  focus() { this.ownerDocument.activeElement = this; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  querySelectorAll() { return walk(this).filter(node => node.tagName === "button" && !node.disabled); }
}
const walk = element => element.children.flatMap(child => [child, ...walk(child)]);

test("open Note changes complete body in place, keeps selector focus and restores one global control", () => {
  const previousDocument = globalThis.document;
  const previousHTMLElement = globalThis.HTMLElement;
  const document = { createElement(tag) { return new Element(tag, this); }, addEventListener() {}, removeEventListener() {} };
  document.body = document.createElement("body");
  globalThis.document = document;
  globalThis.HTMLElement = Element;
  try {
    const header = document.createElement("header");
    const selector = document.createElement("div");
    const button = document.createElement("button");
    selector.append(button); header.append(selector); document.body.append(header);
    const opener = document.createElement("button"); document.body.append(opener);
    const viewer = createArticleViewer(getNotebook("en")[0], () => {}, opener, { languageControl: selector });
    document.body.append(viewer.element); viewer.activate();
    const panel = walk(viewer.element).find(node => node.className === "article-viewer__panel");
    panel.scrollTop = 230; button.focus();
    const originalOverlay = viewer.element;
    const originalTitleId = viewer.element.attributes["aria-labelledby"];
    viewer.updateArticle(getNotebook("es")[0]);
    assert.equal(viewer.element, originalOverlay);
    assert.equal(viewer.getArticleId(), "article-001");
    assert.equal(viewer.element.attributes["aria-labelledby"], originalTitleId);
    assert.equal(viewer.element.lang, "es");
    assert.equal(document.activeElement, button);
    assert.equal(panel.scrollTop, 230);
    assert.equal(walk(viewer.element).filter(node => node === selector).length, 1);
    assert.ok(walk(viewer.element).some(node => node.textContent === getNotebook("es")[0].sections[0].content));
    assert.ok(!walk(viewer.element).some(node => node.textContent === getNotebook("en")[0].sections[0].content));
    assert.throws(() => viewer.updateArticle(getNotebook("es")[1]), /identity/);
    viewer.destroy();
    assert.equal(selector.parentNode, header);
    assert.equal(document.activeElement, opener);
  } finally { globalThis.document = previousDocument; globalThis.HTMLElement = previousHTMLElement; }
});
