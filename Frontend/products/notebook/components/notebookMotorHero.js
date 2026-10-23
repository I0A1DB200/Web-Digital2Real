const MOTOR_TIMELINE = Object.freeze({
  desktop: Object.freeze({ reveal: 1000, settled: 2500 }),
  mobile: Object.freeze({ reveal: 1000, settled: 2300 })
});

const MOTOR_STATES = new Set([
  "idle",
  "scene-entering",
  "settled"
]);

const ROUTES = Object.freeze([
  "M80 110 H300 L430 250 H650 L820 80",
  "M20 380 H230 L360 510 H720 L920 320",
  "M190 680 V470 L320 340 H520 L670 190 V20",
  "M980 590 H780 L650 460 H480 L310 290 H90"
]);

const SIGNAL_ROUTES = Object.freeze([
  Object.freeze({ id: "north-transfer", depth: "deep", path: "M-40 150 H210 L300 240 H540 L630 330 H1240" }),
  Object.freeze({ id: "vertical-loop", depth: "deep", path: "M110 900 V690 L220 580 H470 L560 490 H790 L880 400 V70" }),
  Object.freeze({ id: "central-exchange", depth: "main", path: "M0 380 H180 L260 460 H470 L550 380 H780 L860 300 H1200" }),
  Object.freeze({ id: "west-spine", depth: "main", path: "M80 60 V250 L170 340 V620 L260 710 H620 L710 800 H1120" }),
  Object.freeze({ id: "south-return", depth: "main", path: "M1200 620 H1010 L920 530 H690 L610 610 H360 L280 690 H0" }),
  Object.freeze({ id: "east-spine", depth: "main", path: "M420 0 V150 L510 240 H720 L810 330 V590 L900 680 H1200" })
]);

const SIGNAL_BACKBONE_ROUTES = Object.freeze([
  Object.freeze({ id: "backbone-north", depth: "backbone", path: "M-80 90 H260 L430 260 H760 L940 80 H1280" }),
  Object.freeze({ id: "backbone-west", depth: "backbone", path: "M40 940 V720 L250 510 H520 L700 330 H980 L1240 70" }),
  Object.freeze({ id: "backbone-south", depth: "backbone", path: "M-60 760 H210 L390 580 H720 L900 760 H1260" }),
  Object.freeze({ id: "backbone-east", depth: "backbone", path: "M1280 420 H1040 L860 600 V900" }),
  Object.freeze({ id: "backbone-upper-link", depth: "backbone", path: "M-60 300 H160 L300 440 H680 L820 300 H1260" }),
  Object.freeze({ id: "backbone-lower-link", depth: "backbone", path: "M180 940 V820 L340 660 H820 L980 820 H1280" })
]);

const SIGNAL_NODES = Object.freeze([
  Object.freeze({ x: 220, y: 160, type: "passive" }), Object.freeze({ x: 310, y: 250, type: "active" }),
  Object.freeze({ x: 600, y: 330, type: "intersection" }), Object.freeze({ x: 120, y: 680, type: "passive" }),
  Object.freeze({ x: 230, y: 570, type: "passive" }), Object.freeze({ x: 560, y: 490, type: "intersection" }),
  Object.freeze({ x: 870, y: 400, type: "active" }), Object.freeze({ x: 180, y: 390, type: "passive" }),
  Object.freeze({ x: 260, y: 470, type: "intersection" }), Object.freeze({ x: 850, y: 310, type: "passive" }),
  Object.freeze({ x: 170, y: 340, type: "active" }), Object.freeze({ x: 710, y: 800, type: "passive" }),
  Object.freeze({ x: 1010, y: 610, type: "active" }), Object.freeze({ x: 610, y: 600, type: "intersection" }),
  Object.freeze({ x: 810, y: 330, type: "intersection" }), Object.freeze({ x: 550, y: 380, type: "passive" }),
  Object.freeze({ x: 920, y: 530, type: "passive" }), Object.freeze({ x: 900, y: 680, type: "passive" })
]);

const SIGNAL_DESCENTS = Object.freeze([
  Object.freeze({ path: "M310 0 V250" }),
  Object.freeze({ path: "M810 0 V330" }),
  Object.freeze({ path: "M1010 0 V610" })
]);

