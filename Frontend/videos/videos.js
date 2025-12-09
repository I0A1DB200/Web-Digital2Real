// Frontend/videos/videos.js
(function () {
  let API_BASE = "";
  let videosLoaded = false;

  const $ = (s) => document.querySelector(s);

  function videoThumb(v) {
    if (v.youtube_id) return `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
    return v.thumbnail || "";
  }

  function openVideo(id, title = "Reproduciendo…") {
    const modalTitle   = $("#modalTitle");
    const modalContent = $("#modalContent");
    const modal        = $("#modal");

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = title;
    modalContent.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        title="YouTube player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.remove("hidden");
  }

  function openLocal(src, title = "Reproduciendo…") {
    const modalTitle   = $("#modalTitle");
    const modalContent = $("#modalContent");
    const modal        = $("#modal");

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = title;
    modalContent.innerHTML = `<video controls autoplay src="${src}"></video>`;
    modal.classList.remove("hidden");
  }

  async function loadVideos() {
    const strip = $("#videoStrip");
    if (!strip) return;

    strip.innerHTML = "<div class='post-card'>Cargando vídeos…</div>";

    try {
      const res  = await fetch(`${API_BASE}/api/videos`);
      const data = await res.json();
      strip.innerHTML = "";

      if (!Array.isArray(data) || !data.length) {
        strip.innerHTML = "<div class='post-card'>Aún no hay vídeos.</div>";
        return;
      }

      data.forEach((v, idx) => {
        const title = v.title || `Vídeo ${idx+1}`;
        const card  = document.createElement("article");
        card.className = "machine-card";

        const head = `
          <div class="machine-head">
            <span class="machine-step">${String(idx+1).padStart(2,"0")}</span>
            <div class="machine-title">${title}</div>
          </div>`;

        const thumb = videoThumb(v);
        let media = "";

        if (v.youtube_id) {
          media = `
            <div class="machine-thumb">
              <img src="${thumb}" alt="${title}">
              <button class="play" data-yt="${v.youtube_id}" data-title="${title}">▶</button>
            </div>`;
        } else if (v.url) {
          media = `
            <div class="machine-thumb">
              <video muted preload="metadata" src="${API_BASE}${v.url}#t=0.1"></video>
              <button class="play" data-src="${API_BASE}${v.url}" data-title="${title}">▶</button>
            </div>`;
        }

        card.innerHTML = head + media;
        strip.appendChild(card);
      });

      strip.querySelectorAll(".play").forEach(btn => {
        btn.addEventListener("click", () => {
          const yt    = btn.dataset.yt;
          const src   = btn.dataset.src;
          const title = btn.dataset.title || "Reproduciendo…";
          if (yt)  openVideo(yt, title);
          else if (src) openLocal(src, title);
        });
      });

      const prevBtn = $("#vidPrev");
      const nextBtn = $("#vidNext");

      if (prevBtn) {
        prevBtn.onclick = () => strip.scrollBy({ left: -360, behavior: "smooth" });
      }
      if (nextBtn) {
        nextBtn.onclick = () => strip.scrollBy({ left:  360, behavior: "smooth" });
      }

      videosLoaded = true;
    } catch (e) {
      console.error("[videos.js] Error cargando vídeos", e);
      strip.innerHTML = "<div class='post-card'>Error cargando vídeos.</div>";
    }
  }

  /**
   * Punto de entrada para la sección de vídeos.
   * Se llama desde app.js cuando el usuario entra en la pestaña "Videos".
   */
  async function initVideosSection(apiBase) {
    API_BASE = apiBase || API_BASE;
    if (videosLoaded) return; // ya cargados, no repetir
    await loadVideos();
  }

  window.D2R = window.D2R || {};
  window.D2R.initVideosSection = initVideosSection;
})();
