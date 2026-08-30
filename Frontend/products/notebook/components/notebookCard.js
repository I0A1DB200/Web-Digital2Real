export function createNotebookCard(article, onOpen, {
  documentRef = globalThis.document
} = {}) {
  if (!article || typeof article !== "object") {
    throw new TypeError("Notebook card requires article data.");
  }

  if (onOpen !== undefined && typeof onOpen !== "function") {
    throw new TypeError("Notebook card activation must be a function.");
  }

  const title = getText(article.title, "Notebook article");
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Notebook card requires a document.");
  }

  const card = documentRef.createElement(onOpen ? "button" : "article");
  card.className = "notebook-card reveal";

  if (onOpen) {
    card.type = "button";
    card.setAttribute("aria-label", `Read ${title}`);
    card.addEventListener("click", () => onOpen(article, card));
  }

  const thumbnail = createThumbnail(documentRef, article);

  if (thumbnail) {
    card.appendChild(thumbnail);
  } else {
    card.classList.add("notebook-card--text-only");
  }

  const content = documentRef.createElement("div");
  content.className = "notebook-card__content";
  const articleNumber = getArticleNumber(article);

  const branding = documentRef.createElement("div");
  branding.className = "notebook-card__branding";
  appendTextElement(branding, "span", "notebook-card__brand", "D2R");
  appendTextElement(
    branding,
    "span",
    "notebook-card__identity",
    articleNumber ? `Engineering Note #${articleNumber}` : "Engineering Note"
  );
  content.appendChild(branding);
  appendTextElement(content, "h2", "", title);

  const accent = documentRef.createElement("span");
  accent.className = "notebook-card__accent";
  accent.setAttribute("aria-hidden", "true");
  content.appendChild(accent);

  const category = createCategory(documentRef, article);
  const footer = documentRef.createElement("div");
  footer.className = "notebook-card__footer";

  if (category) {
    footer.appendChild(category);
  }

  if (onOpen) {
    const openIcon = documentRef.createElement("span");
    openIcon.className = "notebook-card__open-icon";
    openIcon.setAttribute("aria-hidden", "true");
    openIcon.textContent = "→";
    footer.appendChild(openIcon);
  }

  if (footer.children.length > 0) content.appendChild(footer);
  card.appendChild(content);
  return card;
}

function createThumbnail(documentRef, article) {
  if (!getText(article.coverImage)) {
    return null;
  }

  const figure = documentRef.createElement("figure");
  figure.className = "notebook-card__thumbnail";
  const image = documentRef.createElement("img");
  image.src = article.coverImage;
  image.alt = getText(article.coverAlt);
  image.loading = "lazy";
  figure.appendChild(image);
  return figure;
}

function createCategory(documentRef, article) {
  const category = Array.isArray(article.categories)
    ? article.categories.find(value => getText(value))
    : "";

  if (!category) return null;

  const element = documentRef.createElement("span");
  element.className = "notebook-card__category";
  element.textContent = category;
  return element;
}

function appendTextElement(container, tagName, className, value) {
  const text = getText(value);

  if (!text) {
    return;
  }

  const element = container.ownerDocument.createElement(tagName);
  element.className = className;
  element.textContent = text;
  container.appendChild(element);
}

function getArticleNumber(article) {
  const match = getText(article.id).match(/(\d+)$/);
  return match ? match[1].padStart(3, "0") : "";
}

function getText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}
