export function createNotebookCard(note) {
  const article = document.createElement("article");
  article.className = "notebook-card reveal";

  article.innerHTML = `
    <span class="notebook-card__date">${note.date}</span>
    <h2>${note.title}</h2>
    <p>${note.summary}</p>

    <div class="notebook-card__tags">
      ${note.tags.map(tag => `<span>${tag}</span>`).join("")}
    </div>
  `;

  return article;
}
