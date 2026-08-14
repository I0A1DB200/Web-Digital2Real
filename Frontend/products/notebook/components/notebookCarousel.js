import { createNotebookCard } from "./notebookCard.js";

const ALL_CATEGORIES = "__all__";
const SWIPE_THRESHOLD = 48;
const VISIBLE_RADIUS = 2;

export function createNotebookCarousel(articles, onOpen, {
  documentRef = globalThis.document,
  cardFactory = createNotebookCard
} = {}) {
  if (!Array.isArray(articles)) {
    throw new TypeError("Notebook carousel requires an article array.");
  }
  if (typeof onOpen !== "function") {
    throw new TypeError("Notebook carousel requires an article opening callback.");
  }
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Notebook carousel requires a document.");
  }

  const source = [...articles];
  const categories = deriveCategories(source);
  let activeCategory = ALL_CATEGORIES;
  let activeIndex = 0;
  let pointerStart = null;

  const element = documentRef.createElement("section");
  element.className = "notebook-carousel";
  element.setAttribute("role", "region");
  element.setAttribute("aria-label", "Engineering Notes carousel");

  const filters = documentRef.createElement("div");
  filters.className = "notebook-carousel__filters";
  filters.setAttribute("aria-label", "Filter Engineering Notes by category");

  const viewport = documentRef.createElement("div");
  viewport.className = "notebook-carousel__viewport";

  const track = documentRef.createElement("div");
  track.className = "notebook-carousel__track";
  track.setAttribute("aria-live", "off");
  viewport.appendChild(track);

  const controls = documentRef.createElement("div");
  controls.className = "notebook-carousel__controls";
  const previous = createControl(documentRef, "Previous Engineering Note", "←");
  previous.classList.add("notebook-carousel__control--previous");
  const position = documentRef.createElement("p");
  position.className = "notebook-carousel__position";
  position.setAttribute("role", "status");
  position.setAttribute("aria-live", "polite");
  position.setAttribute("aria-atomic", "true");
  const next = createControl(documentRef, "Next Engineering Note", "→");
  next.classList.add("notebook-carousel__control--next");
  controls.append(previous, position, next);
  element.append(filters, viewport, controls);

  function filteredArticles() {
    if (activeCategory === ALL_CATEGORIES) return source;
    return source.filter(article => normalizedCategories(article).includes(activeCategory));
  }

  function move(delta) {
    const collection = filteredArticles();
    const nextIndex = Math.min(Math.max(activeIndex + delta, 0), Math.max(collection.length - 1, 0));
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    renderCollection();
  }

  function selectCategory(category) {
    if (category === activeCategory) return;
    activeCategory = category;
    activeIndex = 0;
    render();
  }

  function renderFilters() {
    filters.replaceChildren();
    [[ALL_CATEGORIES, "All"], ...categories.map(category => [category, category])]
      .forEach(([value, label]) => {
        const button = documentRef.createElement("button");
        button.type = "button";
        button.className = "notebook-carousel__filter";
        button.textContent = label;
        button.setAttribute("aria-pressed", String(value === activeCategory));
        button.addEventListener("click", () => selectCategory(value));
        filters.appendChild(button);
      });
  }

  function renderCollection() {
    const collection = filteredArticles();
    track.replaceChildren();

    if (collection.length === 0) {
      const empty = documentRef.createElement("p");
      empty.className = "notebook-carousel__empty";
      empty.textContent = "No Engineering Notes are available in this category.";
      track.appendChild(empty);
      previous.disabled = true;
      next.disabled = true;
      position.textContent = "0 of 0";
      return;
    }

    activeIndex = Math.min(activeIndex, collection.length - 1);
    const first = Math.max(0, activeIndex - VISIBLE_RADIUS);
    const last = Math.min(collection.length - 1, activeIndex + VISIBLE_RADIUS);

    for (let index = first; index <= last; index += 1) {
      const article = collection[index];
      const relativePosition = index - activeIndex;
      const card = cardFactory(article, (selectedArticle, opener) => {
        if (index === activeIndex) {
          onOpen(selectedArticle, opener);
          return;
        }
        activeIndex = index;
        renderCollection();
      });
      card.classList.remove("reveal", "is-visible");
      card.classList.add("notebook-carousel__card");
      card.setAttribute("data-position", String(relativePosition));
      card.setAttribute("aria-setsize", String(collection.length));
      card.setAttribute("aria-posinset", String(index + 1));
      if (relativePosition === 0) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
      track.appendChild(card);
    }

    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === collection.length - 1;
    position.textContent = `${activeIndex + 1} of ${collection.length}`;
  }

  function render() {
    renderFilters();
    renderCollection();
  }

  function handleKeydown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse") return;
    pointerStart = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event) {
    if (!pointerStart || event.pointerType === "mouse") return;
    const horizontal = event.clientX - pointerStart.x;
    const vertical = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(horizontal) < SWIPE_THRESHOLD || Math.abs(horizontal) <= Math.abs(vertical)) return;
    move(horizontal < 0 ? 1 : -1);
  }

  function handlePointerCancel() {
    pointerStart = null;
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  element.addEventListener("keydown", handleKeydown);
  viewport.addEventListener("pointerdown", handlePointerDown);
  viewport.addEventListener("pointerup", handlePointerUp);
  viewport.addEventListener("pointercancel", handlePointerCancel);
  render();

  return Object.freeze({
    element,
    getState: () => Object.freeze({
      activeCategory: activeCategory === ALL_CATEGORIES ? "All" : activeCategory,
      activeIndex,
      categories: Object.freeze([...categories]),
      filteredCount: filteredArticles().length
    })
  });
}

export function deriveNotebookCategories(articles) {
  if (!Array.isArray(articles)) return Object.freeze([]);
  return Object.freeze(deriveCategories(articles));
}

function deriveCategories(articles) {
  const unique = new Set();
  articles.forEach(article => normalizedCategories(article).forEach(category => unique.add(category)));
  return [...unique];
}

function normalizedCategories(article) {
  if (!Array.isArray(article?.categories)) return [];
  return article.categories
    .filter(category => typeof category === "string" && category.trim())
    .map(category => category.trim());
}

function createControl(documentRef, label, text) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = "notebook-carousel__control";
  button.setAttribute("aria-label", label);
  button.textContent = text;
  return button;
}
