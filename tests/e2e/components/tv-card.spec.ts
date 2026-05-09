import { test, expect } from '../test-setup';
import { MOCK_CHANNELS } from '../../fixtures/test-data';

test.describe('TVCard Component', () => {
  test.beforeEach(async ({ page }) => {
    // 🎭 Mock API to ensure data availability independent of external IPTV services
    await page.route('**/api/channels', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CHANNELS),
      });
    });
  });

  test('should display channel name and logo correctly', async ({ page }) => {
    await page.goto('/tv');
    
    // Find all TV Cards using the stable test-id
    const tvCards = page.getByTestId('tv-card');
    await expect(tvCards).toHaveCount(MOCK_CHANNELS.length);
    
    const firstCard = tvCards.first();
    await expect(firstCard).toBeVisible();
    
    // Check for title using accessible role or class
    const title = firstCard.locator('.card__title');
    await expect(title).toHaveText(MOCK_CHANNELS[0].name);
    
    // Check for Image component logo
    const logo = firstCard.locator('img');
    await expect(logo).toBeVisible();
  });

  test('should focus on hover and click', async ({ page }) => {
    await page.goto('/tv');
    const firstCard = page.getByTestId('tv-card').first();
    
    await firstCard.hover();
    await expect(firstCard).toHaveClass(/card--focused/);
    
    // Navigate on click (opens preview in TV Mode)
    await firstCard.click();
    await expect(page.locator('text=Regarder')).toBeVisible();
  });
});
