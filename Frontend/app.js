import { getSite } from "./data/site.js";
import { createLocalePreference } from "./data/locale.js";
import { createLanguageSelector } from "./components/languageSelector.js";
import { getNotebook } from "./generated/notebooks/notebook.js";

import { createNavbar, updateNavigationLabel } from "./components/navbar.js";
import { createNotebookCarousel } from "./products/notebook/components/notebookCarousel.js";
import { createNotebookMotorHero } from "./products/notebook/components/notebookMotorHero.js";
import { createArticleViewer } from "./components/articleViewer.js";
import { createSimulatorCatalog } from "./components/simulatorCatalog.js";
import { createSimulatorViewer } from "./components/simulatorViewer.js";
import { createAbout } from "./components/about.js";
import { applyCharacterReveal } from "./components/heroTextReveal.js";
import { createExperienceWorkspace } from "./products/experience-engine/components/experienceWorkspace.js";

import { parseRoute, formatRoute, parentRoute } from "./navigation/labRoutes.js";
import { scrollToContent } from "./components/scrollToContent.js";

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
let activeSimulatorCatalog = null;
let activeSimulatorViewer = null;
let activeSimulatorId = null;
let activeExperienceWorkspace = null;
let activeNavbar = null;
let activeNotebookMotorHero = null;
let experienceLabPage = null;
let experienceLabReady = null;
let routeRevision = 0;
let requestedHash = null;
let routing = false;
let routeHasRendered = false;
let activeRoute = parseRoute(window.location.hash);
let revealObserver = null;

function focusSelector() {
  const target = document.activeElement;
  if (target?.dataset?.experienceId) return `.environment-hotspot[data-experience-id="${target.dataset.experienceId}"]`;
  if (target?.dataset?.environmentId) return `.environment-card__main[data-environment-id="${target.dataset.environmentId}"]`;
  if (target?.matches?.('.experience-workspace h2')) return target.closest('.experience-result') ? '.experience-result h2' : '.experience-workspace h2';
  if (target?.id) return `#${CSS.escape(target.id)}`;
  return null;
}

function saveNavigationPosition() {
  if (routing) return;
  window.history.replaceState({ ...window.history.state, d2r: {
    ...window.history.state?.d2r, hash: window.location.hash,
    scrollY: window.scrollY, focus: focusSelector()
  } }, "");
}

function navigateTo(view) {
  if (!validViews.has(view)) return;
  if (view === currentView && formatRoute({ view }) === window.location.hash) {
    scrollToContent(app.querySelector('main h1'), { focus: true });
    return;
  }
  return navigateRoute({ view });
}

function navigateRoute(route) {
  const hash = formatRoute(route);
  if (hash === window.location.hash) return;
  saveNavigationPosition();
  if (hash === formatRoute(parentRoute(activeRoute)) && window.history.state?.d2r?.previousHash === hash) {
    window.history.back();
    return;
  }
  const previousHash = window.location.hash;
  const preserve = route.environmentId && route.environmentId === activeRoute.environmentId
    && !route.experienceId && !activeRoute.experienceId;
  window.history.pushState({ d2r: { hash, previousHash,
    scrollY: preserve ? window.scrollY : null } }, "", hash);
  return renderRoute();
}

