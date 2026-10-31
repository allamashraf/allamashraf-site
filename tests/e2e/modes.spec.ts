import { expect, test } from '@playwright/test';

// Run by the "no-js" and "reduced-motion" projects (§8.4 fallback matrix).

test('@nojs all text and the complete Signal Path render without JavaScript', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-station]')).toHaveCount(5);
  for (const s of await page.locator('.station__sentence').all()) await expect(s).toBeVisible();
  await expect(page.locator('.lanes-svg')).toBeAttached();
  await expect(page.locator('#work [data-case]')).toHaveCount(3);
  await page.getByRole('navigation', { name: 'Case studies' }).getByRole('link').first().click();
  await expect(page).toHaveURL(/\/work\/interactive-showroom\/$/);
});

test('@reduced no GSAP request and nothing sits at opacity 0', async ({ page }) => {
  const motionRequests: string[] = [];
  page.on('request', (r) => {
    if (/gsap|ScrollTrigger|signal-path/i.test(r.url())) motionRequests.push(r.url());
  });
  await page.goto('/');
  await page.mouse.wheel(0, 4000);
  await page.waitForLoadState('networkidle');
  expect(motionRequests).toEqual([]);

  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('main *')]
      .filter((el) => (el as HTMLElement).innerText?.trim() && getComputedStyle(el).opacity === '0')
      .map((el) => el.className || el.tagName),
  );
  expect(hidden).toEqual([]);

  const pulse = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__dot')!, '::after').animationName);
  expect(pulse).toBe('none');

  // No H1 reveal, no scene, no pin, no scroll-driven reveals under reduced motion (§8.4).
  const h1Anim = await page.$$eval('.hero__title .w__in', (els) => els.map((e) => getComputedStyle(e).animationName));
  expect(new Set(h1Anim)).toEqual(new Set(['none']));
  await expect(page.locator('[data-signal]')).not.toHaveClass(/is-scene/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});
