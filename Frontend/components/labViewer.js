export function createLabViewer(lab, onClose) {
  const overlay = document.createElement("section");
  overlay.className = "lab-viewer";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.innerHTML = `
    <div class="lab-viewer__backdrop"></div>

    <div class="lab-viewer__panel">
      <button class="lab-viewer__close" aria-label="Close laboratory">×</button>

      <div class="lab-viewer__video">
        <video controls poster="${lab.cover}">
          <source src="${lab.video}" type="video/mp4">
        </video>
      </div>

      <div class="lab-viewer__content">
        <span class="lab-viewer__id">${lab.id}</span>
        <h2>${lab.title}</h2>
        <p>${lab.description}</p>

        <dl class="lab-viewer__specs">
          <div>
            <dt>Status</dt>
            <dd>${lab.status}</dd>
          </div>

          <div>
            <dt>Version</dt>
            <dd>${lab.version}</dd>
          </div>

          <div>
            <dt>Released</dt>
            <dd>${lab.released}</dd>
          </div>
        </dl>

        <div class="lab-viewer__tags">
          ${lab.technologies.map(tag => `<span>${tag}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  overlay.querySelector(".lab-viewer__close").addEventListener("click", onClose);
  overlay.querySelector(".lab-viewer__backdrop").addEventListener("click", onClose);

  return overlay;
}
