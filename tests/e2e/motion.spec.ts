import { expect, test, type Page } from '@playwright/test';

// Sprint 2 motion (§8.2–8.4). Runs in Chromium and Firefox.
const SCENE = /signal-path-scene/;

const sentencesFullyShown = (page: Page) =>
  page.$$eval('#signal .station__sentence, #signal .station__label', (els) =>
    els.every((el) => getComputedStyle(el).opacity === '1' && el.getBoundingClientRect().height > 0),
  );

async function scrollThroughSignal(page: Page) {
  const spacer = page.locator('.pin-spacer');
  const top = (await spacer.count())
    ? await spacer.evaluate((el) => el.getBoundingClientRect().top + scrollY)
    : await page.locator('#signal').evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const end = top + (await page.evaluate(() => innerHeight)) * 1.8;
  for (let y = top; y <= end; y += 200) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(40);
  }
  // scrub: 0.6s catch-up
  await page.waitForTimeout(1200);
}

test.describe('desktop scene', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('hero signal transfers continuously to CLICK and cleans up on mobile', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('[data-signal]')).toHaveClass(/is-scene/);
    const hero = page.locator('.hero__dot');
    const transfer = page.locator('.signal-transfer');
    await expect(transfer).toHaveCount(1);
    await expect(hero).toHaveCSS('opacity', '1');
    const top = await page.locator('.pin-spacer').evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y / 2), top);
    await page.waitForTimeout(1200);
    await expect(hero).toHaveCSS('opacity', '0');
    await expect(transfer).toHaveCSS('opacity', '1');
    const flight = await transfer.boundingBox();
    expect(flight).not.toBeNull();
    expect(flight!.y + flight!.height).toBeGreaterThan(0);
    expect(flight!.y).toBeLessThan(900);
    await testInfo.attach('desktop-signal-transfer', { body: await page.screenshot(), contentType: 'image/png' });
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.waitForTimeout(1200);
    await expect(transfer).toHaveCSS('opacity', '0');
    await expect(page.locator('[data-signal-dot]')).toHaveCSS('opacity', '1');
    const landed = await page.locator('[data-signal-dot]').boundingBox();
    const node = await page.locator('[data-station="click"] .station__node').boundingBox();
    expect(Math.abs(landed!.x + landed!.width / 2 - node!.x - node!.width / 2)).toBeLessThan(2);
    expect(Math.abs(landed!.y + landed!.height / 2 - node!.y - node!.height / 2)).toBeLessThan(2);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(transfer).toHaveCount(0);
    await expect(hero).toHaveCSS('opacity', '1');
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.signal-transfer')).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.signal-transfer')).toHaveCount(0);
    await expect(hero).toHaveCSS('opacity', '1');
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await testInfo.attach(`layout-${width}-viewport`, { body: await page.screenshot(), contentType: 'image/png' });
      await testInfo.attach(`layout-${width}-full`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    }
  });

  test('GSAP chunk loads lazily, pins exactly one section, and ends complete', async ({ page }) => {
    const motion: string[] = [];
    page.on('request', (r) => {
      if (SCENE.test(r.url())) motion.push(r.url());
    });
    await page.goto('/');
    await expect(page.locator('[data-signal]')).toHaveClass(/is-scene/);
    expect(motion).toHaveLength(1);
    await expect(page.locator('.pin-spacer')).toHaveCount(1);

    await scrollThroughSignal(page);
    expect(await sentencesFullyShown(page)).toBe(true);
    const lit = await page.$$eval('#signal [data-station-lit]', (els) => els.map((e) => getComputedStyle(e).opacity));
    expect(lit).toEqual(['1', '1', '1', '1', '1']);
    // No horizontal overflow while the pin is active (incl. fractional scaling).
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });

  test('page stays complete and error-free if the motion chunk fails to load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(SCENE, (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(800);
    await expect(page.locator('[data-signal]')).not.toHaveClass(/is-scene/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    expect(await sentencesFullyShown(page)).toBe(true);
    await expect(page.locator('#work [data-case]')).toHaveCount(3);
    expect(errors).toEqual([]);
  });

  test('Save-Data is treated like reduced motion: no chunk, static diagram', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
    });
    const motion: string[] = [];
    page.on('request', (r) => {
      if (SCENE.test(r.url())) motion.push(r.url());
    });
    await page.goto('/');
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(800);
    expect(motion).toEqual([]);
    expect(await sentencesFullyShown(page)).toBe(true);
  });

  test('only one pinned section on the whole site', async ({ page }) => {
    for (const path of ['/work/', '/about/', '/work/interactive-showroom/']) {
      await page.goto(path);
      await page.waitForTimeout(300);
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
    }
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('no GSAP on mobile, and every station sentence is present', async ({ page }) => {
    const motion: string[] = [];
    page.on('request', (r) => {
      if (SCENE.test(r.url())) motion.push(r.url());
    });
    await page.goto('/');
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    expect(motion).toEqual([]);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('#signal .station__sentence')).toHaveCount(5);
  });
});

test('scroll-driven CSS motions really run where supported (minifier regression guard)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/interactive-showroom/');
  const supported = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'));
  test.skip(!supported, 'no CSS scroll timelines here (e.g. Firefox): static fallback by design');

  const rail = () =>
    page.$eval('.case-rail span', (e) => {
      const s = getComputedStyle(e, '::after');
      return { name: s.animationName, timeline: s.animationTimeline, transform: s.transform };
    });
  const before = await rail();
  expect(before.name).toBe('rail-fill');
  expect(before.timeline).toBe('scroll(root)');
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
  await page.waitForTimeout(300);
  expect((await rail()).transform).not.toBe(before.transform);

  const flow = await page.$eval('.flow__step', (e) => getComputedStyle(e, '::after').animationTimeline);
  expect(flow).toBe('view()');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const stations = await page.$$eval('#signal .station', (els) =>
    els.map((e) => getComputedStyle(e).animationTimeline),
  );
  expect(new Set(stations)).toEqual(new Set(['view()']));
});

test('H1 text and accessible name are unchanged by the word reveal', async ({ page }) => {
  const H1 = 'I build the systems that move leads from first click to the sales team';
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(H1);
  const text = (await page.locator('h1').textContent())?.replace(/\s+/g, ' ').trim();
  expect(text).toBe(H1);
});
