// Signal Path signature scene (master plan §8.2). Desktop only, lazy-loaded by the loader in
// SignalPath.astro. Animates only transform and opacity (both on the §8.1 allow-list).
// Everything here is reverted by gsap.matchMedia when the conditions stop matching, which
// returns the section to its complete static diagram.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Progress (0–1 of the pinned scroll) at which the light reaches each station.
const AT = [0.05, 0.25, 0.45, 0.65, 0.85] as const;
const TRAVEL = AT[4] - AT[0];

export function initSignalPath(section: HTMLElement): void {
  const q = <T extends Element>(sel: string) => [...section.querySelectorAll<T>(sel)];
  const stations = q<HTMLElement>('[data-station]');
  const lits = q<HTMLElement>('[data-station-lit]');
  const wireHot = section.querySelector<HTMLElement>('[data-signal-wire-hot]');
  const dot = section.querySelector<HTMLElement>('[data-signal-dot]');
  const drop = section.querySelector<HTMLElement>('[data-signal-drop]');
  const gateItems = q<HTMLElement>('.gate li');
  const lanes = q<SVGPathElement>('.lane');
  const laneLabels = q<HTMLElement>('.lane-label');
  const note = section.querySelector<HTMLElement>('.station__note');
  const cards = [...document.querySelectorAll<HTMLElement>('#work [data-case]')];
  if (stations.length !== 5 || !wireHot || !dot || !drop) return;

  // Distance from the CLICK node to the RESPOND node, measured live (re-read on refresh).
  const span = () => (stations[4]?.offsetLeft ?? 0) - (stations[0]?.offsetLeft ?? 0);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-scene');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=160%',
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    // 0%: the dot drops onto the start of the path.
    tl.fromTo(dot, { x: () => -span(), y: -80, opacity: 0 }, { x: () => -span(), y: 0, opacity: 1, duration: AT[0] }, 0);

    // The line draws and the dot travels from CLICK to RESPOND (through lane 2 at ROUTE).
    tl.fromTo(wireHot, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: TRAVEL }, AT[0]);
    tl.to(dot, { x: 0, ease: 'none', duration: TRAVEL }, AT[0]);

    // Each node lights as the light reaches it; its label, then sentence, rise 12px into place.
    stations.forEach((station, i) => {
      const at = AT[i] ?? 0;
      const lit = lits[i];
      if (lit) tl.fromTo(lit, { opacity: 0 }, { opacity: 1, duration: 0.03 }, at);
      const label = station.querySelector('.station__label');
      const sentence = station.querySelector('.station__sentence');
      if (label) tl.fromTo(label, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.06 }, at);
      if (sentence) tl.fromTo(sentence, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08 }, at + 0.02);
    });

    // QUALIFY: the gate's three checks tick in turn.
    gateItems.forEach((item, i) => {
      tl.fromTo(item, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.04 }, AT[2] + 0.04 + i * 0.04);
    });

    // ROUTE: the two idle lanes split off; the light keeps lane 2. (Opacity, not dash offset:
    // the lanes use non-scaling strokes, which make dash lengths unreliable across browsers.)
    tl.fromTo(lanes, { opacity: 0 }, { opacity: 1, duration: 0.06 }, AT[3]);
    tl.fromTo(laneLabels, { opacity: 0 }, { opacity: 1, duration: 0.04, stagger: 0.02 }, AT[3] + 0.04);
    if (note) tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.05 }, AT[3] + 0.08);

    // RESPOND: the line continues down toward the work, then the pin releases.
    tl.fromTo(drop, { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 1 - AT[4] }, AT[4]);

    // Selected Work cards rise on their branches, 80ms apart.
    const firstCard = cards[0];
    if (firstCard) {
      gsap.fromTo(
        cards,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: firstCard, start: 'top 85%', once: true },
        },
      );
    }

    return () => {
      section.classList.remove('is-scene');
    };
  });

  // Fonts can change line heights after load: re-measure once they are ready.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Pause everything while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) gsap.globalTimeline.pause();
    else gsap.globalTimeline.resume();
  });
}
