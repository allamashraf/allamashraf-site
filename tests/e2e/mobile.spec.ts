import { expect, test } from '@playwright/test';

// Mobile mockups (23 Oct 2026): phones (<768px) get the reference-led scene and cards.
// Desktop and tablet stay exactly as they were.

const MOBILE_SUBHEAD = 'At AOG Developments I ran the website, media buying and marketing automation alone. CS student in Cairo.';

test.describe('phone 375x812', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hero: approved copy, reference-sized H1, LinkedIn and particle peek', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('.hero__title').evaluate((el) => getComputedStyle(el).fontSize)).toBe('40px');
    // innerText: what is rendered, not the hidden desktop span.
    await expect(page.locator('.hero__subhead')).toHaveText(MOBILE_SUBHEAD, { useInnerText: true });
    await expect(page.locator('[data-claim="hero-subhead"]')).toBeHidden();
    await expect(page.locator('.hero .mobile-linkedin')).toHaveAttribute('href', 'https://www.linkedin.com/in/allam-ashraf');
    await expect(page.locator('.hero [data-mobile-particles="wave"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('I build the systems that move leads from first click to the sales team');
  });

  test('work cards drop the cover on the homepage only; case pages keep it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#work [data-case]')).toHaveCount(3);
    for (const cover of await page.locator('#work .card__cover').all()) await expect(cover).toBeHidden();
    await expect(page.locator('#work .mobile-schematic')).toHaveCount(3);
    for (const schematic of await page.locator('#work .mobile-schematic').all()) await expect(schematic).toBeVisible();
    await page.goto('/work/interactive-showroom/');
    await expect(page.locator('.case-hero__cover')).toBeVisible();
  });

  test('capabilities and approach collapse into native disclosure rows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.approach__bio')).toBeHidden();
    await expect(page.locator('.mobile-skills details')).toHaveCount(7);
    await expect(page.locator('.mobile-skills a[href="/about/"]')).toBeVisible();
    await page.locator('.mobile-skills summary').first().click();
    await expect(page.locator('.mobile-skills details').first()).toHaveAttribute('open', '');
  });

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});

test.describe('tablet 768 and up is unchanged', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('full subhead, covers and bio still show; H1 keeps the 48px floor', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-claim="hero-subhead"]')).toBeVisible();
    await expect(page.locator('[data-claim="hero-subhead-mobile"]')).toBeHidden();
    for (const cover of await page.locator('#work .card__cover').all()) await expect(cover).toBeVisible();
    await expect(page.locator('.approach__bio')).toBeVisible();
    const size = await page.locator('.hero__title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(48);
  });
});
