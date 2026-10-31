import { scoreLead } from '../lib/lead-score';
import { leadField } from '../content/drafts/lead-field';

export function initMobileExperience() {
  const demo = document.querySelector<HTMLElement>('[data-mobile-demo]');
  if (!demo) return;
  const message = demo.querySelector<HTMLTextAreaElement>('[data-mobile-message]')!;
  const budget = demo.querySelector<HTMLInputElement>('[data-mobile-budget]')!;
  const phone = demo.querySelector<HTMLInputElement>('[data-mobile-phone]')!;
  const result = demo.querySelector<HTMLElement>('[data-mobile-result]')!;
  demo.querySelector<HTMLElement>('.mobile-demo__write')!.hidden = false;
  const stations = [...document.querySelectorAll<HTMLElement>('[data-station]')];
  let stepTimers: ReturnType<typeof setTimeout>[] = [];
  const update = (text: string) => {
    const score = scoreLead(text, budget.checked, phone.checked);
    result.querySelector('[data-score]')!.textContent = String(score.score);
    result.querySelector('[data-route]')!.textContent = score.label;
    const rules = result.querySelector('ul')!;
    rules.replaceChildren(...score.fired.map(rule => {
      const row = document.createElement('li');
      row.dataset['rule'] = rule.id;
      const label = document.createElement('span');
      label.textContent = rule.label;
      const points = document.createElement('b');
      points.textContent = `${rule.points > 0 ? '+' : ''}${rule.points}`;
      row.append(label, points);
      return row;
    }));
    result.dataset['label'] = score.label.toLowerCase();
    demo.dataset['routed'] = score.label.toLowerCase();
    demo.querySelector<HTMLElement>('[data-mobile-message-preview]')!.textContent = text;
    stepTimers.forEach(clearTimeout);
    stations.forEach(s => s.classList.remove('is-mobile-active'));
    stepTimers = stations.map((station, index) => setTimeout(() => {
      stations.forEach(s => s.classList.toggle('is-mobile-active', s === station));
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : index * 280));
    // DOM results are immediate, including reduced motion and typing mode.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      result.animate([{ transform: 'translateY(3px)' }, { transform: 'none' }], { duration: 220 });
    }
  };
  const samples = [...demo.querySelectorAll<HTMLButtonElement>('[data-sample]')];
  samples.forEach(button => { button.disabled = false; });
  samples.forEach((button, index) => button.addEventListener('click', () => {
    samples.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    budget.checked = phone.checked = false;
    message.value = leadField.scorer.examples[index]!.text;
    update(message.value);
  }));
  demo.querySelector('[data-mobile-submit]')!.addEventListener('click', () => {
    samples.forEach(b => b.setAttribute('aria-pressed', 'false'));
    update(message.value);
  });

  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contact');
  const sticky = document.querySelector<HTMLElement>('[data-mobile-contact]');
  let pastHero = false;
  let atContact = false;
  if (hero && contact && sticky && 'IntersectionObserver' in window) {
    const sync = () => { sticky.hidden = !pastHero || atContact; };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        if (entry.target === contact) atContact = entry.isIntersecting;
      });
      sync();
    });
    observer.observe(hero);
    observer.observe(contact);
  }

  const mobile = matchMedia('(min-width: 340px) and (max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const covers = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{ transform: 'scale(.97)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 500 });
      covers.unobserve(entry.target);
    }));
    document.querySelectorAll('.mobile-schematic').forEach(cover => covers.observe(cover));
  }
  const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
  document.querySelectorAll<HTMLElement>('[data-mobile-particles]').forEach(scene => {
    const canvas = scene.querySelector<HTMLCanvasElement>('canvas')!;
    let context: CanvasRenderingContext2D | null;
    try { context = canvas.getContext('2d'); } catch { context = null; }
    if (!context) { scene.dataset['sceneState'] = 'fallback'; return; }
    const ctx = context;
    let raf = 0;
    let visible = false;
    let failed = false;
    let count = scene.dataset['mobileParticles'] === 'wave' ? 40 : 80;
    let last = 0;
    let slow = 0;
    let width = 0;
    let height = 0;
    let launched = 0;
    const colors = ['#c4ff00', '#ffd044', '#f2efe7'];
    const resize = () => {
      const box = scene.getBoundingClientRect();
      width = box.width; height = box.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const dot = (x: number, y: number, radius: number, color: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    };
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < 1000 / 30) return;
      last = now;
      const start = performance.now();
      ctx.clearRect(0, 0, width, height);
      const wave = scene.dataset['mobileParticles'] === 'wave';
      for (let i = 0; i < count; i++) {
        const t = (i / count + now / (wave ? 16000 : 8000)) % 1;
        const lane = i % 3;
        const spread = Math.sin(i * 117.4) * (wave ? 22 : 6);
        const x = wave ? t * width : (180 + (lane - 1) * 122 * Math.pow(Math.abs(t - .4) / .6, .8) + spread) / 360 * width;
        const y = wave ? (92 + Math.sin(t * Math.PI) * 112 + spread) / 260 * height : t * height * .91;
        const color = colors[wave ? 0 : lane]!;
        const radius = i % 7 === 0 ? 2.8 : .8;
        dot(x, y, radius * 3, color, .07);
        dot(x, y, radius * 1.7, color, .2);
        dot(x, y, radius, color, .9);
      }
      if (!wave && launched && now - launched < 1500) {
        const t = Math.min((now - launched) / 1500, 1);
        const lane = demo.dataset['routed'] === 'hot' ? 0 : demo.dataset['routed'] === 'warm' ? 1 : 2;
        const x = t < .4 ? 120 + 60 * (t / .4) : 180 + (lane - 1) * 122 * Math.pow((t - .4) / .6, .8);
        dot(x / 360 * width, t * height * .91, 11, colors[lane]!, .12);
        dot(x / 360 * width, t * height * .91, 5, colors[lane]!, 1);
        if (t > .38 && t < .55) {
          for (let spark = 0; spark < 10; spark++) {
            const angle = spark * Math.PI / 5;
            const distance = (t - .38) * 180;
            dot(width / 2 + Math.cos(angle) * distance, height * .37 + Math.sin(angle) * distance, 1.3, colors[lane]!, .8);
          }
        }
      }
      if (performance.now() - start > 20) {
        slow++;
        if (slow >= 3 && count > 25) { count = 24; slow = 0; }
        else if (slow >= 3) { failed = true; sync(); }
      } else slow = Math.max(0, slow - 1);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0;
      const allowed = mobile.matches && !reduced.matches && !connection?.saveData && !failed;
      const running = allowed && visible && !document.hidden;
      scene.dataset['sceneState'] = running ? 'running' : allowed ? 'paused' : 'fallback';
      if (running) { resize(); last = 0; raf = requestAnimationFrame(render); }
      else ctx.clearRect(0, 0, width, height);
    };
    if (!('IntersectionObserver' in window)) { scene.dataset['sceneState'] = 'fallback'; return; }
    const io = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; sync(); });
    io.observe(scene);
    const ro = new ResizeObserver(() => { if (raf) resize(); }); ro.observe(scene);
    document.addEventListener('visibilitychange', sync);
    mobile.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    connection?.addEventListener?.('change', sync);
    demo.querySelectorAll('[data-sample], [data-mobile-submit]').forEach(button => button.addEventListener('click', () => { launched = performance.now(); }));
    window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); }, { once: true });
    sync();
  });
}
