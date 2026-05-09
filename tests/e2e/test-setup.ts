import { test as base } from '@playwright/test';

/**
 * Enhanced Playwright Test fixture with animation suppression.
 * This improves stability by removing unpredictable timing issues.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject CSS to disable all transitions and animations
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          animation-iteration-count: 1 !important;
        }
      `,
    });

    // Auto-wait for network idle on every page load to reduce flakiness
    const originalGoto = page.goto.bind(page);
    page.goto = async (url: string, options?: any) => {
      const response = await originalGoto(url, options);
      await page.waitForLoadState('load');
      return response;
    };

    await use(page);
  },
});

export { expect } from '@playwright/test';
