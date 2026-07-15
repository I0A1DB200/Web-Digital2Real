export function createNavbar(site, currentView, onNavigate) {
  const header = document.createElement("header");
  header.className = "topbar";

  header.innerHTML = `
    <div class="topbar__inner">
      <button class="brand" data-view="labs" aria-label="Go to Labs">
        Digital<span class="brand__accent">2</span>Real
      </button>

      <nav class="topbar__nav" aria-label="Main navigation">
        ${site.navigation
          .map(
            item => `
              <button 
                class="topbar__link ${item.view === currentView ? "is-active" : ""}" 
                data-view="${item.view}">
                ${item.label}
              </button>
            `
          )
          .join("")}
      </nav>
    </div>
  `;

  header.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      onNavigate(button.dataset.view);
    });
  });

  return header;
}
