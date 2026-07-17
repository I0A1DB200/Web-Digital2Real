import { site } from "./data/site.js";
import { labs } from "./data/labs.js";
import { notebook } from "./data/notebook.js";

import { createNavbar } from "./components/navbar.js";
import { createLabCard } from "./components/labCard.js";
import { createLabViewer } from "./components/labViewer.js";
import { createNotebookCard } from "./components/notebookCard.js";
import { createAbout } from "./components/about.js";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error('Digital2Real could not start because "#app" was not found.');
}

if (!Array.isArray(site.navigation) || site.navigation.length === 0) {
  throw new Error("Digital2Real could not start because site navigation is invalid.");
}

if (!Array.isArray(labs) || !Array.isArray(notebook)) {
  throw new Error("Digital2Real could not start because application data is invalid.");
}

const validViews = new Set(
  site.navigation
    .map(item => item?.view)
    .filter(view => typeof view === "string" && view.length > 0)
);

if (!validViews.has("labs")) {
  throw new Error('Digital2Real could not start because the required "labs" view is missing.');
}

let currentView = null;
let activeViewer = null;
let revealObserver = null;

function getRequestedView() {
  let requestedView = window.location.hash.slice(1);

  try {
    requestedView = decodeURIComponent(requestedView);
  } catch {
    return "labs";
  }

  return validViews.has(requestedView) ? requestedView : "labs";
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
  closeLab();

  const main = document.createElement("main");
  main.className = "app-main";

  const viewRenderers = {
    labs: renderLabsView,
    notebook: renderNotebookView,
    about: () => createAbout(site)
  };

  const renderCurrentView = viewRenderers[view] ?? viewRenderers.labs;
  currentView = view;

  main.appendChild(renderCurrentView());
  app.replaceChildren(createNavbar(site, currentView, navigateTo), main);

  document.title = getDocumentTitle();
  initialiseRevealAnimations();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function getDocumentTitle() {
  const currentItem = site.navigation.find(item => item.view === currentView);

  if (!currentItem || currentView === "labs") {
    return `${site.name} | ${site.subtitle}`;
  }

  return `${currentItem.label} | ${site.name}`;
}

function renderLabsView() {
  const section = document.createElement("section");
  section.className = "labs-view";
  section.setAttribute("aria-labelledby", "labs-title");

  section.innerHTML = `
    <header class="page-header reveal">
      <div>
        <span class="section-kicker">${site.name}</span>
        <h1 id="labs-title">${site.subtitle}</h1>
      </div>

      <p>${site.description}</p>
    </header>

    <div class="labs-grid" aria-label="Laboratories"></div>
  `;

  const grid = section.querySelector(".labs-grid");

  if (!(grid instanceof HTMLElement)) {
    throw new Error("Digital2Real could not render the laboratories grid.");
  }

  labs.forEach(lab => {
    grid.appendChild(createLabCard(lab, openLab));
  });

  return section;
}

function renderNotebookView() {
  const section = document.createElement("section");
  section.className = "notebook-view";
  section.setAttribute("aria-labelledby", "notebook-title");

  section.innerHTML = `
    <header class="page-header reveal">
      <div>
        <span class="section-kicker">Notebook</span>
        <h1 id="notebook-title">Engineering notes.</h1>
      </div>

      <p>
        Notes about automation, industrial interfaces, software experiments
        and the technical decisions behind Digital2Real.
      </p>
    </header>

    <div class="notebook-list"></div>
  `;

  const list = section.querySelector(".notebook-list");

  if (!(list instanceof HTMLElement)) {
    throw new Error("Digital2Real could not render the notebook list.");
  }

  notebook.forEach(note => {
    list.appendChild(createNotebookCard(note));
  });

  return section;
}

function openLab(lab, opener) {
  closeLab();

  const viewer = createLabViewer(lab, closeLab, opener);
  activeViewer = viewer;
  document.body.appendChild(viewer.element);
  viewer.activate();
}

function closeLab() {
  if (!activeViewer) {
    return;
  }

  const viewer = activeViewer;
  activeViewer = null;
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
