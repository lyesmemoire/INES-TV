import { test, expect } from '../test-setup';

test.describe('Authentication Flow', () => {
  test('should show success after submitting valid email', async ({ page }) => {
    await page.goto('/login');
    
    // Use role-based selectors for robustness
    const emailInput = page.getByPlaceholder(/nom@exemple.com/i);
    await emailInput.fill('test@example.com');
    
    const submitBtn = page.getByRole('button', { name: /Envoyer le lien magique/i });
    await submitBtn.click();
    
    // Wait for business logic state change instead of just visibility
    await expect(page.locator('text=Lien envoyé')).toBeVisible({ timeout: 10000 });
    
    // Verify specific success UI elements
    await expect(page.locator('text=Consultez votre boîte mail')).toBeVisible();
  });

  test('should allow trying another email after success', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/nom@exemple.com/i).fill('test@example.com');
    await page.getByRole('button', { name: /Envoyer le lien magique/i }).click();
    
    const retryBtn = page.getByRole('button', { name: /Essayer un autre email/i });
    await expect(retryBtn).toBeVisible();
    
    await retryBtn.click();
    await expect(page.getByPlaceholder(/nom@exemple.com/i)).toBeVisible();
  });
});
