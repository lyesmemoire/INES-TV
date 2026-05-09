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
    8 × unexpected value "http://localhost:3000/"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - button "Menu principal" [ref=e5] [cursor=pointer]:
          - img [ref=e6]
        - generic [ref=e10]: INES TV
        - navigation [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /
          - button "Sports" [ref=e13] [cursor=pointer]:
            - text: Sports
            - img [ref=e14]
          - link "Live TV" [ref=e16] [cursor=pointer]:
            - /url: /live
          - link "Schedule" [ref=e17] [cursor=pointer]:
            - /url: /schedule
      - generic [ref=e19]:
        - textbox "Rechercher une chaîne..." [active] [ref=e20]: Real Madrid
        - paragraph [ref=e22]: Aucun résultat trouvé.
      - generic [ref=e23]:
        - button "Login" [ref=e24] [cursor=pointer]
        - button "Sign up" [ref=e25] [cursor=pointer]
    - generic [ref=e26]:
      - generic [ref=e27]:
        - heading "Matchs en Direct" [level=1] [ref=e32]
        - paragraph [ref=e33]: Real-time analytics engine • Powered by INES TV
      - region "5 matchs en direct" [ref=e34]:
        - paragraph [ref=e36]: 5 matchs en direct
        - generic [ref=e38]:
          - link "Live 67' Ligue 1 P O 2 1 Paris Saint-Germain vs Olympique de Marseille Ligue 1 • Matchday" [ref=e39] [cursor=pointer]:
            - /url: /watch/1
            - generic [ref=e40]:
              - generic [ref=e41]: Live
              - generic [ref=e42]: 67'
            - generic [ref=e43]: Ligue 1
            - generic [ref=e44]:
              - generic [ref=e46]: P
              - generic [ref=e48]: O
              - img [ref=e51]
              - generic [ref=e53]:
                - generic [ref=e54]: "2"
                - generic [ref=e56]: "1"
            - generic [ref=e57]:
              - heading "Paris Saint-Germain vs Olympique de Marseille" [level=3] [ref=e58]
              - paragraph [ref=e59]: Ligue 1 • Matchday
          - link "Live 23' La Liga R F 0 0 Real Madrid vs FC Barcelona La Liga • Matchday" [ref=e60] [cursor=pointer]:
            - /url: /watch/2
            - generic [ref=e61]:
              - generic [ref=e62]: Live
              - generic [ref=e63]: 23'
            - generic [ref=e64]: La Liga
            - generic [ref=e65]:
              - generic [ref=e67]: R
              - generic [ref=e69]: F
              - img [ref=e72]
              - generic [ref=e74]:
                - generic [ref=e75]: "0"
                - generic [ref=e77]: "0"
            - generic [ref=e78]:
              - heading "Real Madrid vs FC Barcelona" [level=3] [ref=e79]
              - paragraph [ref=e80]: La Liga • Matchday
          - link "Live 89' Premier League M A 1 2 Manchester City vs Arsenal Premier League • Matchday" [ref=e81] [cursor=pointer]:
            - /url: /watch/3
            - generic [ref=e82]:
              - generic [ref=e83]: Live
              - generic [ref=e84]: 89'
            - generic [ref=e85]: Premier League
            - generic [ref=e86]:
              - generic [ref=e88]: M
              - generic [ref=e90]: A
              - img [ref=e93]
              - generic [ref=e95]:
                - generic [ref=e96]: "1"
                - generic [ref=e98]: "2"
            - generic [ref=e99]:
              - heading "Manchester City vs Arsenal" [level=3] [ref=e100]
              - paragraph [ref=e101]: Premier League • Matchday
          - link "PAUSED Bundesliga B B 3 1 Bayern Munich vs Borussia Dortmund Bundesliga • Matchday" [ref=e102] [cursor=pointer]:
            - /url: /watch/4
            - generic [ref=e104]: PAUSED
            - generic [ref=e105]: Bundesliga
            - generic [ref=e106]:
              - generic [ref=e108]: B
              - generic [ref=e110]: B
              - img [ref=e113]
              - generic [ref=e115]:
                - generic [ref=e116]: "3"
                - generic [ref=e118]: "1"
            - generic [ref=e119]:
              - heading "Bayern Munich vs Borussia Dortmund" [level=3] [ref=e120]
              - paragraph [ref=e121]: Bundesliga • Matchday
          - link "Live 12' Serie A J I 0 1 Juventus vs Inter Milan Serie A • Matchday" [ref=e122] [cursor=pointer]:
            - /url: /watch/5
            - generic [ref=e123]:
              - generic [ref=e124]: Live
              - generic [ref=e125]: 12'
            - generic [ref=e126]: Serie A
            - generic [ref=e127]:
              - generic [ref=e129]: J
              - generic [ref=e131]: I
              - img [ref=e134]
              - generic [ref=e136]:
                - generic [ref=e137]: "0"
                - generic [ref=e139]: "1"
            - generic [ref=e140]:
              - heading "Juventus vs Inter Milan" [level=3] [ref=e141]
              - paragraph [ref=e142]: Serie A • Matchday
    - generic [ref=e144]:
      - generic [ref=e145]:
        - generic [ref=e146]:
          - heading "INES TV" [level=3] [ref=e147]
          - paragraph [ref=e148]: Plateforme de streaming sports & TV en temps réel
        - generic [ref=e149]:
          - heading "Navigation" [level=4] [ref=e150]
          - list [ref=e151]:
            - listitem [ref=e152]:
              - link "Live" [ref=e153] [cursor=pointer]:
                - /url: /live
            - listitem [ref=e154]:
              - link "Programme" [ref=e155] [cursor=pointer]:
                - /url: /schedule
            - listitem [ref=e156]:
              - link "Catégories" [ref=e157] [cursor=pointer]:
                - /url: /categories
        - generic [ref=e158]:
          - heading "Sports" [level=4] [ref=e159]
          - list [ref=e160]:
            - listitem [ref=e161]: Football
            - listitem [ref=e162]: Basketball
            - listitem [ref=e163]: Tennis
        - generic [ref=e164]:
          - heading "Legal" [level=4] [ref=e165]
          - list [ref=e166]:
            - listitem [ref=e167]:
              - link "Privacy" [ref=e168] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e169]:
              - link "Terms" [ref=e170] [cursor=pointer]:
                - /url: /terms
      - paragraph [ref=e172]: © 2026 INES TV
  - alert [ref=e173]
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