// Frontend/avatar/avatar.js
(function () {
  /**
   * Inicializa el avatar asistente flotante (vídeo en la esquina).
   * Deja el vídeo como "imagen" al inicio y alterna reproducir/parar al hacer clic.
   */
  function initAssistantAvatar() {
    const assistantAvatar = document.getElementById("assistantAvatar");
    const assistantVideo  = document.getElementById("assistantVideo");

    if (!assistantAvatar || !assistantVideo) {
      return; // No hay avatar en esta página
    }

    // Estado inicial: parado y sin sonido (como imagen)
    assistantVideo.muted = true;
    assistantVideo.pause();

    // Aseguramos que se quede en el primer frame cuando cargue
    assistantVideo.addEventListener("loadeddata", () => {
      assistantVideo.currentTime = 0;
      assistantVideo.pause();
    });

    // Al hacer clic sobre el avatar, alternamos reproducir / parar
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

  // Exponer función en un namespace global sencillo
  window.D2R = window.D2R || {};
  window.D2R.initAssistantAvatar = initAssistantAvatar;
})();