async function renderRoute() {
  if (requestedHash === window.location.hash) return;
  requestedHash = window.location.hash;
  const revision = ++routeRevision;
  const position = !routeHasRendered && parseRoute(window.location.hash).experienceId
    ? null : window.history.state?.d2r;
  routing = true;
  let route = parseRoute(window.location.hash);
  renderView(route.view);
  if (route.view === 'experience-lab') {
    await experienceLabReady;
    if (revision !== routeRevision) return;
    try {
      route = await activeExperienceWorkspace.restoreRoute(route);
    } catch {
      if (revision !== routeRevision) return;
      activeRoute = route;
      routing = false;
      scrollToContent(activeExperienceWorkspace.element.querySelector('[role="alert"] h2'), { focus: true });
      return;
    }
    if (revision !== routeRevision) return;
  }
  activeRoute = route;
  routeHasRendered = true;
  const hash = formatRoute(route);
  if (hash !== window.location.hash) window.history.replaceState({ ...window.history.state,
    d2r: { ...position, hash } }, "", hash);
  requestedHash = hash;
  const target = route.previewId
    ? app.querySelector('.environment-popover button')
    : route.view === 'experience-lab' ? activeExperienceWorkspace.element.querySelector('h1, h2')
      : app.querySelector('main h1, main h2');
  if (Number.isFinite(position?.scrollY)) {
    if (Math.abs(window.scrollY - position.scrollY) > 1) {
      window.scrollTo({ top: position.scrollY, left: 0, behavior: 'auto' });
    }
  } else if (!route.previewId) {
    const content = route.view === 'experience-lab'
      ? activeExperienceWorkspace.element.querySelector('h1, h2') : app.querySelector('main');
    scrollToContent(content, { behavior: 'auto' });
  }
  let previousFocus = null;
  try { previousFocus = position?.focus ? app.querySelector(position.focus) : null; } catch { /* stale focus key */ }
  const focus = previousFocus ?? target;
  if (focus && !focus.matches('button, a[href], input, [tabindex]')) focus.setAttribute('tabindex', '-1');
  focus?.focus({ preventScroll: true });
  routing = false;
  saveNavigationPosition();
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
  closeSimulatorViewer();

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
      <button class="editorial-hero__arrow" type="button" aria-label="${site.home.notebookLabel}">
        <svg viewBox="0 0 100 120" aria-hidden="true" focusable="false">
          <path d="M12 10 C80 10 82 48 66 100 M48 78 L66 101 L88 83" />
        </svg>
      </button>
    </header>

    <section class="notes-section" aria-labelledby="notes-title">
      <header class="section-introduction reveal">
        <div>
          <h2 id="notes-title">${site.engineeringNotes.title}</h2>
        </div>
      </header>
      <div class="notebook-notes-composition">
        <div class="notebook-motor-host"></div>
        <div class="notebook-carousel-host"></div>
      </div>
    </section>

  `;

  const heroHeading = section.querySelector(".editorial-hero h1");
  if (heroHeading instanceof HTMLElement) applyCharacterReveal(heroHeading, { stagger: 32, duration: 480 });
  section.querySelector('.editorial-hero__arrow').addEventListener('click', () => {
    scrollToContent(section.querySelector('#notes-title'), { focus: true });
  });

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
  if (experienceLabPage) return experienceLabPage;
  const page = document.createElement("div");
  page.className = "experience-lab-view";
  activeSimulatorCatalog = createSimulatorCatalog(site.simulators, openSimulator);
  const simulatorCatalog = activeSimulatorCatalog.element;
  const workspace = createExperienceWorkspace({
    localePreference,
    onNavigate: navigateRoute,
    onExperienceChange: experienceId => { simulatorCatalog.hidden = Boolean(experienceId); }
  });
  activeExperienceWorkspace = workspace;
  page.append(simulatorCatalog, workspace.element);
  experienceLabPage = page;
  experienceLabReady = workspace.initialise();
  return page;
}

function openSimulator(simulator, returnFocusTo) {
  closeSimulatorViewer();
  activeSimulatorId = simulator.id;
  activeSimulatorViewer = createSimulatorViewer(simulator, closeSimulatorViewer, returnFocusTo);
  activeSimulatorViewer.activate();
}

function closeSimulatorViewer() {
  const viewer = activeSimulatorViewer;
  if (!viewer) return;
  activeSimulatorViewer = null;
  activeSimulatorId = null;
  viewer.destroy();
}

export async function openExperience(experienceId) {
  if (typeof experienceId !== "string" || !experienceId.trim()) throw new Error("openExperience requires a non-empty experience identifier.");
  if (!activeExperienceWorkspace) await navigateRoute({ view: "experience-lab" });
  await experienceLabReady;
  await navigateRoute(activeExperienceWorkspace.experienceRoute(experienceId));
  return activeExperienceWorkspace.getState();
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

localePreference.subscribe((locale, pending) => {
  if (pending || locale === renderedLocale) return;
  renderedLocale = locale;
  site = getSite(locale);
  notebook = getNotebook(locale);
  document.documentElement.lang = locale;
  activeSimulatorCatalog?.update(site.simulators);
  const activeSimulator = site.simulators.find(simulator => simulator.id === activeSimulatorId);
  if (activeSimulator) activeSimulatorViewer?.update(activeSimulator);
  activeNotebookCarousel?.updateArticles(notebook);
  if (activeArticleViewer) activeArticleViewer.updateArticle(notebook.find(article => article.id === activeArticleViewer.getArticleId()));
  const textUpdates = {
    ".editorial-hero h1": site.home.title,
    "#notes-title": site.engineeringNotes.title
  };
  if (currentView === "engineering-notes") for (const [selector, text] of Object.entries(textUpdates)) {
    const element = app.querySelector(selector);
    if (element) {
      element.textContent = text;
      if (selector === ".editorial-hero h1") applyCharacterReveal(element, { stagger: 32, duration: 480 });
    }
  }
  app.querySelector('.editorial-hero__arrow')?.setAttribute('aria-label', site.home.notebookLabel);
  updateNavigationLanguage();
  document.title = getDocumentTitle();
});

function updateNavigationLanguage() {
  for (const item of site.navigation) {
    const link = activeNavbar?.querySelector(`.topbar__link[data-view="${item.view}"]`);
    if (link) updateNavigationLabel(link, item.label);
  }
  const es = localePreference.getLocale() === "es";
  activeNavbar?.querySelector(".brand")?.setAttribute("aria-label", es ? "Ir a notas de ingenier\u00eda" : "Go to Engineering Notes");
  activeNavbar?.querySelector(".topbar__menu-toggle")?.setAttribute("aria-label", es ? "Abrir o cerrar navegaci\u00f3n principal" : "Toggle main navigation");
  activeNavbar?.querySelector(".topbar__nav")?.setAttribute("aria-label", es ? "Navegaci\u00f3n principal" : "Main navigation");
}

window.history.scrollRestoration = 'manual';
window.addEventListener("hashchange", renderRoute);
window.addEventListener("popstate", renderRoute);
window.addEventListener("scroll", saveNavigationPosition, { passive: true });
window.addEventListener("focusin", saveNavigationPosition);
window.addEventListener("pagehide", event => { if (!event.persisted) activeExperienceWorkspace?.destroy(); });
window.openExperience = openExperience;
renderRoute();
