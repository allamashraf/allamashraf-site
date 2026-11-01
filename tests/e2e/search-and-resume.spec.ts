import { expect, test } from '@playwright/test';
import { ROUTES, SITE } from './routes';

const GITHUB = 'https://github.com/allamashraf';
const RESUME = '/resume/Allam-Ashraf-Resume.pdf';

test('search metadata is unique, consistent and describes the actual project status', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of ROUTES) {
    await page.goto(path);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(titles.has(title)).toBe(false);
    expect(descriptions.has(description!)).toBe(false);
    titles.add(title);
    descriptions.add(description!);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description!);
    const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)['@graph'];
    const person = graph.find((node: Record<string, unknown>) => node['@type'] === 'Person');
    const webPage = graph.find(
      (node: Record<string, unknown>) =>
        node.url === `${SITE}${path}` && node['@type'] !== 'Person' && node['@type'] !== 'WebSite',
    );
    expect(person.sameAs).toContain(GITHUB);
    expect(person).not.toHaveProperty('worksFor');
    expect(person).not.toHaveProperty('jobTitle');
    expect(webPage.name).toBe(title);
    expect(webPage.description).toBe(description);
    if (path === '/about/') expect(webPage.mainEntity['@id']).toBe(person['@id']);
    if (path.includes('hotel-lead-capture')) expect(description).toMatch(/never launched/i);
    if (path.includes('lead-routing-prototype')) expect(description).toMatch(/never deployed/i);
  }
});

test('GitHub links identify a profile and the resume is a real downloadable PDF', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.hero__resume')).toHaveAttribute('href', RESUME);
  await expect(page.locator('.hero__resume')).toHaveAttribute('download', '');
  await expect(page.locator('.site-header a').filter({ hasText: 'GitHub' }).first()).toHaveAttribute('href', GITHUB);
  await expect(page.locator('.site-footer a[href="' + GITHUB + '"]')).toHaveCount(1);
  for (const path of ROUTES.filter((path) => path.startsWith('/work/') && path !== '/work/')) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'GitHub profile' })).toHaveAttribute('href', GITHUB);
  }
  const response = await request.get(RESUME);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const bytes = await response.body();
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.length).toBeLessThan(150_000);
});

test.describe('phone resume access', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('resume stays visible and GitHub is reachable in the native menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero__resume')).toBeVisible();
    await expect(page.locator('.hero .mobile-linkedin')).toBeVisible();
    await page.locator('.mobile-menu summary').click();
    await expect(page.locator('.mobile-menu a[href="' + GITHUB + '"]')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
  });
});
