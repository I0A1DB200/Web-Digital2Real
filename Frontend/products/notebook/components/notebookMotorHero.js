const MOTOR_TIMELINE = Object.freeze({
  desktop: Object.freeze({ motorActive: 600, cardsAssembling: 2500, settled: 3600 }),
  mobile: Object.freeze({ motorActive: 300, cardsAssembling: 1650, settled: 2400 })
});

const MOTOR_STATES = new Set(["idle", "motor-entering", "motor-active", "cards-assembling", "settled"]);

export function createNotebookMotorHero({
  documentRef = globalThis.document,
  windowRef = globalThis.window
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Notebook Motor Hero requires a document.");
  }

  const element = documentRef.createElement("div");
  element.className = "notebook-motor-stage";
  element.setAttribute("aria-hidden", "true");

  const assembly = documentRef.createElement("div");
  assembly.className = "notebook-motor";

  const staticMotor = createLayer(
    documentRef,
    "notebook-motor__static",
    "./assets/images/notebook/motor/motor-static.png"
  );
  const rotorActivity = documentRef.createElement("div");
  rotorActivity.className = "notebook-motor__rotor-activity";
  const rotor = createLayer(
    documentRef,
    "notebook-motor__rotor",
    "./assets/images/notebook/motor/motor-rotor.png"
  );
  const rotorSweep = documentRef.createElement("span");
  rotorSweep.className = "notebook-motor__rotor-sweep";

  rotorActivity.append(rotor, rotorSweep);
  assembly.append(rotorActivity, staticMotor);
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
    setState("motor-entering");
    schedule("motor-active", timeline.motorActive);
    schedule("cards-assembling", timeline.cardsAssembling);
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
