import { test, expect } from '../test-setup';

test.describe('Keyboard Navigation', () => {
  test('should navigate header links using Tab key', async ({ page }) => {
    await page.goto('/');
    
    // Initial Focus (usually on body or first link)
    await page.keyboard.press('Tab');
    
    // Test sequential focus on main navigation items
    // Assuming the first visible interactive element is the Logo link
    const homeLink = page.getByRole('link', { name: /logo/i }).or(page.getByRole('link', { name: /ines tv/i }));
    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeFocused();
    }

    // Tab through to TV Mode
    await page.keyboard.press('Tab');
    const tvLink = page.getByRole('link', { name: /tv/i });
    await expect(tvLink).toBeFocused();
    
    // Tab to OS link
    await page.keyboard.press('Tab');
    const osLink = page.getByRole('link', { name: /os/i });
    await expect(osLink).toBeFocused();
  });

  test('should focus search bar with Tab', async ({ page }) => {
    await page.goto('/');
    
    // Target the search input specifically
    const searchInput = page.getByPlaceholder(/Rechercher/i);
    
    // Navigate until search is focused
    let focused = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      if (await searchInput.isFocused()) {
        focused = true;
        break;
      }
    }
    
    expect(focused).toBeTruthy();
  });
});
