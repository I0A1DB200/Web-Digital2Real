// Frontend/scada/scada.js
(function () {
  /**
   * Punto de entrada para el panel SCADA / SINAMICS V90.
   * Más adelante moveremos aquí toda la simulación que ahora está en app.js.
   */
  function initDrivePanelScada() {
    const rpmText = document.getElementById("dp-rpm-value");
    if (!rpmText) {
      // Si no existe la sección SCADA en esta página, salimos sin hacer nada
      return;
    }

    console.log("[scada.js] initDrivePanelScada() – pendiente de implementación");
    // TODO: trasladar aquí la lógica de simulación del drive desde app.js
  }

  window.D2R = window.D2R || {};
  window.D2R.initDrivePanelScada = initDrivePanelScada;
})();
