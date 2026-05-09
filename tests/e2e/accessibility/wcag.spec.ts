import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit (WCAG 2.2)', () => {
  test('home page should have no automatically detectable accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be stable
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('watch page should be accessible', async ({ page }) => {
    // Navigate to a specific channel watch page
    await page.goto('/watch/bein_sport_1');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
