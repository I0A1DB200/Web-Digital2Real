const MOTOR_TIMELINE = Object.freeze({
  desktop: Object.freeze({ activation: 160, deployment: 760, settled: 1680 }),
  mobile: Object.freeze({ activation: 80, deployment: 360, settled: 980 })
});

const MOTOR_STATES = new Set(["idle", "activating", "deploying", "settled"]);

export function createNotebookMotorHero({
  documentRef = globalThis.document,
  windowRef = globalThis.window
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Notebook Motor Hero requires a document.");
  }

  const element = documentRef.createElement("div");
  element.className = "motor-stage";
  element.setAttribute("aria-hidden", "true");

  const assembly = documentRef.createElement("div");
  assembly.className = "motor-assembly";

  const halo = documentRef.createElement("span");
  halo.className = "motor-assembly__halo";

  const body = createLayer(documentRef, "body", "./assets/images/notebook/motor/motor-body.png");
  const coils = createLayer(documentRef, "coils", "./assets/images/notebook/motor/motor-coils.png");
  const rotor = createLayer(documentRef, "rotor", "./assets/images/notebook/motor/motor-rotor.png");
  const rotorAxis = documentRef.createElement("div");
  rotorAxis.className = "motor-rotor-axis";
  rotorAxis.appendChild(rotor);
  const activationRing = documentRef.createElement("span");
  activationRing.className = "motor-assembly__activation-ring";

  assembly.append(halo, body, coils, rotorAxis, activationRing);
  element.appendChild(assembly);

  let host = null;
  let timers = [];
  let observer = null;
  let hasStarted = false;
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
    schedule("activating", timeline.activation);
    schedule("deploying", timeline.deployment);
    schedule("settled", timeline.settled);
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

function createLayer(documentRef, name, source) {
  const image = documentRef.createElement("img");
  image.className = `motor-layer motor-layer--${name}`;
  image.src = source;
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  return image;
}
