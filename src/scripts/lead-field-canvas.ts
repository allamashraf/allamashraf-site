// "Lead Field" particle layer, v2 (Canvas 2D, desktop only, lazy-loaded after load).
// Purely decorative: the static SVG diagram and the scorer work without it.
// Geometry shares the SVG's 1000×500 coordinate space so particles follow the drawn lanes.
//
// Ambient loop: allowed for this scene only by Allam (22 Oct 2026) with guardrails:
// paused off-screen and in hidden tabs, devicePixelRatio capped at 2, never started under
// reduced motion or on mobile (the loader in lead-field-page.ts enforces the last two).
import type { LeadLabel } from '../lib/lead-score';

const GATE = { x0: 440, x1: 480, y0: 185, y1: 315 };
const END_X = 880;
const MID_Y = 250;
const LANE_Y: Record<LeadLabel, number> = { Hot: 110, Warm: 250, Cold: 390 };
const LANES: LeadLabel[] = ['Hot', 'Warm', 'Cold'];

/** Leads are released in batches, so the gate pulses as each wave passes. */
const WAVE_S = 1.5;
/** The visitor's lead always takes this long, whatever the frame rate. */
const VISITOR_MS = 2400;
/** Per-frame trail fade at 60fps (0 = no trail, 1 = full persistence). */
const TRAIL_KEEP = 0.72;
const PUSH_RADIUS = 130;
const PUSH_FORCE = 3.2;

interface Particle {
  t: number;
  prevT: number;
  speed: number;
  y0: number;
  j: number;
  lane: LeadLabel;
  ox: number;
  oy: number;
  size: number;
  wait: number;
}

