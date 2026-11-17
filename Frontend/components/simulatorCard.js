const PREVIEW_CARD_ID = "d2r-simulator-card-title";

export function createSimulatorCard(simulator, { documentRef = globalThis.document } = {}) {
  if (!simulator || typeof simulator !== "object") {
    throw new TypeError("Simulator card requires simulator data.");
  }

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Simulator card requires a document.");
  }

  const section = documentRef.createElement("section");
  section.className = "simulator-feature reveal";
  section.setAttribute("aria-labelledby", PREVIEW_CARD_ID);

  const card = documentRef.createElement("article");
  card.className = "simulator-feature__card";

  const media = documentRef.createElement("div");
  media.className = "simulator-feature__media";
  const image = documentRef.createElement("img");
  image.src = simulator.cover;
  image.width = 1280;
  image.height = 720;
  image.loading = "eager";
  media.appendChild(image);

  const content = documentRef.createElement("div");
  content.className = "simulator-feature__content";

  const eyebrow = documentRef.createElement("p");
  eyebrow.className = "simulator-feature__eyebrow";

  const title = documentRef.createElement("h2");
  title.id = PREVIEW_CARD_ID;

  const description = documentRef.createElement("p");
  description.className = "simulator-feature__description";

  const actions = documentRef.createElement("div");
  actions.className = "simulator-feature__actions";

  const previewLink = documentRef.createElement("a");
  previewLink.className = "simulator-feature__link simulator-feature__link--primary";
  previewLink.target = "_blank";
  previewLink.rel = "noopener noreferrer";

  const repositoryLink = documentRef.createElement("a");
  repositoryLink.className = "simulator-feature__link simulator-feature__link--secondary";
  repositoryLink.target = "_blank";
  repositoryLink.rel = "noopener noreferrer";

  const previewNote = documentRef.createElement("p");
  previewNote.className = "simulator-feature__note";
  previewNote.setAttribute("role", "note");

  const imageNote = documentRef.createElement("p");
  imageNote.className = "simulator-feature__image-note";

  actions.append(previewLink, repositoryLink);
  content.append(eyebrow, title, description, actions, previewNote, imageNote);
  card.append(media, content);
  section.appendChild(card);

  function update(nextSimulator) {
    if (!nextSimulator || typeof nextSimulator !== "object") {
      throw new TypeError("Simulator card update requires simulator data.");
    }

    image.src = nextSimulator.cover;
    image.alt = nextSimulator.imageAlt;
    eyebrow.textContent = nextSimulator.eyebrow;
    title.textContent = nextSimulator.title;
    description.textContent = nextSimulator.description;
    previewLink.href = requireHttpsUrl(nextSimulator.previewUrl);
    previewLink.textContent = nextSimulator.previewLabel;
    previewNote.textContent = nextSimulator.previewNote;
    repositoryLink.href = requireHttpsUrl(nextSimulator.repositoryUrl);
    repositoryLink.textContent = nextSimulator.repositoryLabel;
    imageNote.textContent = nextSimulator.imageNote;
  }

  update(simulator);
  return { element: section, update };
}

function requireHttpsUrl(value) {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    throw new TypeError("Simulator card links must use HTTPS.");
  }
  return value;
}
