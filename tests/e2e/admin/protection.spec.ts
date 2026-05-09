import { test, expect } from '@playwright/test';

test.describe('Admin Route Protection', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from tv-os to login', async ({ page }) => {
    await page.goto('/tv-os');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should prevent unauthorized users from accessing admin API', async ({ request }) => {
    const response = await request.get('/api/admin/channels');
    expect(response.status()).toBe(401);
  });
});
