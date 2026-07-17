import { site } from "./data/site.js";
import { labs } from "./data/labs.js";
import { notebook } from "./data/notebook.js";

import { createNavbar } from "./components/navbar.js";
import { createLabCard } from "./components/labCard.js";
import { createLabViewer } from "./components/labViewer.js";
import { createNotebookCard } from "./components/notebookCard.js";
import { createAbout } from "./components/about.js";

const app = document.querySelector("#app");

if (!app) {
  throw new Error('Digital2Real could not start because "#app" was not found.');
}

const validViews = new Set(site.navigation.map(item => item.view));

let currentView = getInitialView();
let activeViewer = null;
let revealObserver = null;

function getInitialView() {
  const requestedView = window.location.hash.replace("#", "");
  return validViews.has(requestedView) ? requestedView : "labs";
}

function render() {
  disconnectRevealObserver();
  closeLab();

  app.replaceChildren();

  app.appendChild(createNavbar(site, currentView, navigateTo));

  const main = document.createElement("main");
  main.className = "app-main";

  const viewRenderers = {
    labs: renderLabsView,
    notebook: renderNotebookView,
    about: () => createAbout(site)
  };

  const renderView = viewRenderers[currentView] ?? viewRenderers.labs;
  main.appendChild(renderView());

  app.appendChild(main);

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

function navigateTo(view) {
  if (!validViews.has(view)) {
    return;
  }

  if (currentView === view) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  currentView = view;
  window.location.hash = view;
  render();
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

  notebook.forEach(note => {
    list.appendChild(createNotebookCard(note));
  });

  return section;
}

function openLab(lab) {
  closeLab();

  activeViewer = createLabViewer(lab, closeLab);
  document.body.appendChild(activeViewer);
  document.body.classList.add("is-locked");

  const closeButton = activeViewer.querySelector(".lab-viewer__close");
  closeButton?.focus();
}

function closeLab() {
  if (!activeViewer) {
    return;
  }

  const video = activeViewer.querySelector("video");
  video?.pause();

  activeViewer.remove();
  activeViewer = null;
  document.body.classList.remove("is-locked");
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

window.addEventListener("hashchange", () => {
  const nextView = getInitialView();

  if (nextView !== currentView) {
    currentView = nextView;
    render();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLab();
  }
});

render();
