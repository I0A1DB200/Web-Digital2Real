import { site } from "./data/site.js";
import { notebook } from "./data/notebook.js";

import { createNavbar } from "./components/navbar.js";
import { createNotebookCard } from "./components/notebookCard.js";
import { createArticleViewer } from "./components/articleViewer.js";
import { createAbout } from "./components/about.js";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error('Digital2Real could not start because "#app" was not found.');
}

if (!Array.isArray(site.navigation) || site.navigation.length === 0) {
  throw new Error("Digital2Real could not start because site navigation is invalid.");
}

if (!Array.isArray(notebook)) {
  throw new Error("Digital2Real could not start because application data is invalid.");
}

const validViews = new Set(
  site.navigation
    .map(item => item?.view)
    .filter(view => typeof view === "string" && view.length > 0)
);

if (!validViews.has("engineering-notes")) {
  throw new Error('Digital2Real could not start because the required "engineering-notes" view is missing.');
}

let currentView = null;
let activeArticleViewer = null;
let revealObserver = null;

function getRequestedView() {
  let requestedView = window.location.hash.slice(1);

  try {
    requestedView = decodeURIComponent(requestedView);
  } catch {
    return "engineering-notes";
  }

  return validViews.has(requestedView) ? requestedView : "engineering-notes";
}

function navigateTo(view) {
  if (typeof view !== "string" || !validViews.has(view)) {
    return;
  }

  if (currentView === view) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const nextHash = `#${view}`;

  if (window.location.hash === nextHash) {
    renderView(view);
    return;
  }

  window.location.hash = view;
}

function renderView(view) {
  if (view === currentView) {
    return;
  }

  disconnectRevealObserver();
  closeArticle();

  const main = document.createElement("main");
  main.className = "app-main";

  const viewRenderers = {
    "engineering-notes": renderEngineeringNotesView,
    academy: renderAcademyView,
    about: () => createAbout(site)
  };

  const renderCurrentView = viewRenderers[view] ?? viewRenderers["engineering-notes"];
  currentView = view;

  main.appendChild(renderCurrentView());
  app.replaceChildren(createNavbar(site, currentView, navigateTo), main);

  document.title = getDocumentTitle();
  initialiseRevealAnimations();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function getDocumentTitle() {
  const currentItem = site.navigation.find(item => item.view === currentView);

  if (!currentItem || currentView === "engineering-notes") {
    return site.seo.title;
  }

  return `${currentItem.label} | ${site.name}`;
}

function renderEngineeringNotesView() {
  const section = document.createElement("section");
  section.className = "engineering-view";
  section.setAttribute("aria-labelledby", "home-title");

  section.innerHTML = `
    <header class="editorial-hero reveal">
      <span class="section-kicker">${site.home.eyebrow}</span>
      <h1 id="home-title">${site.home.title}</h1>
      <div class="editorial-hero__support">
        <p>${site.home.introduction}</p>
      </div>
    </header>

    <section class="notes-section" aria-labelledby="notes-title">
      <header class="section-introduction reveal">
        <div>
          <h2 id="notes-title">${site.engineeringNotes.title}</h2>
          <p>${site.engineeringNotes.introduction}</p>
        </div>
      </header>
      <div class="notebook-list" aria-label="Engineering Notes"></div>
    </section>

  `;

  const list = section.querySelector(".notebook-list");

  if (!(list instanceof HTMLElement)) {
    throw new Error("Digital2Real could not render the Engineering Notes list.");
  }

  notebook.forEach(note => {
    list.appendChild(createNotebookCard(note, openArticle));
  });

  return section;
}

function renderAcademyView() {
  const section = document.createElement("section");
  section.className = "academy-view";
  section.setAttribute("aria-labelledby", "academy-title");

  section.innerHTML = `
    <header class="academy-hero reveal">
      <span class="section-kicker">${site.academy.eyebrow}</span>
      <h1 id="academy-title">${site.academy.title}</h1>
      <div class="academy-hero__copy">
        <p>${site.academy.introduction}</p>
        <p>${site.academy.objective}</p>
      </div>
    </header>

    <ul class="academy-principles reveal">
      ${site.academy.principles.map(principle => `
        <li>${principle}</li>
      `).join("")}
    </ul>

    <p class="academy-status reveal">${site.academy.status}</p>
  `;

  return section;
}

function openArticle(article, opener) {
  closeArticle();

  const viewer = createArticleViewer(article, closeArticle, opener);
  activeArticleViewer = viewer;
  document.body.appendChild(viewer.element);
  viewer.activate();
}

function closeArticle() {
  if (!activeArticleViewer) {
    return;
  }

  const viewer = activeArticleViewer;
  activeArticleViewer = null;
  viewer.destroy();
}

function initialiseRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(element => element.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver?.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -5% 0px"
    }
  );

  reveals.forEach(element => revealObserver.observe(element));
}

function disconnectRevealObserver() {
  revealObserver?.disconnect();
  revealObserver = null;
}

function handleHashChange() {
  renderView(getRequestedView());
}

window.addEventListener("hashchange", handleHashChange);
renderView(getRequestedView());
