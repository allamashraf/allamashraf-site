import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// "Lead Field" draft. Only the review build (:4402) contains it; prod 404s (routes.spec).
test.use({ baseURL: 'http://127.0.0.1:4402' });
const URL = '/draft/lead-field/';
const CANVAS = /lead-field-canvas/;

test('noindex, not in the sitemap, and not linked from any page', async ({ page, request }) => {
  await page.goto(URL);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('/draft/');
  for (const path of ['/', '/work/', '/about/']) {
    await page.goto(path);
    await expect(page.locator('a[href*="/draft/"]')).toHaveCount(0);
  }
});

test('keyboard: type, toggle and route with Enter; result is announced', async ({ page }) => {
  await page.goto(URL);
  const input = page.getByLabel('Lead message, in Arabic or English');
  await input.focus();
  await page.keyboard.type('Can I book a viewing? Payment in cash.');
  await expect(page.locator('[data-lf-score]')).toHaveText('50');
  await page.getByLabel('Budget given').press('Space');
  await expect(page.locator('[data-lf-score]')).toHaveText('75');
  await input.press('Enter');
  await expect(page.locator('[data-lf-result]')).toHaveText('Routed to Rep A · Hot · follow-up in 1 day');
  await expect(page.locator('[data-lf-live]')).toContainText('Score 75 of 100, Hot. Routed to Rep A');
  await expect(page.locator('[data-lf-stage]')).toHaveAttribute('data-hit', 'Hot');
  // Round-robin moves on.
  await page.getByRole('button', { name: /Route this lead/ }).click();
  await expect(page.locator('[data-lf-result]')).toContainText('Rep B');
  // Fired rules are exposed as text, not colour alone.
  await expect(page.locator('[data-rule="visit"] [data-rule-state]')).toHaveText('applied');
  await expect(page.locator('[data-rule="phone"] [data-rule-state]')).toHaveText('not applied');
});

test('privacy: nothing typed is sent, stored or put in the URL', async ({ page }) => {
  await page.goto(URL);
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500); // let the lazy canvas chunk load first
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.getByLabel('Lead message, in Arabic or English').fill('عايز أعمل معاينة النهارده 01012345678');
  await page.getByLabel('Valid phone').check();
  await page.getByRole('button', { name: /Route this lead/ }).click();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(page.url()).toMatch(/\/draft\/lead-field\/$/);
  await expect(page.locator('form')).toHaveCount(0);
});

test.describe('desktop canvas', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('canvas layer loads after load, lazily', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (r) => {
      if (CANVAS.test(r.url())) chunks.push(r.url());
    });
    await page.goto(URL);
    await expect(page.locator('[data-lf-stage]')).toHaveClass(/is-live/);
    expect(chunks).toHaveLength(1);
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('static diagram, no canvas chunk, scorer still works, no overflow', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (r) => {
      if (CANVAS.test(r.url())) chunks.push(r.url());
    });
    await page.goto(URL);
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Too short' }).click();
    await page.getByRole('button', { name: /Route this lead/ }).click();
    await expect(page.locator('[data-lf-result]')).toContainText('Cold');
    expect(chunks).toEqual([]);
    await expect(page.locator('[data-lf-stage]')).not.toHaveClass(/is-live/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: 'reduce' } });
  test('no canvas, static highlight only', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (r) => {
      if (CANVAS.test(r.url())) chunks.push(r.url());
    });
    await page.goto(URL);
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Arabic' }).click();
    await page.getByRole('button', { name: /Route this lead/ }).click();
    await expect(page.locator('[data-lf-stage]')).toHaveAttribute('data-hit', 'Hot');
    expect(chunks).toEqual([]);
  });
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('rules and a worked example are shown; no dead inputs', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-lf-message]')).toBeHidden();
    await expect(page.locator('[data-lf-nojs]')).toBeVisible();
    await expect(page.locator('[data-lf-nojs]')).toContainText('65 / 100 · Hot');
    await expect(page.locator('[data-rule]')).toHaveCount(6);
  });
});

for (const width of [375, 1440]) {
  test(`axe: no serious/critical issues @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
