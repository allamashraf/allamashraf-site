// Local review artifacts only. No network requests beyond the local preview.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const baseline = process.argv.includes('--baseline');
const root = '.shots/mobile-plan';
mkdirSync(root, { recursive: true });
const browser = await chromium.launch();
const routes = ['/', '/work/', '/about/', '/work/interactive-showroom/', '/work/hotel-lead-capture/', '/work/lead-routing-prototype/'];
const results = [];
for (const width of [768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:4411${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => !document.querySelector('[data-site-header]')?.classList.contains('is-scrolled'));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const name = `${width}-${route.replaceAll('/', '-').replace(/^-|-$/g, '') || 'home'}`;
    const bytes = await page.screenshot({ fullPage: true, animations: 'disabled' });
    const path = `${root}/${baseline ? 'before' : 'after'}-${name}.png`;
    writeFileSync(path, bytes);
    if (!baseline) {
      const before = readFileSync(`${root}/before-${name}.png`);
      results.push({ width, route, identical: createHash('sha256').update(before).digest('hex') === createHash('sha256').update(bytes).digest('hex') });
    }
  }
  await page.close();
}
writeFileSync(`${root}/${baseline ? 'baseline' : 'desktop-comparison'}.json`, JSON.stringify(results, null, 2));
console.log(baseline ? 'Desktop baseline saved (18 full-page screenshots).' : JSON.stringify(results));
if (!baseline) {
  for (const width of [320, 375, 390, 767]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:4411/');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${root}/mobile-${width}-viewport.png`, animations: 'disabled' });
    await page.screenshot({ path: `${root}/mobile-${width}-full.png`, fullPage: true, animations: 'disabled' });
    if (width === 375) {
      const full = await page.screenshot({ fullPage: true, animations: 'disabled' });
      for (const [name, selector] of Object.entries({ hero: '.hero', demo: '#signal', funnel: '.mobile-demo__stage', flow: '.track-wrap', work: '#work', capabilities: '#capabilities', contact: '#contact', footer: '.site-footer' })) {
        const rect = await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; });
        await sharp(full).extract({ left: 0, top: Math.floor(rect.top), width, height: Math.ceil(rect.height) }).toFile(`${root}/section-${name}.png`);
      }
      await page.goto('http://127.0.0.1:4411/work/lead-routing-prototype/');
      await page.evaluate(() => document.fonts.ready);
      const caseFull = await page.screenshot({ fullPage: true, animations: 'disabled' });
      const rect = await page.locator('.case-section[aria-labelledby="s-06"]').evaluate(el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; });
      await sharp(caseFull).extract({ left: 0, top: Math.floor(rect.top), width, height: Math.ceil(rect.height) }).toFile(`${root}/section-architecture.png`);
    }
    await page.close();
  }
}
await browser.close();
