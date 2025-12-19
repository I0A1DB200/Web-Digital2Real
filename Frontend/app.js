(function () {
  const API_BASE = "http://localhost:8000";

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const pages = {
    Home:   "#page-home",
    Videos: "#page-videos",
    Scada:  "#page-scada"
  };

   const state = { postsLoaded:false };


   function showPage(name){
    Object.values(pages).forEach(sel => $(sel).classList.add("hidden"));
    $(pages[name]).classList.remove("hidden");
    $$(".menu-link").forEach(a => a.classList.toggle("active", a.dataset.section === name));

    // Sección vídeos: delegada a videos.js
    if (name === "Videos" && window.D2R && typeof window.D2R.initVideosSection === "function") {
      window.D2R.initVideosSection(API_BASE);
    }

    // Sección posts: sigue aquí de momento
    if (name === "Posts" && !state.postsLoaded) {
      loadPosts();
    }

    window.scrollTo({top:0, behavior:"smooth"});
  }

  function closeModal(){
    $("#modalContent").innerHTML = "";
    $("#modal").classList.add("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".menu-link, .brand").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const section = el.dataset.section || "Home";
        showPage(section);
      });
    });

    $("#closeModal")?.addEventListener("click", closeModal);
    $("#modal")?.addEventListener("click", e => { if(e.target.id==="modal") closeModal(); });

    // 🔧 ocultar modal de vídeos al inicio
    const modal = $("#modal");
    if (modal) modal.classList.add("hidden");

    // === AVATAR ASISTENTE: inicialización delegada a avatar.js ===
    if (window.D2R && typeof window.D2R.initAssistantAvatar === "function") {
      window.D2R.initAssistantAvatar();
    }

    // === SCADA: inicialización delegada a scada.js ===
    if (window.D2R && typeof window.D2R.initDrivePanelScada === "function") {
      window.D2R.initDrivePanelScada();
    }

    showPage("Home");
  });

  document.addEventListener("DOMContentLoaded", () => {
    // ... (código que hemos dejado arriba)
  });

})();