interface Visitor {
  t: number;
  lane: LeadLabel;
  launchedAt: number;
  arrivedAt: number | null;
  trail: Array<[number, number]>;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const smooth = (x: number) => x * x * (3 - 2 * x);
const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

/** Position on the path in 1000×500 space; t in [0,1] (0–0.5 into the gate, 0.5–1 out to the lane). */
function pathPoint(t: number, y0: number, j: number, lane: LeadLabel): [number, number] {
  if (t < 0.5) {
    const p = t / 0.5;
    return [GATE.x0 * p, y0 + (MID_Y + j * 18 - y0) * smooth(p)];
  }
  const p = (t - 0.5) / 0.5;
  const ly = LANE_Y[lane] + j * 12;
  return [bez(GATE.x0, GATE.x1 + 120, 700, END_X, p), bez(MID_Y + j * 18, MID_Y + j * 6, ly, ly, p)];
}

function pickLane(): LeadLabel {
  const r = Math.random();
  return r < 0.25 ? 'Hot' : r < 0.65 ? 'Warm' : 'Cold';
}

function rgba(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(255,255,255,${a})`;
  return `rgba(${parseInt(m[1] ?? '0', 16)},${parseInt(m[2] ?? '0', 16)},${parseInt(m[3] ?? '0', 16)},${a})`;
}

/** Soft round glow with a bright core, pre-rendered once per colour. */
function glowSprite(hex: string): HTMLCanvasElement {
  const px = 64;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  if (g) {
    const r = px / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, rgba(hex, 1));
    grad.addColorStop(0.14, rgba(hex, 0.95));
    grad.addColorStop(0.32, rgba(hex, 0.28));
    grad.addColorStop(1, rgba(hex, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, px, px);
  }
  return c;
}

export interface LeadField {
  launch(lane: LeadLabel): void;
  destroy(): void;
}

export function startLeadField(canvas: HTMLCanvasElement, colors: { accent: string; text: string; muted: string }): LeadField {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { launch() {}, destroy() {} };

  const sprite = {
    neutral: glowSprite(colors.text),
    lime: glowSprite(colors.accent),
    grey: glowSprite(colors.muted),
  };

  let w = 0;
  let h = 0;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  // ~400 on a 1440px-wide desktop; fewer on narrower windows.
  const count = Math.round(Math.min(420, Math.max(240, w / 3.6)));
  const particles: Particle[] = Array.from({ length: count }, () => {
    // Start already spread out in loose waves so the field is full from the first frame.
    const t = (Math.floor(rand(0, 13)) * 0.077 + rand(0, 0.02)) % 1;
    return { t, prevT: t, speed: rand(0.044, 0.056), y0: rand(30, 470), j: rand(-1, 1), lane: pickLane(), ox: 0, oy: 0, size: rand(1, 3), wait: 0 };
  });
  const visitors: Visitor[] = [];
  const sparks: Spark[] = [];
  const laneGlow: Record<LeadLabel, number> = { Hot: 0, Warm: 0, Cold: 0 };
  let gatePulse = 0;
  let clock = 0;
  const pointer = { x: -9999, y: -9999 };

  const host = canvas.parentElement ?? canvas;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  };
  const onLeave = () => {
    pointer.x = pointer.y = -9999;
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  const draw = (img: HTMLCanvasElement, x: number, y: number, size: number, alpha: number) => {
    if (alpha <= 0.002) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  };

  const strokeLane = (lane: LeadLabel, kx: number, ky: number) => {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const [x, y] = pathPoint(0.5 + (i / 40) * 0.5, MID_Y, 0, lane);
      if (i === 0) ctx.moveTo(x * kx, y * ky);
      else ctx.lineTo(x * kx, y * ky);
    }
    ctx.stroke();
  };

  let running = false;
  let raf = 0;
  let last = performance.now();

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    const kx = w / 1000;
    const ky = h / 500;

    // 1) Fade the previous frame toward transparent: short trails that do not depend on fps.
    const fade = 1 - Math.pow(TRAIL_KEEP, dt * 60);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, w, h);

    // 2) Everything else adds light. Stationary glows are scaled by `fade` so they settle at
    //    their target brightness instead of accumulating frame after frame.
    ctx.globalCompositeOperation = 'lighter';

    // Gate: a soft pulse that rises as each wave of leads passes through.
    gatePulse *= Math.exp(-dt * 2.4);
    const gx = ((GATE.x0 + GATE.x1) / 2) * kx;
    const gy = MID_Y * ky;
    draw(sprite.neutral, gx, gy, (GATE.y1 - GATE.y0) * ky * 1.5, (0.02 + 0.42 * Math.min(1, gatePulse)) * fade * 1.4);

    // Streams brighten for about a second after the visitor's lead lands.
    for (const lane of LANES) {
      laneGlow[lane] = Math.max(0, laneGlow[lane] - dt);
      const g = laneGlow[lane];
      if (g <= 0) continue;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 10;
      ctx.globalAlpha = 0.22 * g * fade * 3;
      strokeLane(lane, kx, ky);
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9 * g;
      strokeLane(lane, kx, ky);
    }

    const waveIn = WAVE_S - (clock % WAVE_S);
    for (const p of particles) {
      if (p.wait > 0) {
        p.wait -= dt;
        continue;
      }
      p.prevT = p.t;
      p.t += p.speed * dt;
      if (p.prevT < 0.5 && p.t >= 0.5) gatePulse += 0.045;
      if (p.t >= 1) {
        // Respawn with the next wave.
        p.t = 0;
        p.prevT = 0;
        p.y0 = rand(30, 470);
        p.lane = pickLane();
        p.ox = p.oy = 0;
        p.wait = waveIn + rand(0, 0.3);
        continue;
      }
      const [px, py] = pathPoint(p.t, p.y0, p.j, p.lane);
      let x = px * kx + p.ox;
      let y = py * ky + p.oy;

      // The cursor pushes leads aside; the push decays back to the path.
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < PUSH_RADIUS * PUSH_RADIUS && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = ((PUSH_RADIUS - d) / PUSH_RADIUS) * PUSH_FORCE;
        p.ox += (dx / d) * f;
        p.oy += (dy / d) * f;
      }
      p.ox *= 0.9;
      p.oy *= 0.9;
      x = px * kx + p.ox;
      y = py * ky + p.oy;

      const edge = p.t > 0.94 ? (1 - p.t) / 0.06 : p.t < 0.03 ? p.t / 0.03 : 1;
      const size = p.size * 7;
      if (p.t < 0.5) {
        // Before the gate every lead is neutral.
        draw(sprite.neutral, x, y, size, 0.42 * edge);
      } else {
        const boost = 1 + 1.4 * laneGlow[p.lane];
        if (p.lane === 'Hot') draw(sprite.lime, x, y, size, 1 * edge * boost);
        else if (p.lane === 'Warm') draw(sprite.lime, x, y, size, 0.36 * edge * boost);
        else draw(sprite.grey, x, y, size, 0.6 * edge * boost);
      }
    }

    // The visitor's lead: 3× size, a visible trail, then sparks and a brighter stream.
    for (let i = visitors.length - 1; i >= 0; i--) {
      const v = visitors[i];
      if (!v) continue;
      if (v.arrivedAt === null) {
        v.t = Math.min(1, (now - v.launchedAt) / VISITOR_MS);
        if (v.t >= 1) {
          v.arrivedAt = now;
          laneGlow[v.lane] = 1;
          const [ex, ey] = pathPoint(1, MID_Y, 0, v.lane);
          for (let s = 0; s < 34; s++) {
            const a = rand(0, Math.PI * 2);
            const sp = rand(60, 200);
            const life = rand(0.5, 1);
            sparks.push({ x: ex * kx, y: ey * ky, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life });
          }
        }
      }
      const [vx0, vy0] = pathPoint(v.t, MID_Y, 0, v.lane);
      const vx = vx0 * kx;
      const vy = vy0 * ky;
      if (v.arrivedAt === null) {
        v.trail.unshift([vx, vy]);
        if (v.trail.length > 26) v.trail.pop();
      } else {
        v.trail.pop();
      }
      v.trail.forEach(([tx, ty], k) => {
        const f = 1 - k / 26;
        draw(sprite.lime, tx, ty, 9 * 7 * (0.35 + 0.65 * f), 0.5 * f * f);
      });
      if (v.arrivedAt === null) {
        draw(sprite.lime, vx, vy, 9 * 7, 1);
        draw(sprite.lime, vx, vy, 9 * 3, 1);
      } else if (now - v.arrivedAt > 1200 && v.trail.length === 0) {
        visitors.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (!s) continue;
      s.life -= dt;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      const drag = Math.exp(-dt * 3.2);
      s.vx *= drag;
      s.vy *= drag;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      draw(sprite.lime, s.x, s.y, 2.2 * 7, s.life / s.max);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Guardrails: animate only while on screen and while the tab is shown.
  let onScreen = true;
  const io = new IntersectionObserver(([e]) => {
    onScreen = !!e?.isIntersecting;
    if (onScreen && !document.hidden) start();
    else stop();
  });
  io.observe(canvas);
  const onVis = () => (document.hidden || !onScreen ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return {
    launch(lane) {
      visitors.push({ t: 0, lane, launchedAt: performance.now(), arrivedAt: null, trail: [] });
      start();
    },
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      ctx.clearRect(0, 0, w, h);
    },
  };
}

export { LANES };
