export function createLabCard(lab, onOpen) {
  const article = document.createElement("article");
  article.className = "lab-card reveal";
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `Open laboratory ${lab.title}`);

  const visibleTech = lab.technologies.slice(0, 3);

  article.innerHTML = `
    <div class="lab-card__media">
      <img src="${lab.cover}" alt="${lab.title}" loading="lazy">
    </div>

    <div class="lab-card__body">
      <div class="lab-card__meta">
        <span>${lab.id}</span>
        <span>${lab.status}</span>
      </div>

      <h2>${lab.title}</h2>

      <div class="lab-card__tags">
        ${visibleTech.map(tag => `<span>${tag}</span>`).join("")}
      </div>
    </div>
  `;

  article.addEventListener("click", () => onOpen(lab));
  article.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(lab);
    }
  });

  return article;
}
