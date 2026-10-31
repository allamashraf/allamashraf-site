import { expect, test } from '@playwright/test';
import { scoreLead } from '../../src/lib/lead-score';
import { leadField } from '../../src/content/drafts/lead-field';

test.use({ viewport: { width: 375, height: 812 } });

test('samples use real scorer rules, expose matched rules and never use mockup claims', async ({ page }) => {
  await page.goto('/');
  for (let index = 0; index < leadField.scorer.examples.length; index++) {
    await page.locator(`[data-sample="${index}"]`).click();
    const score = scoreLead(leadField.scorer.examples[index]!.text, false, false);
    await expect(page.locator('[data-mobile-result] [data-score]')).toHaveText(String(score.score));
    await expect(page.locator('[data-mobile-result] [data-route]')).toHaveText(score.label);
    await expect(page.locator('[data-mobile-result] [data-rule]')).toHaveCount(score.fired.length);
    for (const rule of score.fired) await expect(page.locator(`[data-mobile-result] [data-rule="${rule.id}"]`)).toContainText(rule.label);
  }
  expect(await page.locator('main').innerText()).not.toMatch(/\+28%|-60%|3\+|100%|HubSpot|WhatsApp follow-ups|\b3D\b|live inventory|Prime location|Responded fast|\+?\d[\d -]{8,}\d/i);
  await expect(page.locator('[data-mobile-result]')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('[data-mobile-demo]')).toHaveAttribute('data-copy-status', 'APPROVED');
});

test('Arabic input, flags and score clamp work locally without requests or storage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('.mobile-demo__write summary').click();
  const text = 'عايز معاينة النهارده وأعرف التقسيط';
  await page.locator('[data-mobile-message]').fill(text);
  await page.locator('[data-mobile-budget]').check();
  await page.locator('[data-mobile-phone]').check();
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.locator('[data-mobile-submit]').click();
  await expect(page.locator('[data-mobile-result] [data-score]')).toHaveText('100');
  await expect(page.locator('[data-mobile-message-preview]')).toHaveText(text);
  await expect(page.locator('[data-mobile-message-preview]')).toHaveAttribute('dir', 'auto');
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(page.url()).toMatch(/\/$/);
});

test('canvas pauses offscreen, caps DPR and stops at the desktop boundary', async ({ page }) => {
  await page.goto('/');
  const scene = page.locator('[data-mobile-particles="funnel"]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-scene-state', 'running');
  expect(await scene.locator('canvas').evaluate(canvas => (canvas as HTMLCanvasElement).width / canvas.getBoundingClientRect().width)).toBeLessThanOrEqual(2.01);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-scene-state', 'paused');
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(scene).toHaveAttribute('data-scene-state', 'fallback');
  await expect(page.locator('[data-mobile-demo]')).toBeHidden();
});

for (const mode of ['reduced', 'save-data', 'narrow', 'no-canvas'] as const) {
  test(`${mode}: static particles and functional DOM scorer`, async ({ page }) => {
    if (mode === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (mode === 'narrow') await page.setViewportSize({ width: 320, height: 812 });
    if (mode === 'save-data') await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
    if (mode === 'no-canvas') await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext; });
    await page.goto('/');
    await expect(page.locator('[data-mobile-particles="funnel"]')).toHaveAttribute('data-scene-state', 'fallback');
    await expect(page.locator('[data-mobile-particles="funnel"] svg')).toBeVisible();
    await page.locator('[data-sample="1"]').click();
    await expect(page.locator('[data-mobile-result] [data-score]')).toHaveText('40');
  });
}

test('no JS: worked result, rulebook, navigation and disclosures remain usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-mobile-result] [data-score]')).toHaveText('70');
  await expect(page.locator('[data-mobile-particles="funnel"] svg')).toBeVisible();
  await page.locator('.mobile-demo__rulebook summary').click();
  await expect(page.locator('.mobile-demo__rulebook')).toContainText('Empty or under 5 characters: -15');
  await page.locator('.mobile-menu summary').click();
  await page.locator('.mobile-menu a[href="/work/"]').click();
  await expect(page).toHaveURL(/\/work\/$/);
  await context.close();
});

test('desktop does not request the mobile controller', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  const requests: string[] = [];
  page.on('request', request => { if (/mobile-experience/.test(request.url())) requests.push(request.url()); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(requests).toEqual([]);
});
