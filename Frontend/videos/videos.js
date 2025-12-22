// Frontend/videos/videos.js
(function () {
  let videosLoaded = false;

  const $ = (s) => document.querySelector(s);

  // === Modo TEST: lista local (sin backend / sin JSON) ===
  // Primer elemento: VIDEO LOCAL
  const MOCK_VIDEOS = [
    {
      type: "local",
      title: "IA · Rodillos · Cobots",
      description: "Demostración local (modo portfolio).",
      src: "assets/videos/IA_Rodillos_Cobots.mp4"
    },
    // Resto: YouTube placeholders
    {
      type: "youtube",
      title: "Demo 01 – SCADA Web (test)",
      description: "Placeholder card (no real video yet).",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      type: "youtube",
      title: "Demo 02 – Node-RED + OPC UA (test)",
      description: "Placeholder card (no real video yet).",
      youtubeId: "M7lc1UVf-VE"
    },
    {
      type: "youtube",
      title: "Demo 03 – WinCC OA integration (test)",
      description: "Placeholder card (no real video yet).",
      youtubeId: "ysz5S6PUM-U"
    }
  ];

  async function loadVideos() {
    return MOCK_VIDEOS;
  }

  function openModalWithHtml(title, html) {
    const modalTitle = $("#modalTitle");
    const modalContent = $("#modalContent");
    const modal = $("#modal");
    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = title || "Reproduciendo…";
    modalContent.innerHTML = html;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function openYoutube(youtubeId, title = "Reproduciendo…") {
    openModalWithHtml(
      title,
      `
        <iframe
          width="100%" height="420"
          src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
          title="${title}"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen>
        </iframe>
      `
    );
  }

  function openLocalVideo(src, title = "Reproduciendo…") {
    openModalWithHtml(
      title,
      `
        <video
          width="100%"
          height="420"
          controls
          playsinline
          preload="metadata"
          style="width:100%;max-width:100%;border-radius:12px;background:#000;"
        >
          <source src="${src}" type="video/mp4" />
          Tu navegador no soporta vídeo HTML5.
        </video>
      `
    );

    // Intentar autoplay (puede fallar por política del navegador)
    const v = $("#modalContent video");
    if (v) v.play().catch(() => {});
  }

  function closeModal() {
    const modal = $("#modal");
    const modalContent = $("#modalContent");

    // Pausar vídeo si existe
    const v = modalContent ? modalContent.querySelector("video") : null;
    if (v) {
      v.pause();
      v.removeAttribute("src"); // seguridad extra
      v.load();
    }

    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
    if (modalContent) modalContent.innerHTML = "";
  }

  function getThumb(v) {
    if (v.type === "youtube" && v.youtubeId) {
      return `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
    }
    if (v.type === "local") {
      // Para local: usa una miniatura genérica (sin tocar CSS actual)
      // Si quieres, luego lo cambiamos para usar una imagen específica por vídeo.
      return "assets/images/hero.jpg";
    }
    return "";
  }

  function renderVideos(videos) {
    const strip = $("#videoStrip");
    if (!strip) {
      console.error("[videos.js] No existe #videoStrip en el DOM.");
      return;
    }

    strip.innerHTML = "";

    videos.forEach((v, i) => {
      const thumb = getThumb(v);

      const card = document.createElement("article");
      card.className = "machine-card";
      card.innerHTML = `
        <div class="machine-head">
          <span class="machine-step">${String(i + 1).padStart(2, "0")}</span>
          <span class="machine-title">${v.title || "Demo"}</span>
        </div>

        <div class="machine-thumb">
          ${thumb
            ? `<img src="${thumb}" alt="${v.title || ""}">`
            : `<div style="padding:16px;color:#b8c4d2">No thumbnail</div>`
          }
          <button class="play" type="button">▶ Play</button>
        </div>

        <div class="machine-foot">
          <span>${v.description || ""}</span>
        </div>
      `;

      card.querySelector(".play").addEventListener("click", () => {
        if (v.type === "local") {
          if (!v.src) return alert("Video local no configurado.");
          openLocalVideo(v.src, v.title || "Reproduciendo…");
          return;
        }
        if (v.type === "youtube") {
          if (!v.youtubeId) return alert("Video placeholder (no video uploaded yet).");
          openYoutube(v.youtubeId, v.title || "Reproduciendo…");
          return;
        }
        alert("Tipo de vídeo no soportado.");
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

  // Cerrar modal (reutiliza modal global)
  $("#closeModal")?.addEventListener("click", closeModal);
  $("#modal")?.addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

})();
