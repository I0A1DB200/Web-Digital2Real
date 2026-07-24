import { lab001Definition } from "../labs/lab-001/lab.js";
import { createLab001Session } from "../labs/lab-001/session.js";

const RULE_LABELS = new Map(
  lab001Definition.validationRules.map(rule => [rule.id, rule.name])
);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createLab001Presentation(snapshot) {
  const machineState = snapshot.machine.state;
  const emergency = machineState === "EmergencyStopped";
  const faulted = machineState === "Faulted";
  const running = machineState === "Running";
  const result = snapshot.validation.result;
  const passedRules = new Set(result?.passed ?? []);
  const pendingRules = lab001Definition.completionCriteria.filter(id => !passedRules.has(id));
  const currentRule = pendingRules[0] ?? null;

  let status = "Ready";
  if (faulted) status = "Faulted";
  else if (snapshot.completed) status = "Completed";
  else if (emergency) status = "Emergency";
  else if (running) status = "Running";
  else if (snapshot.simulation.tick > 0) status = "Stopped";

  return Object.freeze({
    status,
    running,
    emergency,
    faulted,
    motor: running ? "On" : "Off",
    conveyor: running ? "Running" : "Stopped",
    validation: snapshot.completed ? "Completed" : `${passedRules.size} of ${lab001Definition.completionCriteria.length} complete`,
    objectives: Object.freeze(lab001Definition.completionCriteria.map(id => Object.freeze({
      id,
      label: RULE_LABELS.get(id) ?? id,
      state: passedRules.has(id) ? "passed" : id === currentRule ? "current" : "pending"
    })))
  });
}

