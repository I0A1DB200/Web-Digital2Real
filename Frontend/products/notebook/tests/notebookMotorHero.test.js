import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createNotebookMotorHero, MOTOR_TIMELINE } from "../components/notebookMotorHero.js";

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.className = "";
    this.style = { values: new Map(), setProperty: (name, value) => this.style.values.set(name, value) };
  }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  appendChild(child) {
    child.remove?.();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(child => child !== this);
    this.parentNode = null;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getBoundingClientRect() { return { top: 0, height: 400 }; }
}

class FakeDocument {
  createElement(tagName) { return new FakeElement(tagName); }
  createElementNS(_namespace, tagName) { return new FakeElement(tagName); }
}

function createWindow({ reducedMotion = false, mobile = false } = {}) {
  let identifier = 0;
  const scheduled = new Map();
  const observers = [];
  const listeners = new Map();
  class FakeIntersectionObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    enter() { this.callback([{ isIntersecting: true, target: this.target }]); }
  }
  return {
    IntersectionObserver: FakeIntersectionObserver,
    innerHeight: 1000,
    matchMedia: query => ({ matches: query.includes("prefers-reduced-motion") ? reducedMotion : mobile }),
    setTimeout(callback, delay) { identifier += 1; scheduled.set(identifier, { callback, delay }); return identifier; },
    clearTimeout(id) { scheduled.delete(id); },
    requestAnimationFrame(callback) { callback(); return 1; },
    cancelAnimationFrame() {},
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type) { listeners.delete(type); },
    run(delay) {
      [...scheduled.entries()].filter(([, task]) => task.delay === delay)
        .forEach(([id, task]) => { scheduled.delete(id); task.callback(); });
    },
    scheduled, observers, listeners
  };
}

function descendants(root) { return root.children.flatMap(child => [child, ...descendants(child)]); }

test("renders four energy routes, three pulses, and one canonical motor asset", () => {
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef: createWindow() });
  assert.equal(hero.element.className, "notebook-motor-assembly-scene");
  assert.equal(hero.element.getAttribute("aria-hidden"), "true");
  const paths = descendants(hero.element).filter(child => child.tagName === "PATH");
  assert.equal(paths.filter(path => path.getAttribute("class").includes("__route ")).length, 4);
  assert.equal(paths.filter(path => path.getAttribute("class").includes("__pulse ")).length, 3);
  const images = descendants(hero.element).filter(child => child.tagName === "IMG");
  assert.deepEqual(images.map(image => image.src), [
    "./assets/images/notebook/motor/motor-notes-hero.png"
  ]);
  assert.ok(images.every(image => image.alt === "" && image.getAttribute("aria-hidden") === "true"));
});

test("mounts a full-section Industrial Signal Map with configured routes, nodes, descents, and pulses", () => {
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef: createWindow() });
  const section = new FakeElement("section");
  hero.initialise(section);
  const map = descendants(section).find(child => child.getAttribute("class") === "notebook-signal-map");
  assert.ok(map);
  assert.equal(map.getAttribute("viewBox"), "0 0 1200 900");
  const mapElements = descendants(map);
  const signalRoutes = mapElements.filter(child => child.getAttribute("class")?.includes("notebook-signal-map__route "));
  assert.equal(signalRoutes.length, 12);
  assert.equal(signalRoutes.filter(route => route.getAttribute("class").includes("--backbone")).length, 6);
  assert.equal(mapElements.filter(child => child.getAttribute("class")?.includes("notebook-signal-map__node ")).length, 18);
  assert.equal(mapElements.filter(child => child.getAttribute("class")?.includes("notebook-signal-map__descent ")).length, 3);
  assert.equal(mapElements.filter(child => child.getAttribute("class")?.includes("notebook-signal-map__pulse ")).length, 2);
  hero.destroy();
  assert.equal(descendants(section).includes(map), false);
});

test("advances once through the unified scene timeline", () => {
  const windowRef = createWindow();
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(new FakeElement("section"));
  assert.equal(hero.getState(), "idle");
  assert.deepEqual(windowRef.observers[0].options, { threshold: 0.2, rootMargin: "0px 0px -12% 0px" });
  windowRef.observers[0].enter();
  assert.equal(hero.getState(), "idle");
  assert.deepEqual([...windowRef.scheduled.values()].map(task => task.delay), [1000, 2500]);
  windowRef.run(MOTOR_TIMELINE.desktop.reveal);
  assert.equal(hero.getState(), "scene-entering");
  windowRef.observers[0].enter();
  assert.equal(windowRef.scheduled.size, 1);
  windowRef.run(MOTOR_TIMELINE.desktop.settled);
  assert.equal(hero.getState(), "settled");
});

test("uses the shorter centralized timeline on mobile", () => {
  const windowRef = createWindow({ mobile: true });
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(new FakeElement("section"));
  windowRef.observers[0].enter();
  assert.deepEqual([...windowRef.scheduled.values()].map(task => task.delay), [1000, 2300]);
  windowRef.run(MOTOR_TIMELINE.mobile.reveal);
  assert.equal(hero.getState(), "scene-entering");
  windowRef.run(MOTOR_TIMELINE.mobile.settled);
  assert.equal(hero.getState(), "settled");
});

