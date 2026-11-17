const CATALOG_TITLE_ID = "d2r-simulator-catalog-title";

export function createSimulatorCatalog(simulators, onOpen, { documentRef = globalThis.document } = {}) {
  validateSimulators(simulators);

  if (typeof onOpen !== "function") {
    throw new TypeError("Simulator catalog requires an activation callback.");
  }

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Simulator catalog requires a document.");
  }

  const section = documentRef.createElement("section");
  section.className = "simulator-catalog-section reveal";
  section.setAttribute("aria-labelledby", CATALOG_TITLE_ID);

  const header = documentRef.createElement("header");
  header.className = "simulator-catalog__header";

  const eyebrow = documentRef.createElement("p");
  eyebrow.className = "simulator-catalog__eyebrow";

  const catalogTitle = documentRef.createElement("h2");
  catalogTitle.id = CATALOG_TITLE_ID;
  catalogTitle.className = "simulator-catalog__title";

  const catalogDescription = documentRef.createElement("p");
  catalogDescription.className = "simulator-catalog__description";
  header.append(eyebrow, catalogTitle, catalogDescription);

  const grid = documentRef.createElement("div");
  grid.className = "simulator-catalog";

  const cards = new Map();
  simulators.forEach(simulator => {
    const card = createCard(simulator, onOpen, documentRef);
    cards.set(simulator.id, card);
    grid.appendChild(card.element);
  });
  section.append(header, grid);

  function update(nextSimulators) {
    validateSimulators(nextSimulators);
    if (nextSimulators.length !== cards.size || nextSimulators.some(item => !cards.has(item.id))) {
      throw new TypeError("Simulator catalog updates must preserve simulator identities.");
    }

    const first = nextSimulators[0];
    eyebrow.textContent = first.catalogEyebrow;
    catalogTitle.textContent = first.catalogTitle;
    catalogDescription.textContent = first.catalogDescription;
    nextSimulators.forEach(simulator => cards.get(simulator.id).update(simulator));
  }

  update(simulators);
  return { element: section, update };
}

function createCard(simulator, onOpen, documentRef) {
  const card = documentRef.createElement("article");
  card.className = "simulator-card";

  const link = documentRef.createElement("a");
  link.className = "simulator-card__main";
  link.addEventListener("click", event => {
    event.preventDefault();
    onOpen(currentSimulator, link);
  });

  const media = documentRef.createElement("div");
  media.className = "simulator-card__media";

  const image = documentRef.createElement("img");
  image.className = "simulator-card__image";
  image.width = 1280;
  image.height = 720;
  image.loading = "lazy";
  media.appendChild(image);

  const content = documentRef.createElement("div");
  content.className = "simulator-card__content";

  const cardEyebrow = documentRef.createElement("span");
  cardEyebrow.className = "simulator-card__eyebrow";

  const title = documentRef.createElement("h3");
  title.id = `${CARD_TITLE_PREFIX}${simulator.id}`;
  title.className = "simulator-card__title";

  const description = documentRef.createElement("p");
  description.className = "simulator-card__description";

  const projectNote = documentRef.createElement("p");
  projectNote.className = "simulator-card__note";

  const openLabel = documentRef.createElement("span");
  openLabel.className = "simulator-card__open-label";

  content.append(cardEyebrow, title, description, projectNote, openLabel);
  link.append(media, content);
  card.appendChild(link);

  let currentSimulator = simulator;

  function update(nextSimulator) {
    currentSimulator = nextSimulator;
    cardEyebrow.textContent = nextSimulator.eyebrow;
    title.textContent = nextSimulator.title;
    description.textContent = nextSimulator.description;
    projectNote.textContent = nextSimulator.projectNote;
    openLabel.textContent = nextSimulator.openLabel;
    image.src = requireLocalPath(nextSimulator.cover, "cover");
    image.alt = nextSimulator.imageAlt;
    link.href = requireLocalPath(nextSimulator.htmlUrl, "HTML");
    link.setAttribute("aria-labelledby", title.id);
  }

  update(simulator);
  return { element: card, update };
}

function validateSimulators(simulators) {
  if (!Array.isArray(simulators) || simulators.length === 0) {
    throw new TypeError("Simulator catalog requires at least one simulator.");
  }

  const identities = new Set();
  simulators.forEach(simulator => {
    if (!simulator || typeof simulator !== "object" || typeof simulator.id !== "string" || !simulator.id.trim()) {
      throw new TypeError("Each simulator requires a stable identity.");
    }
    if (identities.has(simulator.id)) throw new TypeError(`Duplicate simulator identity: ${simulator.id}.`);
    identities.add(simulator.id);
  });
}

function requireLocalPath(value, name) {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.includes(":") || value.split("/").includes("..")) {
    throw new TypeError(`Simulator ${name} must use a local relative path.`);
  }
  return value;
}

const CARD_TITLE_PREFIX = "d2r-simulator-card-title-";
