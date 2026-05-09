# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation\keyboard.spec.ts >> Keyboard Navigation >> should allow searching via keyboard
- Location: tests\e2e\navigation\keyboard.spec.ts:21:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /search|Real/
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - button "Menu principal" [ref=e5] [cursor=pointer]:
          - img [ref=e6]
        - generic [ref=e7]: INES TV
        - navigation [ref=e8]:
          - link "Home" [ref=e9]:
            - /url: /
          - button "Sports" [ref=e10] [cursor=pointer]:
            - text: Sports
            - img [ref=e11]
          - link "Live TV" [ref=e13]:
            - /url: /live
          - link "Schedule" [ref=e14]:
            - /url: /schedule
      - generic [ref=e16]:
        - textbox "Rechercher une chaîne..." [active] [ref=e17]: Real Madrid
        - paragraph [ref=e19]: Aucun résultat trouvé.
      - generic [ref=e20]:
        - button "Login" [ref=e21] [cursor=pointer]
        - button "Sign up" [ref=e22] [cursor=pointer]
    - generic [ref=e23]:
      - generic [ref=e24]:
        - heading "Matchs en Direct" [level=1] [ref=e29]
        - paragraph [ref=e30]: Real-time analytics engine • Powered by INES TV
      - region "5 matchs en direct" [ref=e31]:
        - paragraph [ref=e33]: 5 matchs en direct
        - generic [ref=e35]:
          - link "Live 67' Ligue 1 P O 2 1 Paris Saint-Germain vs Olympique de Marseille Ligue 1 • Matchday" [ref=e36]:
            - /url: /watch/1
            - generic [ref=e37]:
              - generic [ref=e38]: Live
              - generic [ref=e39]: 67'
            - generic [ref=e40]: Ligue 1
            - generic [ref=e41]:
              - generic [ref=e43]: P
              - generic [ref=e45]: O
              - img [ref=e48]
              - generic [ref=e50]:
                - generic [ref=e51]: "2"
                - generic [ref=e53]: "1"
            - generic [ref=e54]:
              - heading "Paris Saint-Germain vs Olympique de Marseille" [level=3] [ref=e55]
              - paragraph [ref=e56]: Ligue 1 • Matchday
          - link "Live 23' La Liga R F 0 0 Real Madrid vs FC Barcelona La Liga • Matchday" [ref=e57]:
            - /url: /watch/2
            - generic [ref=e58]:
              - generic [ref=e59]: Live
              - generic [ref=e60]: 23'
            - generic [ref=e61]: La Liga
            - generic [ref=e62]:
              - generic [ref=e64]: R
              - generic [ref=e66]: F
              - img [ref=e69]
              - generic [ref=e71]:
                - generic [ref=e72]: "0"
                - generic [ref=e74]: "0"
            - generic [ref=e75]:
              - heading "Real Madrid vs FC Barcelona" [level=3] [ref=e76]
              - paragraph [ref=e77]: La Liga • Matchday
          - link "Live 89' Premier League M A 1 2 Manchester City vs Arsenal Premier League • Matchday" [ref=e78]:
            - /url: /watch/3
            - generic [ref=e79]:
              - generic [ref=e80]: Live
              - generic [ref=e81]: 89'
            - generic [ref=e82]: Premier League
            - generic [ref=e83]:
              - generic [ref=e85]: M
              - generic [ref=e87]: A
              - img [ref=e90]
              - generic [ref=e92]:
                - generic [ref=e93]: "1"
                - generic [ref=e95]: "2"
            - generic [ref=e96]:
              - heading "Manchester City vs Arsenal" [level=3] [ref=e97]
              - paragraph [ref=e98]: Premier League • Matchday
          - link "PAUSED Bundesliga B B 3 1 Bayern Munich vs Borussia Dortmund Bundesliga • Matchday" [ref=e99]:
            - /url: /watch/4
            - generic [ref=e101]: PAUSED
            - generic [ref=e102]: Bundesliga
            - generic [ref=e103]:
              - generic [ref=e105]: B
              - generic [ref=e107]: B
              - img [ref=e110]
              - generic [ref=e112]:
                - generic [ref=e113]: "3"
                - generic [ref=e115]: "1"
            - generic [ref=e116]:
              - heading "Bayern Munich vs Borussia Dortmund" [level=3] [ref=e117]
              - paragraph [ref=e118]: Bundesliga • Matchday
          - link "Live 12' Serie A J I 0 1 Juventus vs Inter Milan Serie A • Matchday" [ref=e119]:
            - /url: /watch/5
            - generic [ref=e120]:
              - generic [ref=e121]: Live
              - generic [ref=e122]: 12'
            - generic [ref=e123]: Serie A
            - generic [ref=e124]:
              - generic [ref=e126]: J
              - generic [ref=e128]: I
              - img [ref=e131]
              - generic [ref=e133]:
                - generic [ref=e134]: "0"
                - generic [ref=e136]: "1"
            - generic [ref=e137]:
              - heading "Juventus vs Inter Milan" [level=3] [ref=e138]
              - paragraph [ref=e139]: Serie A • Matchday
    - generic [ref=e141]:
      - generic [ref=e142]:
        - generic [ref=e143]:
          - heading "INES TV" [level=3] [ref=e144]
          - paragraph [ref=e145]: Plateforme de streaming sports & TV en temps réel
        - generic [ref=e146]:
          - heading "Navigation" [level=4] [ref=e147]
          - list [ref=e148]:
            - listitem [ref=e149]:
              - link "Live" [ref=e150]:
                - /url: /live
            - listitem [ref=e151]:
              - link "Programme" [ref=e152]:
                - /url: /schedule
            - listitem [ref=e153]:
              - link "Catégories" [ref=e154]:
                - /url: /categories
        - generic [ref=e155]:
          - heading "Sports" [level=4] [ref=e156]
          - list [ref=e157]:
            - listitem [ref=e158]: Football
            - listitem [ref=e159]: Basketball
            - listitem [ref=e160]: Tennis
        - generic [ref=e161]:
          - heading "Legal" [level=4] [ref=e162]
          - list [ref=e163]:
            - listitem [ref=e164]:
              - link "Privacy" [ref=e165]:
                - /url: /privacy
            - listitem [ref=e166]:
              - link "Terms" [ref=e167]:
                - /url: /terms
      - paragraph [ref=e169]: © 2026 INES TV
  - alert [ref=e170]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Keyboard Navigation', () => {
  4  |   test('should be able to navigate the home page using Tab', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Press tab and verify focus is moving
  8  |     await page.keyboard.press('Tab');
  9  |     const activeElement = await page.evaluate(() => document.activeElement?.tagName);
  10 |     expect(activeElement).toBeDefined();
  11 |     
  12 |     // Verify focus visible on interactive elements
  13 |     await page.keyboard.press('Tab');
  14 |     const isFocused = await page.evaluate(() => {
  15 |       const el = document.activeElement;
  16 |       return el && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT');
  17 |     });
  18 |     expect(isFocused).toBeTruthy();
  19 |   });
  20 | 
  21 |   test('should allow searching via keyboard', async ({ page }) => {
  22 |     await page.goto('/');
  23 |     const searchInput = page.locator('input[placeholder*="Rechercher"], input[placeholder*="Search"]');
  24 |     await searchInput.focus();
  25 |     await page.keyboard.type('Real Madrid');
  26 |     await page.keyboard.press('Enter');
  27 |     
  28 |     // Check if URL or content updates
> 29 |     await expect(page).toHaveURL(/search|Real/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  30 |   });
  31 | });
  32 | 
```