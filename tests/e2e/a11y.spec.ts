import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES, WIDTHS } from './routes';

const PAGES = [...ROUTES, '/missing-page/'];

for (const width of WIDTHS) {
  for (const path of PAGES) {
    test(`axe + overflow @ ${width}px ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(0);

      // Scroll-driven reveals (animation-timeline: view()) sit mid-fade wherever the scroll
      // position leaves them, and axe scores whatever frame it catches. Contrast is judged on the
      // settled text, so cancel those scroll-linked effects (and only those) before the scan.
      // Elements that were sitting at opacity 0 below the fold now get checked too.
      await page.evaluate(() => {
        const ST = (window as unknown as { ScrollTimeline?: new () => AnimationTimeline }).ScrollTimeline;
        if (!ST) return;
        for (const a of document.getAnimations()) if (a.timeline instanceof ST) a.cancel();
      });

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
}
