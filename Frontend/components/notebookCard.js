export function createNotebookCard(note) {
  if (!note || typeof note !== "object") {
    throw new TypeError("Notebook card requires entry data.");
  }

  const article = document.createElement("article");
  article.className = "notebook-card reveal";

  const date = document.createElement("span");
  date.className = "notebook-card__date";
  date.textContent = getText(note.date);

  const heading = document.createElement("h2");
  heading.textContent = getText(note.title, "Notebook entry");

  const summary = document.createElement("p");
  summary.textContent = getText(note.summary);

  const tags = document.createElement("div");
  tags.className = "notebook-card__tags";
  const tagValues = Array.isArray(note.tags) ? note.tags : [];

  tagValues.forEach(tag => {
    if (typeof tag !== "string" && typeof tag !== "number") {
      return;
    }

    const item = document.createElement("span");
    item.textContent = String(tag);
    tags.appendChild(item);
  });

  article.append(date, heading, summary, tags);
  return article;
}

function getText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}
