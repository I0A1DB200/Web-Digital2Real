(function () {
  const API_BASE = "http://localhost:8000";

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const pages = {
    Home:   "#page-home",
    Videos: "#page-videos",
    Posts:  "#page-posts",
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

  async function loadPosts(){
    const grid = $("#postGrid");
    grid.innerHTML = "<div class='post-card'>Cargando posts…</div>";
    try{
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();
      grid.innerHTML = "";
      if(!Array.isArray(data) || !data.length){
        grid.innerHTML = "<div class='post-card'>Aún no hay posts.</div>";
        return;
      }
      data.forEach(p => {
        const card = document.createElement("article");
        card.className = "post-card";
        card.innerHTML = `<h3>${p.title}</h3><p>${(p.content || "").slice(0,180)}${(p.content||"").length>180?"…":""}</p>`;
        grid.appendChild(card);
      });
      state.postsLoaded = true;
    }catch(e){
      grid.innerHTML = "<div class='post-card'>Error cargando posts.</div>";
    }
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
