// Performance budgets (master plan §8.5). Measures gzip sizes in the built dist/ and fails on breach.
// Prints measured numbers only; nothing here is an estimate.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = resolve(root, process.env.ASTRO_OUT_DIR ?? 'dist');
const KB = 1024;

const BUDGET = {
  ownJsGzip: 8 * KB,
  motionChunkGzip: 55 * KB,
  cssGzip: 30 * KB,
  fonts: 110 * KB,
  fontPreloads: 1,
  homeFirstLoad: 350 * KB,
};

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
const fmt = (b) => `${(b / KB).toFixed(1)}KB`;

const files = walk(dist);
const js = files.filter((f) => f.endsWith('.js'));
// The Sprint 2 motion chunk (GSAP + ScrollTrigger + scene) is budgeted on its own.
const isMotion = (f) => /gsap|ScrollTrigger|signal-path/i.test(f);
const ownJs = js.filter((f) => !isMotion(f));
const motionJs = js.filter(isMotion);
const css = files.filter((f) => f.endsWith('.css'));
const fonts = files.filter((f) => f.endsWith('.woff2'));

const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const preloads = (indexHtml.match(/<link[^>]+rel="preload"[^>]+as="font"/g) ?? []).length;

// Homepage first load: the HTML plus every CSS/JS/font it references, gzip for text, raw for woff2.
const refs = [...indexHtml.matchAll(/(?:href|src)="(\/_astro\/[^"]+)"/g)].map((m) => join(dist, m[1]));
// @font-face rules live in an inline <style> emitted by <Font />, so scan the HTML too.
const fontCss = [indexHtml, ...css.map((f) => readFileSync(f, 'utf8'))].join('\n');
const fontRefs = [...fontCss.matchAll(/url\((?:"|')?(\/_astro\/fonts\/[^)"']+)/g)].map((m) => join(dist, m[1]));
const firstLoad = new Set([...refs, ...fontRefs].filter((f) => !isMotion(f)));
let homeBytes = gzipSync(indexHtml).length;
for (const f of firstLoad) {
  try {
    homeBytes += f.endsWith('.woff2') ? statSync(f).size : gz(f);
  } catch {
    /* referenced but not emitted (e.g. external) */
  }
}

// Astro inlines small module scripts into the page (hashed by the CSP), so count those as own JS too.
const inlineJs = Math.max(
  0,
  ...files
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const html = readFileSync(f, 'utf8');
      const code = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
      return code ? gzipSync(code, { level: 9 }).length : 0;
    }),
);

const measured = {
  ownJsGzip: ownJs.reduce((s, f) => s + gz(f), 0) + inlineJs,
  motionChunkGzip: motionJs.reduce((s, f) => s + gz(f), 0),
  cssGzip: css.reduce((s, f) => s + gz(f), 0),
  fonts: fonts.reduce((s, f) => s + statSync(f).size, 0),
  fontPreloads: preloads,
  homeFirstLoad: homeBytes,
};

let failed = false;
console.log('Budget check (measured from dist/):');
for (const [k, limit] of Object.entries(BUDGET)) {
  const v = measured[k];
  const ok = k === 'fontPreloads' ? v === limit : v <= limit;
  if (!ok) failed = true;
  const show = k === 'fontPreloads' ? `${v} (must be ${limit})` : `${fmt(v)} / ${fmt(limit)}`;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${k.padEnd(16)} ${show}`);
}
console.log(`  files: ${ownJs.length} own JS, ${motionJs.length} motion JS, ${css.length} CSS, ${fonts.length} fonts`);
if (process.argv.includes('--verbose')) {
  for (const f of [...js, ...css]) console.log(`    ${relative(dist, f)}  ${fmt(gz(f))} gz`);
}
process.exit(failed ? 1 : 0);
