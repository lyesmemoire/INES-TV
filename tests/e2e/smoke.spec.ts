import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - UI Integrity', () => {
  test('home page should render with critical icons', async ({ page }) => {
    await page.goto('/');
    
    // Check for logo/title
    await expect(page.locator('h1')).toContainText('INES TV');
    
    // Check if Lucide icons are rendered (usually as <svg class="lucide ...">)
    const icons = page.locator('svg.lucide');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
    
    // Check for search bar
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('admin route should redirect to login', async ({ page }) => {
    // Middleware should catch this
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('tv-os route should redirect to login', async ({ page }) => {
    // Middleware should catch this
    await page.goto('/tv-os');
    await expect(page).toHaveURL(/\/login/);
  });
});
