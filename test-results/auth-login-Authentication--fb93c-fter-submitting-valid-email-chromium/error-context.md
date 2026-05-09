# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.ts >> Authentication Flow >> should show success after submitting valid email
- Location: tests\e2e\auth\login.spec.ts:15:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Lien envoyé')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Lien envoyé')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "ITV INES TV" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: ITV
        - generic [ref=e7]: INES TV
      - heading "Bon retour" [level=1] [ref=e8]
      - paragraph [ref=e9]: Identifiez-vous sans mot de passe.
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email Professionnel
        - textbox "nom@exemple.com" [ref=e13]: test@example.com
      - button "Envoyer le lien magique" [ref=e14] [cursor=pointer]
      - paragraph [ref=e15]: En continuant, vous acceptez nos conditions d'utilisation et notre engagement de haute performance.
  - alert [ref=e16]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { TEST_USER } from '../../fixtures/test-data';
  3  | 
  4  | test.describe('Authentication Flow', () => {
  5  |   test('should show error for invalid credentials', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     await page.fill('input[type="email"]', 'invalid-email');
  8  |     await page.click('button[type="submit"]');
  9  |     
  10 |     // The browser native validation might catch this, or we check for absence of "Sent"
  11 |     const isSent = await page.locator('text=Lien envoyé').isVisible();
  12 |     expect(isSent).toBeFalsy();
  13 |   });
  14 | 
  15 |   test('should show success after submitting valid email', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     await page.fill('input[type="email"]', 'test@example.com');
  18 |     await page.click('button[type="submit"]');
  19 |     
> 20 |     await expect(page.locator('text=Lien envoyé')).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  21 |   });
  22 | });
  23 | 
```