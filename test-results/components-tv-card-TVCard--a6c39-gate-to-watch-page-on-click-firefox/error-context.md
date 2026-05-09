# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\tv-card.spec.ts >> TVCard Component >> should navigate to watch page on click
- Location: tests\e2e\components\tv-card.spec.ts:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.getAttribute: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.card').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic [ref=e4]:
      - heading "TV Mode" [level=1] [ref=e5]
      - generic [ref=e6]: 0 channels
    - generic [ref=e8]:
      - generic [ref=e9]: 📺
      - heading "No Channels Available" [level=2] [ref=e10]
      - paragraph [ref=e11]: Check back later for live content
    - generic [ref=e12]:
      - generic [ref=e13]: Ready
      - generic [ref=e14]: 1 / 0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('TVCard Component', () => {
  4  |   test('should display channel name and logo correctly', async ({ page }) => {
  5  |     await page.goto('/tv');
  6  |     
  7  |     // Find first TV Card
  8  |     const tvCard = page.locator('.card').first();
  9  |     await expect(tvCard).toBeVisible();
  10 |     
  11 |     // Check for Image component (rendered as img with specific next.js patterns)
  12 |     const logo = tvCard.locator('img');
  13 |     await expect(logo).toBeVisible();
  14 |     await expect(logo).toHaveAttribute('src', /^\/_next\/image/);
  15 |     
  16 |     // Check for title
  17 |     const title = tvCard.locator('.card__title');
  18 |     await expect(title).not.toBeEmpty();
  19 |   });
  20 | 
  21 |   test('should navigate to watch page on click', async ({ page }) => {
  22 |     await page.goto('/tv');
  23 |     const tvCard = page.locator('.card').first();
> 24 |     const href = await tvCard.getAttribute('href');
     |                               ^ Error: locator.getAttribute: Test timeout of 30000ms exceeded.
  25 |     
  26 |     await tvCard.click();
  27 |     await expect(page).toHaveURL(new RegExp(href || ''));
  28 |   });
  29 | });
  30 | 
```