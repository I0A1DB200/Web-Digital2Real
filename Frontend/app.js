// Frontend/app.js
(function () {
  const API_BASE = "http://localhost:8000";

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const pages = {
    Home:   "#page-home",
    Videos: "#page-videos",
    Scada:  "#page-scada"
  };

  const state = { postsLoaded: false };

  function showPage(name) {
    Object.values(pages).forEach(sel => $(sel)?.classList.add("hidden"));
    $(pages[name])?.classList.remove("hidden");

    $$(".menu-link").forEach(a =>
      a.classList.toggle("active", a.dataset.section === name)
    );

    // Sección vídeos: delegada a videos.js
    if (name === "Videos" && window.D2R && typeof window.D2R.initVideosSection === "function") {
      window.D2R.initVideosSection(API_BASE);
    }

    // Sección posts: sigue aquí de momento (no existe en esta versión, se mantiene por compatibilidad)
    if (name === "Posts" && !state.postsLoaded && typeof loadPosts === "function") {
      loadPosts();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeModal() {
    const modal = $("#modal");
    const content = $("#modalContent");

    // Parar vídeo si hay uno dentro
    const video = content?.querySelector("video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }

    // Si hubiera iframe (YouTube), al limpiar innerHTML se corta la reproducción
    if (content) content.innerHTML = "";

    modal?.classList.add("hidden");
    modal?.setAttribute("aria-hidden", "true");
  }

  function openLocalVideoInModal(src, title = "Reproduciendo…") {
    const modal = $("#modal");
    const modalTitle = $("#modalTitle");
    const content = $("#modalContent");

    if (!modal || !modalTitle || !content) return;

    modalTitle.textContent = title;

    content.innerHTML = `
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
    `;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    const v = content.querySelector("video");
    if (v) v.play().catch(() => {});
  }

  function bindHomeHeroVideo() {
    const hero = $("#homeHero");
    if (!hero) return;

    hero.style.cursor = "pointer";

    // Evita duplicar listeners si se llamara más de una vez
    hero.addEventListener("click", () => {
      openLocalVideoInModal("assets/videos/IA_Pagina_inicial.mp4", "IA · Página inicial");
    },);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Navegación SPA
    $$(".menu-link, .brand").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const section = el.dataset.section || "Home";
        showPage(section);
      });
    });

    // Modal events
    $("#closeModal")?.addEventListener("click", closeModal);
    $("#modal")?.addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

    // Ocultar modal al inicio
    const modal = $("#modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }

    // Avatar
    if (window.D2R && typeof window.D2R.initAssistantAvatar === "function") {
      window.D2R.initAssistantAvatar();
    }

    // SCADA
    if (window.D2R && typeof window.D2R.initDrivePanelScada === "function") {
      window.D2R.initDrivePanelScada();
    }

    // Home por defecto
    showPage("Home");

    // Click hero -> vídeo local
    bindHomeHeroVideo();
  });

})();