test("applies layered parallax and clears listeners and pending work on destroy", () => {
  const windowRef = createWindow();
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  const section = new FakeElement("section");
  hero.initialise(section);
  windowRef.observers[0].enter();
  assert.equal(windowRef.listeners.has("scroll"), true);
  assert.equal(hero.element.style.values.get("--routes-parallax"), "1.26px");
  assert.equal(hero.element.style.values.get("--energy-parallax"), "2.31px");
  assert.equal(hero.element.style.values.get("--motor-parallax"), "3.57px");
  const map = descendants(section).find(child => child.getAttribute("class") === "notebook-signal-map");
  assert.equal(map.style.values.get("--signal-backbone-parallax"), "2.10px");
  assert.equal(map.style.values.get("--signal-deep-parallax"), "3.00px");
  assert.equal(map.style.values.get("--signal-main-parallax"), "4.80px");
  assert.equal(map.style.values.get("--signal-active-parallax"), "6.00px");
  assert.equal(windowRef.scheduled.size, 2);
  hero.destroy();
  assert.equal(windowRef.listeners.size, 0);
  assert.equal(windowRef.scheduled.size, 0);
});

test("settles immediately without animated work for reduced motion", () => {
  const windowRef = createWindow({ reducedMotion: true });
  const hero = createNotebookMotorHero({ documentRef: new FakeDocument(), windowRef });
  hero.initialise(new FakeElement("section"));
  assert.equal(hero.getState(), "settled");
  assert.equal(windowRef.scheduled.size, 0);
  assert.equal(windowRef.listeners.size, 0);
});

test("mounts one motor image in a unified scene with staged cards and filters", async () => {
  const [application, styles] = await Promise.all([
    readFile(new URL("../../../app.js", import.meta.url), "utf8"),
    readFile(new URL("../../../styles/notebook.css", import.meta.url), "utf8")
  ]);
  assert.match(application, /<section class="notes-section"[\s\S]*notebook-motor-host[\s\S]*notebook-carousel-host/u);
  assert.doesNotMatch(application, /<header class="editorial-hero[^>]*>[\s\S]*notebook-motor-host[\s\S]*<\/header>/u);
  assert.match(styles, /data-motor-state="scene-entering"\] \.notebook-motor__image/u);
  assert.match(styles, /@keyframes notebook-motor-unified-entry/u);
  assert.doesNotMatch(styles, /motor-entering|motor-active|cards-assembling|motor-backgrounding|filters-revealing/u);
  assert.match(styles, /\.notebook-energy-field__route/u);
  assert.match(styles, /\.notebook-energy-field__pulse/u);
  assert.match(styles, /@keyframes notebook-energy-flow/u);
  assert.match(styles, /@keyframes notebook-energy-to-notes/u);
  assert.match(styles, /--motor-image-x:\s*0px/u);
  assert.match(styles, /min-height:\s*clamp\(380px, 40vw, 500px\)/u);
  assert.match(styles, /padding-top:\s*clamp\(95px, 13vw, 150px\)/u);
  assert.doesNotMatch(styles, /@keyframes notebook-motor-operation/u);
  assert.doesNotMatch(styles, /notebook-motor__rotor/u);
  assert.doesNotMatch(styles, /notebook-motor-specular-sweep/u);
  assert.match(styles, /data-motor-state="settled"\] \.notebook-motor-stage\s*\{[\s\S]*?motor-settled-lift[\s\S]*?scale\(0\.99\)/u);
  assert.match(styles, /data-motor-state="settled"\] \.notebook-motor-stage\s*\{[\s\S]*?opacity:\s*0\.5;[\s\S]*?filter:\s*blur\(2px\)/u);
  assert.match(styles, /data-position="0"\][\s\S]*?animation-delay:\s*150ms/u);
  assert.match(styles, /data-position="-1"\][\s\S]*?animation-delay:\s*250ms/u);
  assert.match(styles, /data-position="1"\][\s\S]*?animation-delay:\s*350ms/u);
  assert.match(styles, /\.notebook-carousel__filters\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?translate3d\(0, 12px, 0\)/u);
  assert.match(styles, /scene-entering"\] \.notebook-carousel__filters/u);
  assert.match(styles, /\.notebook-notes-composition\s*\{[\s\S]*?background:\s*transparent/u);
  assert.match(styles, /\.notes-section\s*\{[\s\S]*?radial-gradient[\s\S]*?box-shadow/u);
  assert.match(styles, /\.notebook-signal-map\s*\{[\s\S]*?position:\s*absolute[\s\S]*?inset:\s*0/u);
  assert.match(styles, /\.notebook-signal-map__route--deep[\s\S]*?stroke-width:\s*1\.1/u);
  assert.match(styles, /\.notebook-signal-map__plane--backbone[\s\S]*?blur\(3px\)/u);
  assert.match(styles, /\.notebook-signal-map__route--backbone[\s\S]*?stroke-width:\s*3;[\s\S]*?opacity:\s*0\.09/u);
  assert.match(styles, /data-motor-state="settled"\] \.notebook-signal-map__pulse--1[\s\S]*?8200ms/u);
  assert.match(styles, /prefers-reduced-motion:[\s\S]*?\.notebook-signal-map[\s\S]*?--signal-active-parallax:\s*0px/u);
  assert.match(styles, /\.notebook-notes-composition::after[\s\S]*?radial-gradient[\s\S]*?blur\(12px\)/u);
  assert.match(styles, /\.notebook-energy-field\s*\{[\s\S]*?mix-blend-mode:\s*screen/u);
  assert.match(styles, /\.notebook-motor\s*\{[\s\S]*?drop-shadow[\s\S]*?mask-image/u);
});
