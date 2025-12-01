(function () {
  const API_BASE = "http://localhost:8000";

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const pages = { Home:"#page-home", Videos:"#page-videos", Posts:"#page-posts" };
  const state = { videosLoaded:false, postsLoaded:false };

  function showPage(name){
    Object.values(pages).forEach(sel => $(sel).classList.add("hidden"));
    $(pages[name]).classList.remove("hidden");
    $$(".menu-link").forEach(a => a.classList.toggle("active", a.dataset.section === name));
    if(name==="Videos" && !state.videosLoaded) loadVideos();
    if(name==="Posts"  && !state.postsLoaded)  loadPosts();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function videoThumb(v){
    if(v.youtube_id) return `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
    return v.thumbnail || "";
  }

  async function loadVideos(){
    const strip = $("#videoStrip");
    strip.innerHTML = "<div class='post-card'>Cargando vídeos…</div>";
    try{
      const res = await fetch(`${API_BASE}/api/videos`);
      const data = await res.json();
      strip.innerHTML = "";
      if(!Array.isArray(data) || !data.length){
        strip.innerHTML = "<div class='post-card'>Aún no hay vídeos.</div>";
        return;
      }
      data.forEach((v, idx) => {
        const title = v.title || `Vídeo ${idx+1}`;
        const card = document.createElement("article");
        card.className = "machine-card";
        const head = `
          <div class="machine-head">
            <span class="machine-step">${String(idx+1).padStart(2,"0")}</span>
            <div class="machine-title">${title}</div>
          </div>`;
        const thumb = videoThumb(v);
        let media = "";
        if(v.youtube_id){
          media = `
            <div class="machine-thumb">
              <img src="${thumb}" alt="${title}">
              <button class="play" data-yt="${v.youtube_id}" data-title="${title}">▶</button>
            </div>`;
        }else if(v.url){
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
          const yt = btn.dataset.yt;
          const src = btn.dataset.src;
          const title = btn.dataset.title || "Reproduciendo…";
          if(yt) openVideo(yt, title); else if(src) openLocal(src, title);
        });
      });

      $("#vidPrev").onclick = () => strip.scrollBy({ left: -360, behavior: "smooth" });
      $("#vidNext").onclick = () => strip.scrollBy({ left:  360, behavior: "smooth" });

      state.videosLoaded = true;
    }catch(e){
      strip.innerHTML = "<div class='post-card'>Error cargando vídeos.</div>";
    }
  }

  function openVideo(id, title="Reproduciendo…"){
    $("#modalTitle").textContent = title;
    $("#modalContent").innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        title="YouTube player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    $("#modal").classList.remove("hidden");
  }

  function openLocal(src, title="Reproduciendo…"){
    $("#modalTitle").textContent = title;
    $("#modalContent").innerHTML = `<video controls autoplay src="${src}"></video>`;
    $("#modal").classList.remove("hidden");
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

    // === AVATAR ASISTENTE (vídeo en la esquina) ===
    const assistantAvatar = $("#assistantAvatar");
    const assistantVideo  = $("#assistantVideo");

    if (assistantAvatar && assistantVideo) {
      // Estado inicial: parado y sin sonido (como imagen)
      assistantVideo.muted = true;
      assistantVideo.pause();

      // Aseguramos que se quede en el primer frame cuando cargue
      assistantVideo.addEventListener("loadeddata", () => {
        assistantVideo.currentTime = 0;
        assistantVideo.pause();
      });

      assistantAvatar.addEventListener("click", () => {
        if (assistantVideo.paused) {
          // Reproducir con sonido
          assistantVideo.muted = false;
          assistantVideo.currentTime = 0;
          assistantVideo.play();
        } else {
          // Parar y volver a "imagen"
          assistantVideo.pause();
          assistantVideo.currentTime = 0;
          assistantVideo.muted = true;
        }
      });
    }

    showPage("Home");
  });
})();