export function createLab001View({ sessionFactory = createLab001Session } = {}) {
  const session = sessionFactory();
  const abortController = new AbortController();
  const { signal } = abortController;
  let snapshot;
  let destroyed = false;

  const section = element("section", "lab001");
  section.setAttribute("aria-labelledby", "lab001-title");

  const header = element("header", "lab001__header reveal");
  const eyebrow = element("span", "section-kicker", "Digital2Real Academy · Lab 001");
  const title = element("h1", "lab001__title", lab001Definition.title);
  title.id = "lab001-title";
  const objective = element("p", "lab001__objective", lab001Definition.learningObjective);
  const meta = element("div", "lab001__meta");
  meta.append(
    element("span", "lab001__meta-item", lab001Definition.difficulty),
    element("span", "lab001__meta-item", lab001Definition.estimatedDuration)
  );
  const stateLine = element("p", "lab001__state-line");
  stateLine.append("Laboratory status: ");
  const stateValue = element("strong", "lab001__state-value", "Ready");
  stateLine.append(stateValue);
  header.append(eyebrow, title, objective, meta, stateLine);

  const stage = element("section", "lab001__stage reveal");
  stage.setAttribute("aria-labelledby", "lab001-machine-title");
  const stageHeading = element("div", "lab001__section-heading");
  stageHeading.append(
    element("span", "section-kicker", "Machine stage"),
    Object.assign(element("h2", "lab001__section-title", "Conveyor station"), { id: "lab001-machine-title" })
  );
  const machine = element("div", "lab001-machine is-stopped");
  machine.setAttribute("role", "img");
  const machineLabel = element("span", "lab001-machine__label", "Conveyor stopped");
  const belt = element("div", "lab001-machine__belt");
  belt.append(element("span", "lab001-machine__workpiece"));
  const frame = element("div", "lab001-machine__frame");
  frame.append(element("span", "lab001-machine__leg"), element("span", "lab001-machine__leg"));
  const motor = element("div", "lab001-machine__motor");
  motor.append(element("span", "lab001-machine__motor-light"), element("span", "lab001-machine__motor-label", "Motor"));
  machine.append(machineLabel, belt, frame, motor);
  stage.append(stageHeading, machine);

  const workbench = element("div", "lab001__workbench reveal");
  const controlsSection = element("section", "lab001__controls");
  controlsSection.setAttribute("aria-labelledby", "lab001-controls-title");
  controlsSection.append(Object.assign(element("h2", "lab001__subheading", "Commands"), { id: "lab001-controls-title" }));
  const controls = element("div", "lab001-controls");
  const startButton = commandButton("START", "lab001-control lab001-control--start");
  const stopButton = commandButton("STOP", "lab001-control lab001-control--stop");
  const emergencyButton = commandButton("EMERGENCY STOP", "lab001-control lab001-control--emergency");
  const resetButton = commandButton("RESET", "lab001-control lab001-control--reset");
  controls.append(startButton, stopButton, emergencyButton, resetButton);
  const announcement = element("p", "lab001__announcement");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  controlsSection.append(controls, announcement);

  const statusSection = element("section", "lab001__process");
  statusSection.setAttribute("aria-labelledby", "lab001-process-title");
  statusSection.append(Object.assign(element("h2", "lab001__subheading", "Process state"), { id: "lab001-process-title" }));
  const statusList = element("dl", "lab001-status");
  const statusValues = Object.fromEntries(["Motor", "Conveyor", "Emergency", "Validation"].map(label => {
    const row = element("div", "lab001-status__row");
    row.append(element("dt", "", label));
    const value = element("dd", "", "—");
    row.append(value);
    statusList.append(row);
    return [label.toLowerCase(), value];
  }));
  statusSection.append(statusList);
  workbench.append(controlsSection, statusSection);

  const learning = element("section", "lab001__learning reveal");
  learning.setAttribute("aria-labelledby", "lab001-learning-title");
  const learningHeader = element("div", "lab001__learning-header");
  learningHeader.append(
    Object.assign(element("h2", "lab001__section-title", "Learning objectives"), { id: "lab001-learning-title" }),
    element("p", "lab001__learning-summary", "0 of 8 complete")
  );
  const objectiveList = element("ol", "lab001-objectives");
  const objectiveRows = lab001Definition.completionCriteria.map(id => {
    const item = element("li", "lab001-objective");
    const marker = element("span", "lab001-objective__state", "Pending");
    item.append(marker, element("span", "lab001-objective__label", RULE_LABELS.get(id) ?? id));
    objectiveList.append(item);
    return { id, item, marker };
  });
  const completion = element("div", "lab001-completion");
  completion.hidden = true;
  completion.append(
    element("strong", "lab001-completion__title", "Lab completed"),
    element("p", "", "You have successfully demonstrated the required Start / Stop control sequence.")
  );
  learning.append(learningHeader, objectiveList, completion);

  const sessionActions = element("footer", "lab001__session-actions reveal");
  const resetLabButton = commandButton("Reset laboratory", "lab001-reset-lab");
  sessionActions.append(element("p", "", "Clear this attempt and return every runtime to its initial state."), resetLabButton);
  section.append(header, stage, workbench, learning, sessionActions);

  function render(nextSnapshot, message = "") {
    snapshot = nextSnapshot;
    const view = createLab001Presentation(snapshot);
    section.dataset.state = view.status.toLowerCase();
    stateValue.textContent = view.status;
    machine.className = `lab001-machine is-${view.status.toLowerCase()}`;
    machine.setAttribute("aria-label", `Conveyor ${view.conveyor.toLowerCase()}. Motor ${view.motor.toLowerCase()}. Emergency ${view.emergency ? "active" : "clear"}.`);
    machineLabel.textContent = view.faulted ? "Machine fault" : view.emergency ? "Emergency stop active" : `Conveyor ${view.conveyor.toLowerCase()}`;
    statusValues.motor.textContent = view.motor;
    statusValues.conveyor.textContent = view.conveyor;
    statusValues.emergency.textContent = view.emergency ? "Active" : "Clear";
    statusValues.validation.textContent = view.validation;
    learningHeader.querySelector("p").textContent = view.validation;
    view.objectives.forEach((objective, index) => {
      const row = objectiveRows[index];
      row.item.dataset.state = objective.state;
      row.marker.textContent = objective.state[0].toUpperCase() + objective.state.slice(1);
    });
    completion.hidden = !snapshot.completed;
    const commandDisabled = snapshot.completed || view.faulted;
    [startButton, stopButton, emergencyButton, resetButton].forEach(button => { button.disabled = commandDisabled; });
    emergencyButton.setAttribute("aria-pressed", String(view.emergency));
    announcement.textContent = message || `${view.status}. Conveyor ${view.conveyor.toLowerCase()}.`;
  }

  function operate(operation, ticks, message) {
    if (destroyed || snapshot.completed) return;
    try {
      session.applyLearnerCommand(operation);
      const nextSnapshot = ticks > 0 ? session.runTicks(ticks) : session.getSnapshot();
      render(nextSnapshot, message);
    } catch (error) {
      render(session.getSnapshot(), "Simulation fault. Reset the laboratory to try again.");
      console.error("Lab 001 command failed.", error);
    }
  }

  bindMomentary(startButton, () => operate("pressStart", 2, "Start pressed. Conveyor command evaluated."), () => operate("releaseStart", 1, "Start released. The run circuit remains latched."), signal);
  bindMomentary(stopButton, () => operate("pressStop", 2, "Stop pressed. Conveyor stopped."), () => operate("releaseStop", 1, "Stop released."), signal);

  emergencyButton.addEventListener("click", () => {
    if (!snapshot.learnerCommands.emergency) operate("engageEmergencyStop", 1, "Emergency Stop active. Conveyor stopped.");
  }, { signal });

  resetButton.addEventListener("click", () => {
    try {
      session.applyLearnerCommand("pressReset");
      let nextSnapshot = session.advanceTick();
      if (nextSnapshot.learnerCommands.emergency) session.applyLearnerCommand("releaseEmergencyStop");
      if (nextSnapshot.learnerCommands.reset) session.applyLearnerCommand("releaseReset");
      nextSnapshot = session.advanceTick();
      render(nextSnapshot, "Emergency clear. Conveyor remains stopped.");
    } catch (error) {
      render(session.getSnapshot(), "Simulation fault. Reset the laboratory to try again.");
      console.error("Lab 001 Reset failed.", error);
    }
  }, { signal });

  resetLabButton.addEventListener("click", () => {
    try {
      render(session.resetLab(), "Laboratory reset. Ready for a new attempt.");
    } catch (error) {
      render(session.getSnapshot(), "The laboratory could not be reset.");
      console.error("Lab 001 laboratory reset failed.", error);
    }
  }, { signal });

  try {
    render(session.initialize(), "Laboratory ready. Conveyor stopped.");
  } catch (error) {
    section.replaceChildren(element("h1", "lab001__title", "Laboratory unavailable"), element("p", "lab001__objective", "The simulation could not be initialized."));
    console.error("Lab 001 initialization failed.", error);
  }

  return Object.freeze({
    element: section,
    getSnapshot: () => snapshot,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      abortController.abort();
    }
  });
}

function commandButton(label, className) {
  const button = element("button", className, label);
  button.type = "button";
  return button;
}

function bindMomentary(button, press, release, signal) {
  let active = false;
  const begin = event => {
    if (button.disabled || active) return;
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    if (event.type === "keydown") event.preventDefault();
    active = true;
    button.classList.add("is-pressed");
    button.setAttribute("aria-pressed", "true");
    press();
  };
  const end = event => {
    if (!active) return;
    if (event.type === "keyup" && !["Enter", " "].includes(event.key)) return;
    if (event.type === "keyup") event.preventDefault();
    active = false;
    button.classList.remove("is-pressed");
    button.setAttribute("aria-pressed", "false");
    release();
  };
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("pointerdown", begin, { signal });
  button.addEventListener("pointerup", end, { signal });
  button.addEventListener("pointercancel", end, { signal });
  button.addEventListener("keydown", begin, { signal });
  button.addEventListener("keyup", end, { signal });
  button.addEventListener("blur", end, { signal });
  button.addEventListener("click", event => event.preventDefault(), { signal });
}
