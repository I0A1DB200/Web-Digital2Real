const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function createArticleViewer(article, onClose, returnFocusTo = null) {
  if (!article || typeof article !== "object") {
    throw new TypeError("Article viewer requires publication data.");
  }

  if (typeof onClose !== "function") {
    throw new TypeError("Article viewer requires a close callback.");
  }

  const title = getText(article.title, "Notebook article");
  const titleId = `article-title-${getIdentifier(article.slug ?? article.id ?? title)}`;
  const overlay = document.createElement("section");
  overlay.className = "article-viewer";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", titleId);

  const backdrop = document.createElement("div");
  backdrop.className = "article-viewer__backdrop";

  const panel = document.createElement("article");
  panel.className = "article-viewer__panel";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "article-viewer__close";
  closeButton.setAttribute("aria-label", "Close article");
  closeButton.textContent = "×";

  panel.append(closeButton, createHeader(article, title, titleId), createBody(article));
  overlay.append(backdrop, panel);

  let isActive = false;
  let isDestroyed = false;

  function requestClose() {
    onClose();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(overlay);

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!overlay.contains(document.activeElement)) {
      event.preventDefault();
      firstElement.focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function activate() {
    if (isActive || isDestroyed) {
      return;
    }

    isActive = true;
    document.body.classList.add("is-locked");
    closeButton.addEventListener("click", requestClose);
    backdrop.addEventListener("click", requestClose);
    document.addEventListener("keydown", handleKeydown);
    closeButton.focus();
  }

  function destroy() {
    if (isDestroyed) {
      return;
    }

    isDestroyed = true;
    isActive = false;
    closeButton.removeEventListener("click", requestClose);
    backdrop.removeEventListener("click", requestClose);
    document.removeEventListener("keydown", handleKeydown);
    overlay.remove();
    document.body.classList.remove("is-locked");

    if (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) {
      returnFocusTo.focus();
    }
  }

  return {
    element: overlay,
    activate,
    destroy
  };
}

function createHeader(article, title, titleId) {
  const header = document.createElement("header");
  header.className = "article-viewer__header";

  const masthead = document.createElement("div");
  masthead.className = "article-viewer__masthead";
  appendTextElement(masthead, "strong", "", "Digital2Real");
  appendTextElement(masthead, "span", "", "Notebook");
  header.appendChild(masthead);

  const noteNumber = getArticleNumber(article);
  appendTextElement(
    header,
    "span",
    "article-viewer__identity",
    noteNumber ? `Engineering Note #${noteNumber}` : "Engineering Note"
  );

  const titleBlock = document.createElement("div");
  titleBlock.className = "article-viewer__title-block";
  appendTextElement(titleBlock, "span", "article-viewer__kicker", article.kicker);

  const heading = document.createElement("h1");
  heading.id = titleId;
  heading.textContent = title;
  titleBlock.appendChild(heading);
  header.appendChild(titleBlock);

  const metadata = createMetadata(article);

  if (metadata.childElementCount > 0) {
    header.appendChild(metadata);
  }

  return header;
}

function createMetadata(article) {
  const metadata = document.createElement("div");
  metadata.className = "article-viewer__meta";
  const category = Array.isArray(article.categories)
    ? article.categories.find(value => getText(value))
    : "";
  appendTextElement(metadata, "span", "", category);

  if (Number.isFinite(article.readingTime) && article.readingTime > 0) {
    appendTextElement(metadata, "span", "", `${article.readingTime} min read`);
  }

  return metadata;
}

function createBody(article) {
  const body = document.createElement("div");
  body.className = "article-viewer__body";
  const sections = getSections(article);
  let heroInserted = false;

  sections.forEach(section => {
    const element = createSection(section);

    if (element) {
      body.appendChild(element);

      if (!heroInserted && section.type === "introduction") {
        const hero = createCoverImage(article, "article-viewer__hero");

        if (hero) {
          body.appendChild(hero);
        }

        heroInserted = true;
      }
    }
  });

  if (!heroInserted) {
    const hero = createCoverImage(article, "article-viewer__hero");

    if (hero) {
      body.prepend(hero);
    }
  }

  return body;
}

function createSection(section) {
  if (!section || typeof section !== "object") {
    return null;
  }

  const creators = {
    introduction: () => createTextSection("p", "article-section--introduction", section.content),
    heading: () => createTextSection("h2", "article-section--heading", section.title),
    paragraph: () => createTextSection("p", "article-section--paragraph", section.content),
    "engineering-note": () => createEditorialNote(section),
    callout: () => createCallout(section),
    list: () => createList(section),
    code: () => createCode(section),
    quote: () => createTextSection("blockquote", "article-section--quote", section.content)
  };

  return creators[section.type]?.() ?? null;
}

function createEditorialNote(section) {
  const content = getText(section.content);

  if (!content) {
    return null;
  }

  const aside = document.createElement("aside");
  aside.className = "article-section article-section--engineering-note";
  appendTextElement(aside, "span", "article-section__label", "Digital2Real Engineering Note");
  appendTextElement(aside, "h3", "", section.title);
  appendTextElement(aside, "p", "", content);
  return aside;
}

function createTextSection(tagName, className, value) {
  const text = getText(value);

  if (!text) {
    return null;
  }

  const element = document.createElement(tagName);
  element.className = `article-section ${className}`;
  element.textContent = text;
  return element;
}

function createCallout(section) {
  const content = getText(section.content);

  if (!content) {
    return null;
  }

  const aside = document.createElement("aside");
  aside.className = "article-section article-section--callout";
  appendTextElement(aside, "h3", "", section.title);
  appendTextElement(aside, "p", "", content);
  return aside;
}

function createList(section) {
  const items = Array.isArray(section.items) ? section.items : [];
  const validItems = items.map(item => getText(item)).filter(Boolean);

  if (validItems.length === 0) {
    return null;
  }

  const wrapper = document.createElement("section");
  wrapper.className = "article-section article-section--list";
  appendTextElement(wrapper, "h3", "", section.title);
  const list = document.createElement("ul");

  validItems.forEach(item => {
    appendTextElement(list, "li", "", item);
  });

  wrapper.appendChild(list);
  return wrapper;
}

function createCode(section) {
  const content = getText(section.content);

  if (!content) {
    return null;
  }

  const pre = document.createElement("pre");
  pre.className = "article-section article-section--code";
  const code = document.createElement("code");
  code.textContent = content;

  if (getText(section.language)) {
    code.dataset.language = section.language;
  }

  pre.appendChild(code);
  return pre;
}

function createCoverImage(article, className) {
  if (!getText(article.coverImage)) {
    return null;
  }

  const figure = document.createElement("figure");
  figure.className = className;
  const image = document.createElement("img");
  image.src = article.coverImage;
  image.alt = getText(article.coverAlt);
  figure.appendChild(image);
  return figure;
}

function getSections(article) {
  if (Array.isArray(article.sections)) {
    return article.sections;
  }

  const legacyContent = getText(article.content);
  return legacyContent ? [{ type: "paragraph", content: legacyContent }] : [];
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

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(element => {
    return element instanceof HTMLElement && !element.hidden;
  });
}

function getIdentifier(value) {
  const identifier = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return identifier || "notebook-article";
}

function getArticleNumber(article) {
  const match = getText(article.id).match(/(\d+)$/);
  return match ? match[1].padStart(3, "0") : "";
}

function getText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}
