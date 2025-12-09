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

    // === AVATAR ASISTENTE: inicialización delegada a avatar.js ===
    if (window.D2R && typeof window.D2R.initAssistantAvatar === "function") {
      window.D2R.initAssistantAvatar();
    }

    showPage("Home");
  });

  // === SIMULACIÓN PANEL DRIVE / SINAMICS V90 ===
  (function() {
    const rpmText   = document.getElementById("dp-rpm-value");
    const ledReady  = document.getElementById("led-ready");
    const ledRun    = document.getElementById("led-run");
    const ledFault  = document.getElementById("led-fault");
    const ledReverse= document.getElementById("led-reverse");
    const ledJogR   = document.getElementById("led-jog-right");
    const ledJogL   = document.getElementById("led-jog-left");

    const btnStart  = document.getElementById("btn-start");
    const btnStop   = document.getElementById("btn-stop");
    const btnReset  = document.getElementById("btn-reset");
    const btnRev    = document.getElementById("btn-reverse");
    const lblDir    = document.getElementById("lbl-direction");
    const btnJogR   = document.getElementById("btn-jog-right");
    const btnJogL   = document.getElementById("btn-jog-left");

    const spSlider  = document.getElementById("setpoint-slider");
    const spValue   = document.getElementById("setpoint-value");
    const speedFill = document.getElementById("speed-fill");
    const speedText = document.getElementById("speed-value");
    const needle    = document.getElementById("gauge-needle");

    // Si no existe la sección (por cualquier motivo), salimos
    if (!rpmText) return;

    // Estado simulado
    let running = false;
    let reverse = false;
    let fault   = false;
    let rpm     = 0;

    // Al inicio: drive listo
    ledReady.classList.add("dp-led-on");

    function updateRPMDisplay() {
      rpmText.textContent = `+${rpm.toFixed(2)} rpm`;
      const pct = Math.max(0, Math.min(1, rpm / 3000));
      speedFill.style.height = (pct * 100) + "%";
      speedText.textContent = `${Math.round(rpm)} rpm`;

      // Aguja: -120º (0 rpm) a +120º (3000 rpm)
      const angle = -120 + pct * 240;
      needle.style.transform = `rotate(${angle}deg)`;
    }

    function setLed(led, on) {
      led.classList.toggle("dp-led-on", !!on);
    }

    function stopJog() {
      setLed(ledJogR, false);
      setLed(ledJogL, false);
    }

    // Botones principales
    btnStart?.addEventListener("click", () => {
      if (fault) return;
      running = true;
      setLed(ledRun, true);
      setLed(ledReady, true);
    });

    btnStop?.addEventListener("click", () => {
      running = false;
      setLed(ledRun, false);
      stopJog();
    });

    btnReset?.addEventListener("click", () => {
      fault = false;
      setLed(ledFault, false);
      ledReady.classList.add("dp-led-on");
    });

    btnRev?.addEventListener("click", () => {
      reverse = !reverse;
      lblDir.textContent = reverse ? "REV" : "FW";
      setLed(ledReverse, reverse);
    });

    // Jog derecha
    btnJogR?.addEventListener("mousedown", () => {
      if (!running || fault) return;
      setLed(ledJogR, true);
    });
    btnJogR?.addEventListener("mouseup", stopJog);
    btnJogR?.addEventListener("mouseleave", stopJog);

    // Jog izquierda
    btnJogL?.addEventListener("mousedown", () => {
      if (!running || fault) return;
      setLed(ledJogL, true);
    });
    btnJogL?.addEventListener("mouseup", stopJog);
    btnJogL?.addEventListener("mouseleave", stopJog);

    // Slider de setpoint
    spSlider?.addEventListener("input", () => {
      spValue.textContent = `${spSlider.value} rpm`;
    });

    // Bucle de simulación (cada 100 ms)
    setInterval(() => {
      const sp = Number(spSlider?.value || 0);

      if (fault) {
        // El fallo hace que la velocidad caiga
        rpm += (0 - rpm) * 0.2;
      } else if (running) {
        const target = sp;
        rpm += (target - rpm) * 0.12; // aproximación suave al setpoint

        // Simulamos posibilidad de fallo a RPM alta
        if (rpm > 2900 && Math.random() < 0.0008) {
          fault = true;
          running = false;
          setLed(ledRun, false);
          setLed(ledFault, true);
        }
      } else {
        // Parado: frenado hacia 0
        rpm += (0 - rpm) * 0.18;
      }

      if (Math.abs(rpm) < 1) rpm = 0;

      updateRPMDisplay();
    }, 100);

    // Primera actualización
    if (spSlider) spValue.textContent = `${spSlider.value} rpm`;
    updateRPMDisplay();
  })();

})();
