import { expect, test } from '@playwright/test';
import { AVAILABILITY, ROUTES } from './routes';

test('contact: availability line verbatim and location', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-availability]')).toHaveText(AVAILABILITY);
  await expect(page.locator('#contact')).toContainText('Based in Cairo, Egypt.');
});

test('contact: with EMAIL_PUBLISHED=false no email is rendered anywhere', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    expect(await page.content()).not.toContain('@allamashraf.dev');
  }
});

test('contact: LinkedIn is the only channel, and links correctly once configured', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#contact [data-linkedin]');
  // site.ts linkedinUrl is null until Allam supplies it; then the link must point to linkedin.com.
  if ((await link.count()) > 0) {
    await expect(link).toHaveAttribute('href', /^https:\/\/(www\.)?linkedin\.com\/in\/[^/]+\/?$/);
  } else {
    await expect(page.locator('#contact [data-claim="linkedin-url"]')).toHaveCount(0);
  }
});

test('no page text contains "freelance"', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    expect((await page.content()).toLowerCase()).not.toContain('freelance');
  }
});

test('prod build withholds every unverified claim and placeholder', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    await expect(page.locator('[data-claim-status="NEEDS_EVIDENCE"], [data-claim-status="NOT_FOR_PUBLICATION"]')).toHaveCount(0);
    expect(await page.content()).not.toContain('[[PLACEHOLDER');
  }
});

test('AOG is never described as current', async ({ page }) => {
  for (const path of ['/', '/about/']) {
    await page.goto(path);
    const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    expect(text).not.toMatch(/\bPresent\b/);
    expect(text).not.toMatch(/currently|current role/i);
  }
  await page.goto('/about/');
  await expect(page.locator('.node', { hasText: 'AOG Developments' })).toContainText('2025 – 2026');
});

test('proof rail reaches every case study in one click', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Case studies' }).getByRole('link');
  await expect(links).toHaveCount(3);
  // Credibility order approved 22 Oct 2026: shipped first, then unreleased, then prototype.
  await expect(links.nth(0)).toHaveAttribute('href', '/work/interactive-showroom/');
  await expect(links.nth(1)).toHaveAttribute('href', '/work/hotel-lead-capture/');
  await expect(links.nth(2)).toHaveAttribute('href', '/work/lead-routing-prototype/');
});

test('Allam built both AOG projects alone: no "contribution" wording anywhere', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    expect((await page.locator('main').innerText()).toLowerCase()).not.toMatch(/contribut/);
  }
});

test('the hotel lead-capture page is never shown as delivered or live', async ({ page }) => {
  await page.goto('/work/hotel-lead-capture/');
  const hero = page.locator('.case-hero');
  await expect(hero.locator('.badge')).toHaveText(/unreleased/i);
  await expect(hero).toContainText('Not launched');
  expect((await page.locator('main').innerText()).toLowerCase()).not.toMatch(/\bdelivered\b|\blive\b/);

  await page.goto('/');
  const hotelCard = page.locator('#work [data-case="hotel-lead-capture"]');
  await expect(hotelCard.locator('.badge')).toHaveText(/unreleased/i);
  const railHotel = page.getByRole('navigation', { name: 'Case studies' }).getByRole('link', { name: /Hotel Lead Capture/ });
  await expect(railHotel.locator('.badge')).toHaveText(/unreleased/i);
});

test('prototype case keeps its mandatory limitations (§7.3, revised 22 Oct 2026)', async ({ page }) => {
  await page.goto('/work/lead-routing-prototype/');
  const lim = page.getByRole('complementary', { name: 'Limitations' });
  await expect(lim).toContainText('never tested under concurrent requests');
  await expect(lim).toContainText('never against real lead traffic');
  await expect(lim).toContainText('mocked or left as templates');
  await expect(lim).toContainText('nothing was ever hosted');
  await expect(lim).toContainText('still creates an empty lead record');
  // All eleven sections are filled; demo summary figures are never published.
  await expect(page.locator('[data-case-body] .case-section__pending')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/pipeline value|AI qualified/i);
  await expect(page.locator('.case-hero .facts')).toContainText('2026');
  // Approved facts: designed for AOG, never deployed, never ran inside n8n, no Docker.
  const main = page.locator('main');
  await expect(main).toContainText('Never deployed');
  await expect(main).toContainText('AOG never used it');
});

test('showroom page: all eleven sections filled, no keep-awake, outcome not measured', async ({ page }) => {
  await page.goto('/work/interactive-showroom/');
  const body = page.locator('[data-case-body]');
  await expect(body.locator('.case-section__pending')).toHaveCount(0);
  const facts = page.locator('.case-hero .facts');
  await expect(facts).toContainText('2026');
  await expect(facts).toContainText('Node.js (local maps server)');
  await expect(body).toContainText('90 seconds');
  await expect(body).toContainText('QR');
  await expect(page.getByRole('complementary', { name: 'Not measured' })).toContainText('no usage or sales-impact data');
  const lim = page.getByRole('complementary', { name: 'Limitations' });
  await expect(lim).toContainText('never tested on other hardware');
  await expect(lim).toContainText('required editing code');
  expect((await page.locator('main').innerText()).toLowerCase()).not.toContain('keep-awake');
  await expect(page.locator('.case-hero')).toContainText('Solo build · Design and development · Used in production');
});

test('corrected claims stay corrected: no Docker, no "independent" prototype', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/docker/i);
    expect(text).not.toMatch(/independent prototype/i);
  }
});

test('case pages show all eleven sections in order', async ({ page }) => {
  await page.goto('/work/hotel-lead-capture/');
  const nums = await page.locator('[data-case-body] [data-structural].case-section__num').allInnerTexts();
  expect(nums).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
});

test('keyboard: skip link is first, visible on focus, and moves to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box && box.y >= 0).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('keyboard: focus ring is visible on links', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBe('2px');
});

test('every Signal Path sentence is real, visible DOM text', async ({ page }) => {
  await page.goto('/');
  const stations = page.locator('[data-station]');
  await expect(stations).toHaveCount(5);
  for (const s of await stations.all()) {
    await expect(s.locator('.station__sentence')).toBeVisible();
  }
  await expect(page.locator('#signal')).toContainText('Illustrative · fictional data');
});

test.describe('email published variant', () => {
  test.use({ baseURL: 'http://127.0.0.1:4401' });

  test('mailto is correct and Copy announces through aria-live', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await expect(page.locator('#contact a[href="mailto:allam@allamashraf.dev"]')).toHaveCount(1);
    const status = page.locator('#contact [data-copy-status]');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveText('');
    await page.locator('#contact [data-copy-button]').click();
    await expect(status).toHaveText('Email address copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('allam@allamashraf.dev');
  });
});
