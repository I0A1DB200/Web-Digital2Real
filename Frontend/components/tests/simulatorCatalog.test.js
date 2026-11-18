import test from "node:test";
import assert from "node:assert/strict";
import { getSite } from "../../data/site.js";
import { createSimulatorCatalog } from "../simulatorCatalog.js";

function documentStub() {
  return {
    createElement(tagName) {
      return {
        tagName,
        children: [],
        attributes: {},
        listeners: {},
        appendChild(child) { this.children.push(child); },
        append(...children) { this.children.push(...children); },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, listener) { this.listeners[name] = listener; }
      };
    }
  };
}

function findByClass(root, className) {
  if (typeof root.className === "string" && root.className.split(/\s+/).includes(className)) return root;
  for (const child of root.children ?? []) {
    const match = findByClass(child, className);
    if (match) return match;
  }
  return null;
}

function findAllByClass(root, className, matches = []) {
  if (typeof root.className === "string" && root.className.split(/\s+/).includes(className)) matches.push(root);
  for (const child of root.children ?? []) findAllByClass(child, className, matches);
  return matches;
}

function getText(root) {
  return `${root.textContent ?? ""}${(root.children ?? []).map(getText).join("")}`;
}

test("simulator catalog keeps both simulators outside Experience Engine records", () => {
  const simulators = getSite("en").simulators;
  const opened = [];
  const catalog = createSimulatorCatalog(simulators, (simulator, opener) => opened.push({ simulator, opener }), { documentRef: documentStub() });
  const cards = findAllByClass(catalog.element, "simulator-card");
  const links = findAllByClass(catalog.element, "simulator-card__main");
  let prevented = false;

  assert.equal(cards.length, 2);
  assert.equal(findByClass(catalog.element, "simulator-catalog__title").textContent, "3D Engineering Simulators");
  assert.equal(links[0].href, "simulators/d2r-inspection-cell/index.html");
  assert.equal(links[1].href, "simulators/cobot/index.html");
  assert.equal(links.every(link => link.target === undefined), true);
  links[1].listeners.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(opened[0].simulator, simulators[1]);
  assert.equal(opened[0].opener, links[1]);
  assert.equal(findByClass(cards[1], "simulator-card__title").textContent, "Cobot Programming / Palletizing");
  assert.match(findByClass(cards[1], "simulator-card__description").textContent, /does not mean OFF/);
  assert.equal(findByClass(cards[1], "simulator-card__repository"), null);
});

test("simulator catalog localizes both cards without adding Experience Engine labels", () => {
  const catalog = createSimulatorCatalog(getSite("en").simulators, () => {}, { documentRef: documentStub() });
  catalog.update(getSite("es").simulators);

  const cards = findAllByClass(catalog.element, "simulator-card");
  assert.equal(findByClass(catalog.element, "simulator-catalog__title").textContent, "Simuladores 3D de ingeniería");
  assert.equal(findByClass(cards[1], "simulator-card__title").textContent, "Programación de cobot / Paletizado");
  assert.equal(findByClass(cards[1], "simulator-card__open-label").textContent, "Abrir simulador");
  assert.match(findByClass(cards[1], "simulator-card__description").textContent, /no significa OFF/);
  assert.doesNotMatch(getText(catalog.element), /Experience Engine|Ver repositorio/i);
});

test("simulator catalog requires unique identities and local HTML routes", () => {
  const simulators = getSite("en").simulators;
  assert.throws(
    () => createSimulatorCatalog([{ ...simulators[0], htmlUrl: "https://example.com/simulator.html" }], () => {}, { documentRef: documentStub() }),
    /local relative path/
  );
  assert.throws(
    () => createSimulatorCatalog(simulators, null, { documentRef: documentStub() }),
    /activation callback/
  );
  assert.throws(
    () => createSimulatorCatalog([simulators[0], { ...simulators[1], id: simulators[0].id }], () => {}, { documentRef: documentStub() }),
    /Duplicate simulator identity/
  );
});