export function createNotebookMotorHero({
  documentRef = globalThis.document,
  windowRef = globalThis.window
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Notebook Motor Hero requires a document.");
  }

  const element = documentRef.createElement("div");
  element.className = "notebook-motor-assembly-scene";
  element.setAttribute("aria-hidden", "true");

  const signalMap = createIndustrialSignalMap(documentRef);

  const infrastructure = createInfrastructure(documentRef);
  const motorStage = documentRef.createElement("div");
  motorStage.className = "notebook-motor-stage";

  const assembly = documentRef.createElement("div");
  assembly.className = "notebook-motor";

  const staticMotor = createLayer(
    documentRef,
    "notebook-motor__image",
    "./assets/images/notebook/motor/motor-notes-hero.png"
  );
  assembly.appendChild(staticMotor);
  motorStage.appendChild(assembly);
  element.append(infrastructure, motorStage);

  let host = null;
  let timers = [];
  let observer = null;
  let hasStarted = false;
  let parallaxFrame = null;
  let parallaxListening = false;
  let state = "idle";

  function setState(nextState) {
    if (!MOTOR_STATES.has(nextState)) {
      throw new TypeError(`Unknown Notebook Motor Hero state: ${nextState}`);
    }
    state = nextState;
    host?.setAttribute("data-motor-state", state);
  }

  function prefersReducedMotion() {
    return Boolean(windowRef?.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }

  function activeTimeline() {
    return windowRef?.matchMedia?.("(max-width: 720px)").matches
      ? MOTOR_TIMELINE.mobile
      : MOTOR_TIMELINE.desktop;
  }

  function schedule(nextState, delay) {
    const timer = windowRef.setTimeout(() => setState(nextState), delay);
    timers.push(timer);
  }

  function beginSequence() {
    if (hasStarted) return;
    hasStarted = true;
    observer?.disconnect();
    observer = null;

    const timeline = activeTimeline();
    startParallax();
    schedule("scene-entering", timeline.reveal);
    schedule("settled", timeline.settled);
  }

  function updateParallax() {
    parallaxFrame = null;
    if (!host || typeof host.getBoundingClientRect !== "function") return;
    const viewportHeight = Number(windowRef?.innerHeight) || 1;
    const rect = host.getBoundingClientRect();
    const centerOffset = (viewportHeight / 2) - (rect.top + (rect.height / 2));
    const progress = Math.max(-1, Math.min(1, centerOffset / viewportHeight));
    const range = progress * 35;
    const signalRange = progress * 100;
    element.style?.setProperty?.("--routes-parallax", `${(range * 0.12).toFixed(2)}px`);
    element.style?.setProperty?.("--energy-parallax", `${(range * 0.22).toFixed(2)}px`);
    element.style?.setProperty?.("--motor-parallax", `${(range * 0.34).toFixed(2)}px`);
    signalMap.style?.setProperty?.("--signal-deep-parallax", `${(signalRange * 0.1).toFixed(2)}px`);
    signalMap.style?.setProperty?.("--signal-backbone-parallax", `${(signalRange * 0.07).toFixed(2)}px`);
    signalMap.style?.setProperty?.("--signal-main-parallax", `${(signalRange * 0.16).toFixed(2)}px`);
    signalMap.style?.setProperty?.("--signal-active-parallax", `${(signalRange * 0.2).toFixed(2)}px`);
  }

  function requestParallaxUpdate() {
    if (parallaxFrame !== null) return;
    if (typeof windowRef?.requestAnimationFrame === "function") {
      parallaxFrame = windowRef.requestAnimationFrame(updateParallax);
    } else {
      updateParallax();
    }
  }

  function startParallax() {
    if (parallaxListening || typeof windowRef?.addEventListener !== "function") return;
    parallaxListening = true;
    windowRef.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    windowRef.addEventListener("resize", requestParallaxUpdate);
    requestParallaxUpdate();
  }

  function stopParallax() {
    if (parallaxListening && typeof windowRef?.removeEventListener === "function") {
      windowRef.removeEventListener("scroll", requestParallaxUpdate);
      windowRef.removeEventListener("resize", requestParallaxUpdate);
    }
    if (parallaxFrame !== null && typeof windowRef?.cancelAnimationFrame === "function") {
      windowRef.cancelAnimationFrame(parallaxFrame);
    }
    parallaxFrame = null;
    parallaxListening = false;
  }

  function initialise(hostElement) {
    if (!hostElement || typeof hostElement.setAttribute !== "function") {
      throw new TypeError("Notebook Motor Hero requires a host element.");
    }

    destroy();
    host = hostElement;
    host.appendChild(signalMap);
    hasStarted = false;
    setState("idle");

    if (prefersReducedMotion() || typeof windowRef?.setTimeout !== "function") {
      setState("settled");
      return;
    }

    if (typeof windowRef?.IntersectionObserver !== "function") {
      beginSequence();
      return;
    }

    observer = new windowRef.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) beginSequence();
    }, {
      threshold: 0.2,
      rootMargin: "0px 0px -12% 0px"
    });
    observer.observe(host);
  }

  function destroy() {
    if (typeof windowRef?.clearTimeout === "function") {
      timers.forEach(timer => windowRef.clearTimeout(timer));
    }
    observer?.disconnect();
    observer = null;
    stopParallax();
    signalMap.remove?.();
    timers = [];
    host = null;
  }

  return Object.freeze({
    element,
    initialise,
    destroy,
    getState: () => state
  });
}

