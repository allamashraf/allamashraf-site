import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { ROUTES, SITE } from './routes';

for (const path of ROUTES) {
  test(`${path} returns 200 with SEO tags, CSP and no console errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(m.text());
    });
    page.on('pageerror', (e) => problems.push(e.message));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Allam Ashraf/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:image:alt']) {
      await expect(page.locator(`meta[property="${p}"]`)).toHaveCount(1);
    }
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin');

    const csp = page.locator('meta[http-equiv="content-security-policy"]');
    await expect(csp).toHaveCount(1);
    const policy = (await csp.getAttribute('content')) ?? '';
    for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "script-src 'self'", "style-src 'self'"]) {
      expect(policy).toContain(d);
    }

    await expect(page.locator('h1')).toHaveCount(1);
    // Enhancements deliberately load AFTER load. Check their CSP and runtime too.
    await page.waitForLoadState('load');
    await expect.poll(() => page.locator('script[src="/client/client.js"]').count()).toBe(1);
    await page.waitForTimeout(300);
    // Any CSP violation also surfaces as a console error, so this covers both.
    expect(problems).toEqual([]);
  });
}

test('unknown path serves the 404 page with HTTP 404', async ({ page }) => {
  const res = await page.goto('/this-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Signal lost.');
  await expect(page.getByRole('link', { name: 'Work', exact: true }).last()).toHaveAttribute('href', '/work/');
});

test('draft pages never ship in the production build (not even their assets)', async ({ request }) => {
  expect((await request.get('/draft/lead-field/')).status()).toBe(404);
  expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('/draft/');
  const assets = readdirSync(join(process.cwd(), 'dist', '_astro'));
  expect(assets.filter((f) => /lead-field/i.test(f))).toEqual([]);
});

test('sitemap and robots.txt are present', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`${SITE}/sitemap-index.xml`);
  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);
  const s0 = await request.get('/sitemap-0.xml');
  const body = await s0.text();
  for (const path of ROUTES) expect(body).toContain(`${SITE}${path}`);
  expect(body).not.toContain('404');
});

test('no broken internal links', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ROUTES) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') ?? ''));
    for (const h of hrefs) if (h.startsWith('/')) seen.add(h.split('#')[0] || '/');
  }
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
});
