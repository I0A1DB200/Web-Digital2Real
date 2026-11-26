const segment = value => encodeURIComponent(value);
const lab = Object.freeze({ view: 'experience-lab' });

// Only navigation is represented here. Player decisions and evidence never enter the URL.
export function parseRoute(hash = '') {
  let parts;
  try { parts = hash.replace(/^#/, '').split('/').map(decodeURIComponent); }
  catch { return { view: 'engineering-notes' }; }
  const [view, env, environmentId, mode, id] = parts;
  if (['engineering-notes', 'about'].includes(view) && parts.length === 1) return { view };
  if (view !== 'experience-lab') return { view: 'engineering-notes' };
  if (parts.length === 1) return { ...lab };
  if (env !== 'env' || !environmentId || !/^[\w-]+$/u.test(environmentId)) return { ...lab };
  const parent = { ...lab, environmentId };
  if (parts.length === 3) return parent;
  if (parts.length !== 5 || !id || !/^[\w-]+$/u.test(id)) return { ...lab };
  if (mode === 'preview') return { ...parent, previewId: id };
  if (mode === 'experience') return { ...parent, experienceId: id };
  if (mode === 'theory' && /^[1-9]\d*$/u.test(id)) return { ...parent, theorySectionIndex: Number(id) - 1 };
  return { ...lab };
}

export function formatRoute(route) {
  if (route.view !== 'experience-lab') return `#${route.view === 'about' ? 'about' : 'engineering-notes'}`;
  let hash = '#experience-lab';
  if (!route.environmentId) return hash;
  hash += `/env/${segment(route.environmentId)}`;
  if (route.experienceId) return `${hash}/experience/${segment(route.experienceId)}`;
  if (route.previewId) return `${hash}/preview/${segment(route.previewId)}`;
  if (Number.isInteger(route.theorySectionIndex)) return `${hash}/theory/${route.theorySectionIndex + 1}`;
  return hash;
}

export function parentRoute(route) {
  if (route.experienceId) return { view: 'experience-lab', environmentId: route.environmentId, previewId: route.experienceId };
  if (route.previewId || Number.isInteger(route.theorySectionIndex)) return { view: 'experience-lab', environmentId: route.environmentId };
  return { view: 'experience-lab' };
}
