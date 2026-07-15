export function createAbout(site) {
  const section = document.createElement("section");
  section.className = "about-view reveal";

  section.innerHTML = `
    <div class="about-view__content">
      <span class="section-kicker">About</span>

      <h1>Engineering laboratories between software and industry.</h1>

      <p>
        Digital2Real is a personal engineering archive focused on industrial automation,
        SCADA systems, IT/OT integration, digital twins and artificial intelligence.
      </p>

      <p>
        The purpose is to document real experiments, technical decisions and the evolution
        of automation laboratories over time.
      </p>

      <div class="about-view__stack">
        <span>PLC</span>
        <span>SCADA</span>
        <span>OPC UA</span>
        <span>Node-RED</span>
        <span>JavaScript</span>
        <span>AI</span>
      </div>

      <footer class="about-view__footer">
        <span>${site.author}</span>
        <span>${site.subtitle}</span>
      </footer>
    </div>
  `;

  return section;
}
