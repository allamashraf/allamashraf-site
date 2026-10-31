// Static release checks complement the claims gate and browser suite.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = resolve(root, process.env.ASTRO_OUT_DIR ?? 'dist');
const walk = dir => readdirSync(dir).flatMap(n => statSync(join(dir,n)).isDirectory() ? walk(join(dir,n)) : [join(dir,n)]);
const errors = [];
const html = walk(dist).filter(f => f.endsWith('.html'));
const site = 'https://allamashraf.dev';
const assetExists = ref => {
  const p = join(dist, decodeURIComponent(ref.split(/[?#]/)[0]));
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p,'index.html')));
};

if (existsSync(join(dist, 'draft'))) errors.push('Draft routes are present in the production build.');
if (html.length !== 7) errors.push(`Expected seven production HTML pages, found ${html.length}.`);
for (const route of ['index.html','work/index.html','about/index.html','work/interactive-showroom/index.html','work/hotel-lead-capture/index.html','work/lead-routing-prototype/index.html','404.html']) {
  if (!existsSync(join(dist,route))) errors.push(`Missing required page ${route}.`);
}
for (const file of html) {
  const text = readFileSync(file,'utf8');
  const name = relative(dist,file);
  const tag = (attr,key) => text.match(new RegExp(`<meta\\b[^>]*${attr}="${key}"[^>]*content="([^"]+)"`))?.[1];
  for (const key of ['og:title','og:description','og:url','og:image','og:image:alt']) {
    if (!tag('property',key)) errors.push(`${name}: missing ${key}.`);
  }
  const image = tag('property','og:image');
  if (image && (!image.startsWith(site+'/og/') || !assetExists(new URL(image).pathname))) errors.push(`${name}: missing or invalid social image.`);
  if (image && assetExists(new URL(image).pathname)) {
    const png = readFileSync(join(dist,new URL(image).pathname));
    if (png.length < 24 || png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) errors.push(`${name}: social image must be 1200 by 630.`);
  }
  if (tag('name','twitter:card') !== 'summary_large_image') errors.push(`${name}: missing large Twitter card.`);
  if (tag('name','twitter:image') !== image) errors.push(`${name}: social image mismatch.`);
  if (!/<link\b[^>]*rel="apple-touch-icon"/.test(text)) errors.push(`${name}: missing Apple icon.`);
  for (const match of text.matchAll(/(?:href|src)="(\/(?!\/)[^"]+)"/g)) {
    if (!assetExists(match[1])) errors.push(`${name}: broken local reference ${match[1]}.`);
  }
  // Inline scripts/styles must be explicitly authorized by the generated CSP.
  if (!/http-equiv="content-security-policy"/.test(text)) errors.push(`${name}: CSP is missing.`);
}
for (const file of ['robots.txt','sitemap-index.xml','sitemap-0.xml','apple-touch-icon.png','404.html']) {
  if (!existsSync(join(dist,file))) errors.push(`Missing ${file}.`);
}
const sitemap = readFileSync(join(dist,'sitemap-0.xml'),'utf8');
if (sitemap.includes('/draft/') || sitemap.includes('/404')) errors.push('Sitemap includes a non-indexable route.');
if (errors.length) {
  console.error(`Release checks FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Release checks passed: ${html.length} pages, social images, icons, internal references, sitemap and no drafts.`);
