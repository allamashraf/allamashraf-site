// "Lead Field" draft: scorer UI. Works on every device and without the canvas.
// Privacy: no <form>, no network, no storage; the message never leaves this page.
import { nextRep, scoreLead, type LeadLabel } from '../lib/lead-score';
import type { LeadField } from './lead-field-canvas';

const root = document.querySelector<HTMLElement>('[data-lf]');
if (root) init(root);

function init(root: HTMLElement) {
  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const input = $<HTMLInputElement>('[data-lf-message]');
  const budget = $<HTMLInputElement>('[data-lf-budget]');
  const phone = $<HTMLInputElement>('[data-lf-phone]');
  const route = $<HTMLButtonElement>('[data-lf-route]');
  const scoreEl = $<HTMLElement>('[data-lf-score]');
  const labelEl = $<HTMLElement>('[data-lf-label]');
  const bar = $<HTMLElement>('[data-lf-bar]');
  const result = $<HTMLElement>('[data-lf-result]');
  const live = $<HTMLElement>('[data-lf-live]');
  const stage = $<HTMLElement>('[data-lf-stage]');
  const canvas = $<HTMLCanvasElement>('[data-lf-canvas]');
  if (!input || !budget || !phone || !route || !scoreEl || !labelEl || !bar || !result || !live || !stage) return;

  // Progressive enhancement: show the interactive scorer, hide the no-JS worked example.
  root.querySelectorAll<HTMLElement>('[data-lf-js]').forEach((el) => (el.hidden = false));
  root.querySelectorAll<HTMLElement>('[data-lf-nojs]').forEach((el) => (el.hidden = true));

  const copy = JSON.parse(root.dataset['lfCopy'] ?? '{}') as {
    applied: string;
    notApplied: string;
    routedTo: string;
    followUp: string[];
  };

  let routed = 0;
  let field: LeadField | null = null;
  let announceTimer = 0;

  const compute = () => scoreLead(input.value, budget.checked, phone.checked);

  const render = (announce: boolean) => {
    const r = compute();
    scoreEl.textContent = String(r.score);
    labelEl.textContent = r.label.toUpperCase();
    labelEl.dataset['label'] = r.label;
    bar.style.transform = `scaleX(${r.score / 100})`;
    const fired = new Set(r.fired.map((f) => f.id));
    root.querySelectorAll<HTMLElement>('[data-rule]').forEach((li) => {
      const on = fired.has(li.dataset['rule'] as never);
      li.classList.toggle('is-fired', on);
      const sr = li.querySelector('[data-rule-state]');
      if (sr) sr.textContent = on ? copy.applied : copy.notApplied;
    });
    if (announce) {
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(() => {
        live.textContent = `Score ${r.score} of 100, ${r.label}.`;
      }, 800);
    }
    return r;
  };

  const highlight = (lane: LeadLabel) => {
    stage.dataset['hit'] = lane;
  };

  const doRoute = () => {
    const r = render(false);
    const rep = nextRep(routed++);
    const followUp = copy.followUp[r.followUpDays - 1] ?? '';
    result.textContent = `${copy.routedTo} ${rep} · ${r.label} · ${followUp}`;
    window.clearTimeout(announceTimer);
    live.textContent = `Score ${r.score} of 100, ${r.label}. ${copy.routedTo} ${rep}, ${followUp}.`;
    highlight(r.label);
    field?.launch(r.label);
  };

  input.addEventListener('input', () => render(true));
  budget.addEventListener('change', () => render(true));
  phone.addEventListener('change', () => render(true));
  route.addEventListener('click', doRoute);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doRoute();
    }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-lf-example]').forEach((b) =>
    b.addEventListener('click', () => {
      input.value = b.dataset['lfExample'] ?? '';
      render(true);
      input.focus();
    }),
  );
  render(false);

  // Canvas layer: desktop, no reduced motion, no Save-Data; after load, when idle.
  const desktop = window.matchMedia('(min-width: 1024px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  if (!canvas || saveData) return;

  const css = getComputedStyle(document.documentElement);
  const colors = {
    accent: css.getPropertyValue('--accent').trim() || '#c8ff4d',
    text: css.getPropertyValue('--text').trim() || '#f2efe7',
    muted: css.getPropertyValue('--muted').trim() || '#8b9199',
  };

  const sync = () => {
    const want = desktop.matches && !reduced.matches;
    if (want && !field) {
      import('./lead-field-canvas')
        .then((m) => {
          if (!desktop.matches || reduced.matches || field) return;
          field = m.startLeadField(canvas, colors);
          stage.classList.add('is-live');
        })
        .catch(() => {
          /* static diagram stays */
        });
    } else if (!want && field) {
      field.destroy();
      field = null;
      stage.classList.remove('is-live');
    }
  };

  const whenIdle = (fn: () => void) => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 300);
  };
  const boot = () => whenIdle(sync);
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot, { once: true });
  desktop.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
}
