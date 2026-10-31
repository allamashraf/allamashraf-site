// Loaded after fonts and a painted frame. All content and navigation already work.
const header = document.querySelector<HTMLElement>('[data-site-header]');
const sentinel = document.querySelector<HTMLElement>('[data-header-sentinel]');
if (header && sentinel && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry?.isIntersecting);
  }).observe(sentinel);
}

if (document.querySelector('[data-copy-email]')) {
  import('./copy-email').catch(() => { /* The mailto link remains usable. */ });
}

const section = document.querySelector<HTMLElement>('[data-signal]');
const desktop = matchMedia('(min-width: 1024px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
let near = false;
let started = false;
const maybeStart = () => {
  if (started || !section || !near || !desktop.matches || reduced.matches) return;
  started = true;
  import('./signal-path-scene').then(m => m.initSignalPath(section)).catch(() => { /* Complete static diagram. */ });
};
if (section && section.dataset['motion'] === 'gsap' && !saveData && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      near = true;
      io.disconnect();
      maybeStart();
    }
  }, { rootMargin: '100% 0px' });
  io.observe(section);
  desktop.addEventListener('change', maybeStart);
  reduced.addEventListener('change', maybeStart);
}

if (document.querySelector('[data-mobile-demo]')) {
  const mobile = matchMedia('(max-width: 767px)');
  let loaded = false;
  const load = () => {
    if (!mobile.matches || loaded) return;
    loaded = true;
    import('./mobile-experience').then(m => m.initMobileExperience()).catch(() => { /* SSR result and SVG stay complete. */ });
  };
  load();
  mobile.addEventListener('change', load);
}
