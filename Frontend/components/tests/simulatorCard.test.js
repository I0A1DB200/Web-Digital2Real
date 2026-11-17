import test from "node:test";
import assert from "node:assert/strict";
import { getSite } from "../../data/site.js";
import { createSimulatorCard } from "../simulatorCard.js";

function documentStub() {
  return {
    createElement(tagName) {
      return {
        tagName,
        children: [],
        attributes: {},
        appendChild(child) { this.children.push(child); },
        append(...children) { this.children.push(...children); },
        setAttribute(name, value) { this.attributes[name] = value; }
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

test("simulator card renders the approved cover and owner-only preview link", () => {
  const card = createSimulatorCard(getSite("en").simulator, { documentRef: documentStub() });
  const image = findByClass(card.element, "simulator-feature__media").children[0];
  const preview = findByClass(card.element, "simulator-feature__link--primary");
  const repository = findByClass(card.element, "simulator-feature__link--secondary");

  assert.equal(image.src, "assets/images/labs/d2r-inspection-cell-cover.jpg");
  assert.match(image.alt, /Concept render/);
  assert.equal(image.width, 1280);
  assert.equal(image.height, 720);
  assert.equal(preview.href, getSite("en").simulator.previewUrl);
  assert.equal(preview.target, "_blank");
  assert.equal(preview.rel, "noopener noreferrer");
  assert.equal(preview.textContent, "Open private preview");
  assert.equal(repository.href, getSite("en").simulator.repositoryUrl);
});

test("simulator card updates all visible copy when the site language changes", () => {
  const card = createSimulatorCard(getSite("en").simulator, { documentRef: documentStub() });
  card.update(getSite("es").simulator);

  assert.equal(findByClass(card.element, "simulator-feature__eyebrow").textContent, "D2R-3D-001 · SIMULADOR INDUSTRIAL 3D");
  assert.equal(findByClass(card.element, "simulator-feature__description").textContent, getSite("es").simulator.description);
  assert.equal(findByClass(card.element, "simulator-feature__link--primary").textContent, "Abrir vista previa privada");
  assert.equal(findByClass(card.element, "simulator-feature__note").textContent, "Vista previa privada, accesible con la cuenta propietaria.");
  assert.match(findByClass(card.element, "simulator-feature__media").children[0].alt, /Render conceptual/);
});

test("simulator card rejects non-HTTPS launch links", () => {
  assert.throws(
    () => createSimulatorCard({ ...getSite("en").simulator, previewUrl: "javascript:alert(1)" }, { documentRef: documentStub() }),
    /must use HTTPS/
  );
});
