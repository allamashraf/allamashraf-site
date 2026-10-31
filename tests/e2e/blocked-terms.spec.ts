import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { loadBlockedFigures, termPattern } from '../../scripts/check-claims.mjs';
import { ROUTES } from './routes';

// Unannounced names live in the local, git-ignored blocked-terms.txt so they never enter this
// (eventually public) repo. Required locally; CI has no copy, so the check is skipped there.
const FILE = 'blocked-terms.txt';
const terms: string[] = existsSync(FILE) ? loadBlockedFigures(FILE) : [];

test('blocked-terms.txt exists locally and is not empty', () => {
  test.skip(!!process.env['CI'], 'local-only file');
  expect(terms.length, `${FILE} is missing or empty`).toBeGreaterThan(0);
});

test('no blocked term appears anywhere in the built site (text, meta, alt, attributes)', async ({ page, request }) => {
  test.skip(terms.length === 0, 'no local blocked-terms.txt');
  const patterns = terms.map((t) => termPattern(t) as RegExp);
  const hits: string[] = [];
  const scan = (where: string, body: string) =>
    patterns.forEach((re, i) => {
      if (re.test(body)) hits.push(`${where}: entry #${i + 1}`);
    });

  for (const path of [...ROUTES, '/missing-page/']) {
    await page.goto(path);
    scan(path, await page.content());
  }
  for (const file of ['/sitemap-0.xml', '/robots.txt']) {
    scan(file, await (await request.get(file)).text());
  }
  // Values are never printed, only the entry number.
  expect(hits).toEqual([]);
});
