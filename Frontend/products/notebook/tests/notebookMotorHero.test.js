import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createNotebookMotorHero,
  MOTOR_TIMELINE
} from "../components/notebookMotorHero.js";

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.className = "";
  }

  append(...children) {
    children.forEach(child => this.appendChild(child));
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
}

class FakeDocument {
  createElement(tagName) {
    return new FakeElement(tagName);
  }
}

function createWindow({ reducedMotion = false, mobile = false } = {}) {
  let identifier = 0;
  const scheduled = new Map();
  const observers = [];

  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.target = null;
      this.disconnected = false;
      observers.push(this);
    }

    observe(target) {
      this.target = target;
    }

    disconnect() {
      this.disconnected = true;
    }

    enter() {
      this.callback([{ isIntersecting: true, target: this.target }]);
    }
  }

  return {
    IntersectionObserver: FakeIntersectionObserver,
    matchMedia: query => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : mobile
    }),
    setTimeout(callback, delay) {
      identifier += 1;
      scheduled.set(identifier, { callback, delay });
      return identifier;
    },
    clearTimeout(id) {
      scheduled.delete(id);
    },
    run(delay) {
      [...scheduled.entries()]
        .filter(([, task]) => task.delay === delay)
        .forEach(([id, task]) => {
          scheduled.delete(id);
          task.callback();
        });
    },
    scheduled,
    observers
  };
}

function descendants(root) {
  return root.children.flatMap(child => [child, ...descendants(child)]);
}

test("renders the canonical decorative static assembly and rotor assets", () => {
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef: createWindow() });
  assert.equal(hero.element.getAttribute("aria-hidden"), "true");
  const assembly = hero.element.children[0];
  const images = descendants(assembly).filter(child => child.tagName === "IMG");
  assert.deepEqual(images.map(image => image.src), [
    "./assets/images/notebook/motor/motor-rotor.png",
    "./assets/images/notebook/motor/motor-static.png"
  ]);
  assert.ok(images.every(image => image.alt === ""));
  assert.ok(images.every(image => image.getAttribute("aria-hidden") === "true"));
});

test("waits for section intersection then advances once through the centralized timeline", () => {
  const windowRef = createWindow();
  const host = new FakeElement("section");
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(host);
  assert.equal(host.getAttribute("data-motor-state"), "idle");
  assert.equal(windowRef.scheduled.size, 0);
  assert.equal(windowRef.observers[0].target, host);
  assert.deepEqual(windowRef.observers[0].options, {
    threshold: 0.2,
    rootMargin: "0px 0px -12% 0px"
  });
  windowRef.observers[0].enter();
  assert.equal(hero.getState(), "motor-entering");
  assert.deepEqual([...windowRef.scheduled.values()].map(task => task.delay), [600, 2500, 3600]);
  windowRef.observers[0].enter();
  assert.equal(windowRef.scheduled.size, 3);
  windowRef.run(MOTOR_TIMELINE.desktop.motorActive);
  assert.equal(hero.getState(), "motor-active");
  windowRef.run(MOTOR_TIMELINE.desktop.cardsAssembling);
  assert.equal(hero.getState(), "cards-assembling");
  windowRef.run(MOTOR_TIMELINE.desktop.settled);
  assert.equal(hero.getState(), "settled");
});

test("uses the shorter centralized timeline on mobile", () => {
  const windowRef = createWindow({ mobile: true });
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(new FakeElement("section"));
  windowRef.observers[0].enter();
  assert.deepEqual(
    [...windowRef.scheduled.values()].map(task => task.delay),
    [300, 1650, 2400]
  );
  windowRef.run(MOTOR_TIMELINE.mobile.settled);
  assert.equal(hero.getState(), "settled");
});

test("settles immediately for reduced motion and clears pending work on destroy", () => {
  const reducedWindow = createWindow({ reducedMotion: true });
  const reducedHero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef: reducedWindow });
  reducedHero.initialise(new FakeElement("section"));
  assert.equal(reducedHero.getState(), "settled");
  assert.equal(reducedWindow.scheduled.size, 0);

  const windowRef = createWindow();
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(new FakeElement("section"));
  assert.equal(windowRef.scheduled.size, 0);
  assert.equal(windowRef.observers[0].disconnected, false);
  hero.destroy();
  assert.equal(windowRef.scheduled.size, 0);
  assert.equal(windowRef.observers[0].disconnected, true);
});

test("mounts inside Engineering Notes and uses optical rotor activity without image rotation", async () => {
  const [application, styles] = await Promise.all([
    readFile(new URL("../../../app.js", import.meta.url), "utf8"),
    readFile(new URL("../../../styles/notebook.css", import.meta.url), "utf8")
  ]);

  assert.match(application, /<section class="notes-section"[\s\S]*notebook-motor-host[\s\S]*notebook-carousel-host/u);
  assert.doesNotMatch(application, /<header class="editorial-hero[^>]*>[\s\S]*notebook-motor-host[\s\S]*<\/header>/u);
  assert.match(styles, /\.notes-section\[data-motor-state="motor-active"\] \.notebook-motor__rotor-sweep/u);
  assert.match(styles, /@keyframes notebook-motor-specular-sweep/u);
  assert.match(styles, /@keyframes notebook-motor-keyway-cue/u);
  assert.match(styles, /@keyframes notebook-motor-core-shimmer/u);
  assert.match(styles, /data-position="0"\]\s*\{\s*animation-delay:\s*0ms/u);
  assert.match(styles, /data-position="-1"\]\s*\{\s*animation-delay:\s*110ms/u);
  assert.match(styles, /data-position="1"\]\s*\{\s*animation-delay:\s*220ms/u);
  assert.doesNotMatch(styles, /0\.75px/u);
  assert.doesNotMatch(styles, /@keyframes notebook-motor-rotor/u);
});
