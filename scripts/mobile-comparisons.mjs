// Packages local screenshots beside the user-supplied references; never publishes assets.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const root = '.shots/mobile-plan';
const refs = 'D:/AllamAshraf.dev/صور/';
const pairs = [
  ['hero', 'ChatGPT Image Oct 23, 2026, 06_39_14 AM.png', 'Hero', 'Approved H1, eyebrow, bio and capability labels replace all reference copy. The longer H1 needs five lines at 375px. LinkedIn replaces Email me. The header uses the existing name and location.'],
  ['demo', 'ChatGPT Image Oct 23, 2026, 06_40_08 AM.png', 'Interactive scoring', 'Actual samples score 70, 40 and 0. The score card lists only rules fired by the existing scorer. There are no phone numbers or counters. Fictional-data and PROPOSED labels, optional bilingual input, rulebook and the five-station stepper add height.'],
  ['flow', 'Neon Lead Flow Dashboard.png', 'Five-station flow', 'This reference is landscape desktop art. Desktop remains unchanged; mobile keeps the approved five station sentences in a vertical compact stepper. Invented outcomes, integration bullets and metrics are omitted.'],
  ['architecture', 'Neon Marketing Automation System.png', 'Case-study architecture', 'This reference is a desktop composition for a fictional project. The existing prototype case and its approved architecture are retained. Its eleven evidence sections, limitations, and real tool claims take priority over the reference sidebar and fictional integrations. No matching mobile case-study mockup was supplied.'],
  ['work', 'Neon Selected Work Portfolio UI.png', 'Selected work', 'Real project order: Interactive Sales Showroom (delivered), Bilingual Hotel Lead-Capture Page (unreleased), Lead-Routing Automation Prototype (prototype). Full approved summaries and roles make cards taller. Schematics depict the real projects using code-native SVG; fictional systems, brands and features are excluded.'],
  ['funnel', 'Neon Systems Funnel Interface.png', 'Particle funnel', 'The landscape funnel becomes the portrait funnel from the mobile scoring reference. Hot is lime, Warm amber, Cold ivory white. Thresholds come from the scorer, not the image. Physical phone chrome and the photographed hand are presentation framing and are not website UI.'],
];
const embed = path => `data:image/png;base64,${readFileSync(path).toString('base64')}`;
const cards = pairs.map(([key,file,title,note]) => `<section id="${key}"><h2>${title}</h2><p>${note}</p><div class="pair"><figure><figcaption>Supplied mockup · placeholder copy excluded from implementation</figcaption><img src="${embed(refs+file)}" alt="${title} design reference"></figure><figure><figcaption>Implementation · 375px · reduced-motion static fallback</figcaption><img src="${embed(`${root}/section-${key}.png`)}" alt="${title} implemented section"></figure></div></section>`).join('');
const extras = ['capabilities','contact','footer'].map(key=>`<figure><figcaption>${key} · no matching reference supplied; existing approved copy retained</figcaption><img src="${embed(`${root}/section-${key}.png`)}" alt="${key}"></figure>`).join('');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Mobile mockup comparison</title><style>body{margin:0;padding:36px;background:#111;color:#eee;font:16px/1.6 system-ui}h1,h2{line-height:1.15}p{max-width:1000px;color:#c3c3c3}section{margin:48px 0;border-top:1px solid #555;padding-top:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}figure{margin:0;min-width:0}figcaption{padding:10px 0;color:#bfff4d;font-size:13px}img{display:block;width:100%;height:auto}.extras{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}@media(max-width:700px){.pair,.extras{grid-template-columns:1fr}}a{color:#c4ff00}</style><h1>Mobile implementation / supplied design references</h1><p>Branch: codex/mobile-plan. References are the visual specification; every reference word and number is treated as placeholder. All screenshots below are captured from the local production build at 375px. References retain their original phone/desktop framing. No external assets are used by the site.</p><p>These are settled static fallback captures, making the visual comparison repeatable. Animated canvas is separately exercised by browser tests. Header and sticky contact overlays are omitted from scrolled section crops for readability; the full-page captures retain the actual UI.</p>${cards}<section><h2>Additional sections</h2><div class="extras">${extras}</div></section></html>`;
// Keep implementation screenshots at their actual CSS width. The phone references
// include a bezel, so their complete images are wider than their screen content.
const sizedHtml = html.replace('</style>', '.pair figure:last-child img{width:375px;max-width:100%;margin-inline:auto}.pair figure:first-child img{width:474px;max-width:100%;margin-inline:auto}</style>');
writeFileSync(`${root}/comparison.html`, sizedHtml);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1120, height: 900 } });
await page.setContent(sizedHtml);
await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
for (const [key] of pairs) await page.locator(`#${key}`).screenshot({ path: `${root}/comparison-${key}.png` });
await browser.close();
console.log(`Saved ${root}/comparison.html and six side-by-side PNG comparisons.`);
