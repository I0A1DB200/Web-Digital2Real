export function createAbout(site) {
  const about = site?.about;

  if (!about || !Array.isArray(about.introduction) || !Array.isArray(about.blocks)) {
    throw new TypeError("About requires structured site content.");
  }

  const section = document.createElement("section");
  section.className = "about-view reveal";

  section.innerHTML = `
    <div class="about-view__content">
      <header class="about-view__header">
        <span class="section-kicker">${about.eyebrow}</span>
        <h1>${about.title}</h1>
        <div class="about-view__copy">
          ${about.introduction.map(paragraph => `<p>${paragraph}</p>`).join("")}
        </div>
      </header>

      <div class="about-view__blocks">
        ${about.blocks.map((block, index) => `
          <section class="about-block" aria-labelledby="about-block-${index}">
            <div>
              <h2 id="about-block-${index}">${block.title}</h2>
              ${block.paragraphs.map(paragraph => `<p>${paragraph.replaceAll("\n", "<br>")}</p>`).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </div>
  `;

  return section;
}
