import { getSite } from "./data/site.js";
import { createLocalePreference } from "./data/locale.js";
import { createLanguageSelector } from "./components/languageSelector.js";
import { getNotebook } from "./generated/notebooks/notebook.js";

import { createNavbar } from "./components/navbar.js";
import { createNotebookCarousel } from "./products/notebook/components/notebookCarousel.js";
import { createNotebookMotorHero } from "./products/notebook/components/notebookMotorHero.js";
import { createArticleViewer } from "./components/articleViewer.js";
import { createAbout } from "./components/about.js";
import { applyCharacterReveal, getCharacterRevealDuration } from "./components/heroTextReveal.js";
import { createExperienceWorkspace } from "./products/experience-engine/components/experienceWorkspace.js";

const app = document.querySelector("#app");
const localePreference = createLocalePreference();
const languageControl = createLanguageSelector(localePreference);
let site = getSite(localePreference.getLocale());
let notebook = getNotebook(localePreference.getLocale());
let activeNotebookCarousel = null;
let renderedLocale = localePreference.getLocale();
document.documentElement.lang = renderedLocale;

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
let activeExperienceWorkspace = null;
let activeNavbar = null;
let activeNotebookMotorHero = null;
let pendingExperienceId = null;
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
  activeNotebookMotorHero?.destroy();
  activeNotebookMotorHero = null;
  activeNotebookCarousel = null;
  closeArticle();
  closeExperienceWorkspace();

  const main = document.createElement("main");
  main.className = "app-main";

  const viewRenderers = {
    "engineering-notes": renderEngineeringNotesView,
    "experience-lab": renderExperienceLabView,
    about: () => { const about = createAbout(site); about.lang = "en"; return about; }
  };

  const renderCurrentView = viewRenderers[view] ?? viewRenderers["engineering-notes"];
  currentView = view;

  main.appendChild(renderCurrentView());
  activeNavbar?.destroy?.();
  activeNavbar = createNavbar(site, currentView, navigateTo, { languageControl: languageControl.element });
  app.replaceChildren(activeNavbar, main);
  updateNavigationLanguage();
  activeNotebookMotorHero?.initialise(main.querySelector(".notes-section"));

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
      <div class="notebook-notes-composition">
        <div class="notebook-motor-host"></div>
        <div class="notebook-carousel-host"></div>
      </div>
    </section>

  `;

  const heroHeading = section.querySelector(".editorial-hero h1");
  const heroParagraph = section.querySelector(".editorial-hero__support p");
  if (heroHeading instanceof HTMLElement && heroParagraph instanceof HTMLElement) {
    const headingCharacterCount = applyCharacterReveal(heroHeading, {
      stagger: 32,
      duration: 480
    });
    const paragraphStartDelay = Math.round(
      getCharacterRevealDuration(headingCharacterCount, 32, 480) * 0.6
    );
    applyCharacterReveal(heroParagraph, {
      stagger: 16,
      duration: 380,
      startDelay: paragraphStartDelay
    });
  }

  const carouselHost = section.querySelector(".notebook-carousel-host");
  const motorHost = section.querySelector(".notebook-motor-host");

  if (!(carouselHost instanceof HTMLElement) || !(motorHost instanceof HTMLElement)) {
    throw new Error("Digital2Real could not render the Engineering Notes composition.");
  }

  activeNotebookCarousel = createNotebookCarousel(notebook, openArticle);
  carouselHost.appendChild(activeNotebookCarousel.element);
  activeNotebookMotorHero = createNotebookMotorHero();
  motorHost.appendChild(activeNotebookMotorHero.element);

  return section;
}

function renderExperienceLabView() {
  const workspace = createExperienceWorkspace({ localePreference });
  activeExperienceWorkspace = workspace;
  workspace.initialise().then(async () => {
    if (!pendingExperienceId || activeExperienceWorkspace !== workspace) return;
    const experienceId = pendingExperienceId;
    pendingExperienceId = null;
    try {
      await workspace.openExperience(experienceId);
    } catch {
      // The Workspace renders its own accessible loading error.
    }
  });
  return workspace.element;
}

export async function openExperience(experienceId) {
  if (typeof experienceId !== "string" || !experienceId.trim()) {
    throw new Error("openExperience requires a non-empty experience identifier.");
  }

  if (currentView !== "experience-lab" || !activeExperienceWorkspace) {
    pendingExperienceId = experienceId;
    navigateTo("experience-lab");
    return null;
  }

  return activeExperienceWorkspace.openExperience(experienceId);
}

function closeExperienceWorkspace() {
  activeExperienceWorkspace?.destroy();
  activeExperienceWorkspace = null;
}

function openArticle(article, opener) {
  closeArticle();

  const viewer = createArticleViewer(article, closeArticle, opener, { languageControl: languageControl.element });
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
  if (document.activeElement === document.body) {
    activeNotebookCarousel?.element.querySelector('[aria-current="true"]')?.focus();
  }
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

localePreference.subscribe((locale, pending) => {
  if (pending || locale === renderedLocale) return;
  renderedLocale = locale;
  site = getSite(locale);
  notebook = getNotebook(locale);
  document.documentElement.lang = locale;
  activeNotebookCarousel?.updateArticles(notebook);
  if (activeArticleViewer) activeArticleViewer.updateArticle(notebook.find(article => article.id === activeArticleViewer.getArticleId()));
  const textUpdates = {
    ".editorial-hero h1": site.home.title,
    ".editorial-hero__support p": site.home.introduction,
    "#notes-title": site.engineeringNotes.title,
    ".section-introduction p": site.engineeringNotes.introduction
  };
  if (currentView === "engineering-notes") for (const [selector, text] of Object.entries(textUpdates)) {
    const element = app.querySelector(selector);
    if (element) element.textContent = text;
  }
  updateNavigationLanguage();
  document.title = getDocumentTitle();
});

function updateNavigationLanguage() {
  for (const item of site.navigation) {
    const link = activeNavbar?.querySelector(`.topbar__link[data-view="${item.view}"]`);
    if (link) link.textContent = item.label;
  }
  const es = localePreference.getLocale() === "es";
  activeNavbar?.querySelector(".brand")?.setAttribute("aria-label", es ? "Ir a notas de ingenier\u00eda" : "Go to Engineering Notes");
  activeNavbar?.querySelector(".topbar__menu-toggle")?.setAttribute("aria-label", es ? "Abrir o cerrar navegaci\u00f3n principal" : "Toggle main navigation");
  activeNavbar?.querySelector(".topbar__nav")?.setAttribute("aria-label", es ? "Navegaci\u00f3n principal" : "Main navigation");
}

window.addEventListener("hashchange", handleHashChange);
window.openExperience = openExperience;
renderView(getRequestedView());
