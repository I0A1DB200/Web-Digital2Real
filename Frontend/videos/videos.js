// Frontend/videos/videos.js
(function () {
  let videosLoaded = false;

  const $ = (s) => document.querySelector(s);

  // === Modo TEST: lista local (sin backend / sin JSON) ===
  const MOCK_VIDEOS = [
    { title: "Demo 01 – SCADA Web (test)", description: "Placeholder card (no real video yet).", youtubeId: "dQw4w9WgXcQ" },
    { title: "Demo 02 – Node-RED + OPC UA (test)", description: "Placeholder card (no real video yet).", youtubeId: "M7lc1UVf-VE" },
    { title: "Demo 03 – WinCC OA integration (test)", description: "Placeholder card (no real video yet).", youtubeId: "ysz5S6PUM-U" }
  ];

  async function loadVideos() {
    return MOCK_VIDEOS;
  }

  function openVideo(youtubeId, title = "Reproduciendo…") {
    const modalTitle = $("#modalTitle");
    const modalContent = $("#modalContent");
    const modal = $("#modal");
    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = title;
    modalContent.innerHTML = `
      <iframe
        width="100%" height="420"
        src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
        title="${title}"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    const modal = $("#modal");
    const modalContent = $("#modalContent");
    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
    if (modalContent) modalContent.innerHTML = "";
  }

  function renderVideos(videos) {
    const strip = $("#videoStrip");
    if (!strip) {
      console.error("[videos.js] No existe #videoStrip en el DOM.");
      return;
    }

    strip.innerHTML = "";

    videos.forEach((v, i) => {
      const yt = v.youtubeId || "";
      const thumb = yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : "";

      // Reutiliza el estilo existente de "machine-card"
      const card = document.createElement("article");
      card.className = "machine-card";
      card.innerHTML = `
        <div class="machine-head">
          <span class="machine-step">${String(i + 1).padStart(2, "0")}</span>
          <span class="machine-title">${v.title || "Demo"}</span>
        </div>

        <div class="machine-thumb">
          ${thumb ? `<img src="${thumb}" alt="${v.title || ""}">` : `<div style="padding:16px;color:#b8c4d2">No thumbnail</div>`}
          <button class="play" type="button">▶ Play</button>
        </div>

        <div class="machine-foot">
          <span>${v.description || ""}</span>
        </div>
      `;

      card.querySelector(".play").addEventListener("click", () => {
        if (!yt) return alert("Video placeholder (no video uploaded yet).");
        openVideo(yt, v.title || "Reproduciendo…");
      });

      strip.appendChild(card);
    });
  }

  async function initVideosSection() {
    if (videosLoaded) return;
    const videos = await loadVideos();
    renderVideos(videos);
    videosLoaded = true;
  }

  // Exponer API
  window.D2R = window.D2R || {};
  window.D2R.initVideosSection = initVideosSection;

  // Cerrar modal
  $("#closeModal")?.addEventListener("click", closeModal);
  $("#modal")?.addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

})();
