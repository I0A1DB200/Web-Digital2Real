export function createNotebookCard(article, onOpen) {
  if (!article || typeof article !== "object") {
    throw new TypeError("Notebook card requires article data.");
  }

  if (onOpen !== undefined && typeof onOpen !== "function") {
    throw new TypeError("Notebook card activation must be a function.");
  }

  const title = getText(article.title, "Notebook article");
  const card = document.createElement(onOpen ? "button" : "article");
  card.className = "notebook-card reveal";

  if (card instanceof HTMLButtonElement) {
    card.type = "button";
    card.setAttribute("aria-label", `Read ${title}`);
    card.addEventListener("click", () => onOpen(article, card));
  }

  const thumbnail = createThumbnail(article);

  if (thumbnail) {
    card.appendChild(thumbnail);
  } else {
    card.classList.add("notebook-card--text-only");
  }

  const content = document.createElement("div");
  content.className = "notebook-card__content";
  const articleNumber = getArticleNumber(article);
  appendTextElement(
    content,
    "span",
    "notebook-card__identity",
    articleNumber ? `Engineering Note #${articleNumber}` : "Engineering Note"
  );
  appendTextElement(content, "span", "notebook-card__kicker", article.kicker);
  appendTextElement(content, "h2", "", title);
  appendTextElement(content, "p", "notebook-card__excerpt", article.excerpt ?? article.summary);

  const metadata = createMetadata(article);

  if (metadata) {
    content.appendChild(metadata);
  }

  card.appendChild(content);
  return card;
}

function createThumbnail(article) {
  if (!getText(article.coverImage)) {
    return null;
  }

  const figure = document.createElement("figure");
  figure.className = "notebook-card__thumbnail";
  const image = document.createElement("img");
  image.src = article.coverImage;
  image.alt = getText(article.coverAlt);
  image.loading = "lazy";
  figure.appendChild(image);
  return figure;
}

function createMetadata(article) {
  const values = [];
  const category = Array.isArray(article.categories)
    ? article.categories.find(value => getText(value))
    : "";

  if (category) {
    values.push(category);
  }

  if (Number.isFinite(article.readingTime) && article.readingTime > 0) {
    values.push(`${article.readingTime} min read`);
  }

  if (values.length === 0) {
    return null;
  }

  const metadata = document.createElement("div");
  metadata.className = "notebook-card__meta";
  metadata.textContent = values.join(" · ");
  return metadata;
}

function appendTextElement(container, tagName, className, value) {
  const text = getText(value);

  if (!text) {
    return;
  }

  const element = document.createElement(tagName);
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
