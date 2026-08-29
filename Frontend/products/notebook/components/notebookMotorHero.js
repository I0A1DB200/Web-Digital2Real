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
    element.style?.setProperty?.("--routes-parallax", `${(range * 0.12).toFixed(2)}px`);
    element.style?.setProperty?.("--energy-parallax", `${(range * 0.22).toFixed(2)}px`);
    element.style?.setProperty?.("--motor-parallax", `${(range * 0.34).toFixed(2)}px`);
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

function createSvgElement(documentRef, tagName) {
  return typeof documentRef.createElementNS === "function"
    ? documentRef.createElementNS("http://www.w3.org/2000/svg", tagName)
    : documentRef.createElement(tagName);
}
