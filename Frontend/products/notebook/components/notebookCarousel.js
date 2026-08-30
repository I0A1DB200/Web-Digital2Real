import { createNotebookCard } from "./notebookCard.js";

const ALL_CATEGORIES = "__all__";
const CATEGORY_MENU_ID = "notebook-carousel-category-menu";
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
  let menuExpanded = false;
  let pointerStart = null;

  const element = documentRef.createElement("section");
  element.className = "notebook-carousel";
  element.setAttribute("role", "region");
  element.setAttribute("aria-label", "Engineering Notes carousel");

  const filters = documentRef.createElement("div");
  filters.className = "notebook-carousel__filters";
  filters.setAttribute("aria-label", "Filter Engineering Notes by category");

  const responsiveFilters = documentRef.createElement("div");
  responsiveFilters.className = "notebook-carousel__responsive-filters";

  const filterToggle = documentRef.createElement("button");
  filterToggle.type = "button";
  filterToggle.className = "notebook-carousel__filter-toggle";
  filterToggle.textContent = "☰";
  filterToggle.setAttribute("aria-label", "Choose Engineering Notes category");
  filterToggle.setAttribute("aria-controls", CATEGORY_MENU_ID);

  const filterMenu = documentRef.createElement("div");
  filterMenu.id = CATEGORY_MENU_ID;
  filterMenu.className = "notebook-carousel__filter-menu";
  filterMenu.setAttribute("aria-label", "Filter Engineering Notes by category");
  responsiveFilters.append(filterToggle, filterMenu);

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
  viewport.append(previous, next);
  controls.appendChild(position);
  element.append(filters, responsiveFilters, viewport, controls);

  function filteredArticles() {
    if (activeCategory === ALL_CATEGORIES) return source;
    return source.filter(article => normalizedCategories(article).includes(activeCategory));
  }

  function move(delta) {
    const collection = filteredArticles();
    if (collection.length < 2) return;
    activeIndex = modulo(activeIndex + delta, collection.length);
    renderCollection();
  }

  function selectCategory(category) {
    activeCategory = category;
    activeIndex = 0;
    setMenuExpanded(false);
    renderFilters();
    renderCollection();
  }

  function renderFilters() {
    filters.replaceChildren();
    filterMenu.replaceChildren();
    categoryEntries(categories).forEach(([value, label]) => {
      filters.appendChild(createFilterButton(documentRef, value, label, activeCategory, selectCategory));
      filterMenu.appendChild(createFilterButton(
        documentRef,
        value,
        label,
        activeCategory,
        selectCategory,
        "notebook-carousel__filter-menu-option"
      ));
    });
    setMenuExpanded(menuExpanded);
  }

  function setMenuExpanded(expanded) {
    menuExpanded = Boolean(expanded);
    filterToggle.setAttribute("aria-expanded", String(menuExpanded));
    filterMenu.hidden = !menuExpanded;
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
      renderPosition(0);
      return;
    }

    activeIndex = modulo(activeIndex, collection.length);

    for (const relativePosition of visiblePositions(collection.length)) {
      const index = modulo(activeIndex + relativePosition, collection.length);
      const article = collection[index];
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

    previous.disabled = collection.length < 2;
    next.disabled = collection.length < 2;
    renderPosition(collection.length);
  }

  function renderPosition(collectionLength) {
    const label = documentRef.createElement("span");
    label.className = "notebook-carousel__position-label";
    label.textContent = collectionLength === 0 ? "0 of 0" : `${activeIndex + 1} of ${collectionLength}`;

    const segments = documentRef.createElement("span");
    segments.className = "notebook-carousel__segments";
    segments.setAttribute("aria-hidden", "true");
    const visualSegmentCount = collectionLength === 0 ? 0 : 5;
    for (let index = 0; index < visualSegmentCount; index += 1) {
      const segment = documentRef.createElement("span");
      segment.className = "notebook-carousel__segment";
      if (index === 2) segment.classList.add("is-active");
      segments.appendChild(segment);
    }
    position.replaceChildren(label, segments);
  }

  function render() {
    renderFilters();
    renderCollection();
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && menuExpanded) {
      event.preventDefault();
      setMenuExpanded(false);
      if (typeof filterToggle.focus === "function") filterToggle.focus();
    } else if (event.key === "ArrowLeft") {
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
  filterToggle.addEventListener("click", () => setMenuExpanded(!menuExpanded));
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

function categoryEntries(categories) {
  return [[ALL_CATEGORIES, "All"], ...categories.map(category => [category, category])];
}

function createFilterButton(
  documentRef,
  value,
  label,
  activeCategory,
  onSelect,
  className = "notebook-carousel__filter"
) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.setAttribute("aria-pressed", String(value === activeCategory));
  button.addEventListener("click", () => onSelect(value));
  return button;
}

function visiblePositions(collectionLength) {
  if (collectionLength <= 0) return [];
  if (collectionLength === 1) return [0];
  if (collectionLength === 2) return [0, 1];
  if (collectionLength === 3) return [-1, 0, 1];
  if (collectionLength === 4) return [-1, 0, 1, 2];
  return Array.from({ length: (VISIBLE_RADIUS * 2) + 1 }, (_, index) => index - VISIBLE_RADIUS);
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