export { MOTOR_TIMELINE };

function createLayer(documentRef, className, source) {
  const image = documentRef.createElement("img");
  image.className = className;
  image.src = source;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.decoding = "async";
  image.draggable = false;
  return image;
}

function createInfrastructure(documentRef) {
  const svg = createSvgElement(documentRef, "svg");
  svg.setAttribute("class", "notebook-energy-field");
  svg.setAttribute("viewBox", "0 0 1000 700");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");

  const routes = createSvgElement(documentRef, "g");
  routes.setAttribute("class", "notebook-energy-field__routes");
  ROUTES.forEach((definition, index) => {
    const path = createSvgElement(documentRef, "path");
    path.setAttribute("class", `notebook-energy-field__route notebook-energy-field__route--${index + 1}`);
    path.setAttribute("d", definition);
    path.setAttribute("pathLength", "1");
    routes.appendChild(path);
  });

  const energy = createSvgElement(documentRef, "g");
  energy.setAttribute("class", "notebook-energy-field__energy");
  [0, 1, 3].forEach((routeIndex, pulseIndex) => {
    const pulse = createSvgElement(documentRef, "path");
    pulse.setAttribute("class", `notebook-energy-field__pulse notebook-energy-field__pulse--${pulseIndex + 1}`);
    pulse.setAttribute("d", ROUTES[routeIndex]);
    pulse.setAttribute("pathLength", "1");
    energy.appendChild(pulse);
  });
  svg.append(routes, energy);
  return svg;
}

function createIndustrialSignalMap(documentRef) {
  const svg = createSvgElement(documentRef, "svg");
  svg.setAttribute("class", "notebook-signal-map");
  svg.setAttribute("viewBox", "0 0 1200 900");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");

  const backboneRoutes = createSignalGroup(documentRef, "notebook-signal-map__plane notebook-signal-map__plane--backbone");
  SIGNAL_BACKBONE_ROUTES.forEach(route => backboneRoutes.appendChild(createSignalRoute(documentRef, route)));
  const deepRoutes = createSignalGroup(documentRef, "notebook-signal-map__plane notebook-signal-map__plane--deep");
  const mainRoutes = createSignalGroup(documentRef, "notebook-signal-map__plane notebook-signal-map__plane--main");
  SIGNAL_ROUTES.forEach(route => {
    const path = createSignalRoute(documentRef, route);
    (route.depth === "deep" ? deepRoutes : mainRoutes).appendChild(path);
  });

  const activity = createSignalGroup(documentRef, "notebook-signal-map__plane notebook-signal-map__plane--activity");
  SIGNAL_DESCENTS.forEach((descent, index) => {
    const path = createSvgElement(documentRef, "path");
    path.setAttribute("class", `notebook-signal-map__descent notebook-signal-map__descent--${index + 1}`);
    path.setAttribute("d", descent.path);
    activity.appendChild(path);
  });
  SIGNAL_NODES.forEach((node, index) => activity.appendChild(createSignalNode(documentRef, node, index)));

  [SIGNAL_ROUTES[2], SIGNAL_ROUTES[4]].forEach((route, index) => {
    const pulse = createSvgElement(documentRef, "path");
    pulse.setAttribute("class", `notebook-signal-map__pulse notebook-signal-map__pulse--${index + 1}`);
    pulse.setAttribute("d", route.path);
    pulse.setAttribute("pathLength", "1");
    activity.appendChild(pulse);
  });

  svg.append(backboneRoutes, deepRoutes, mainRoutes, activity);
  return svg;
}

function createSignalGroup(documentRef, className) {
  const group = createSvgElement(documentRef, "g");
  group.setAttribute("class", className);
  return group;
}

function createSignalRoute(documentRef, route) {
  const path = createSvgElement(documentRef, "path");
  path.setAttribute("class", `notebook-signal-map__route notebook-signal-map__route--${route.depth}`);
  path.setAttribute("data-route", route.id);
  path.setAttribute("d", route.path);
  return path;
}

function createSignalNode(documentRef, node, index) {
  const circle = createSvgElement(documentRef, "circle");
  circle.setAttribute("class", `notebook-signal-map__node notebook-signal-map__node--${node.type}`);
  circle.setAttribute("data-node", String(index + 1));
  circle.setAttribute("cx", String(node.x));
  circle.setAttribute("cy", String(node.y));
  circle.setAttribute("r", node.type === "intersection" ? "3" : "2");
  return circle;
}

function createSvgElement(documentRef, tagName) {
  return typeof documentRef.createElementNS === "function"
    ? documentRef.createElementNS("http://www.w3.org/2000/svg", tagName)
    : documentRef.createElement(tagName);
}
