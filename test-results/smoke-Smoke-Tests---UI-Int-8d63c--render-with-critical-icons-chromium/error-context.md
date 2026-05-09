# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Tests - UI Integrity >> home page should render with critical icons
- Location: tests\e2e\smoke.spec.ts:4:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "INES TV"
Received string:    "Matchs en Direct"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    8 × locator resolved to <h1 class="font-black italic tracking-tighter uppercase">Matchs en Direct</h1>
      - unexpected value "Matchs en Direct"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - button "Menu principal" [ref=e5] [cursor=pointer]:
          - img [ref=e6]
        - generic [ref=e7]: INES TV
        - navigation [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /
          - button "Sports" [ref=e10] [cursor=pointer]:
            - text: Sports
            - img [ref=e11]
          - link "Live TV" [ref=e13] [cursor=pointer]:
            - /url: /live
          - link "Schedule" [ref=e14] [cursor=pointer]:
            - /url: /schedule
      - textbox "Rechercher une chaîne..." [ref=e17]
      - generic [ref=e18]:
        - button "Login" [ref=e19] [cursor=pointer]
        - button "Sign up" [ref=e20] [cursor=pointer]
    - generic [ref=e21]:
      - generic [ref=e22]:
        - heading "Matchs en Direct" [level=1] [ref=e27]
        - paragraph [ref=e28]: Real-time analytics engine • Powered by INES TV
      - region "5 matchs en direct" [ref=e29]:
        - paragraph [ref=e31]: 5 matchs en direct
        - generic [ref=e33]:
          - link "Live 67' Ligue 1 P O 2 1 Paris Saint-Germain vs Olympique de Marseille Ligue 1 • Matchday" [ref=e34] [cursor=pointer]:
            - /url: /watch/1
            - generic [ref=e35]:
              - generic [ref=e36]: Live
              - generic [ref=e37]: 67'
            - generic [ref=e38]: Ligue 1
            - generic [ref=e39]:
              - generic [ref=e41]: P
              - generic [ref=e43]: O
              - img [ref=e46]
              - generic [ref=e48]:
                - generic [ref=e49]: "2"
                - generic [ref=e51]: "1"
            - generic [ref=e52]:
              - heading "Paris Saint-Germain vs Olympique de Marseille" [level=3] [ref=e53]
              - paragraph [ref=e54]: Ligue 1 • Matchday
          - link "Live 23' La Liga R F 0 0 Real Madrid vs FC Barcelona La Liga • Matchday" [ref=e55] [cursor=pointer]:
            - /url: /watch/2
            - generic [ref=e56]:
              - generic [ref=e57]: Live
              - generic [ref=e58]: 23'
            - generic [ref=e59]: La Liga
            - generic [ref=e60]:
              - generic [ref=e62]: R
              - generic [ref=e64]: F
              - img [ref=e67]
              - generic [ref=e69]:
                - generic [ref=e70]: "0"
                - generic [ref=e72]: "0"
            - generic [ref=e73]:
              - heading "Real Madrid vs FC Barcelona" [level=3] [ref=e74]
              - paragraph [ref=e75]: La Liga • Matchday
          - link "Live 89' Premier League M A 1 2 Manchester City vs Arsenal Premier League • Matchday" [ref=e76] [cursor=pointer]:
            - /url: /watch/3
            - generic [ref=e77]:
              - generic [ref=e78]: Live
              - generic [ref=e79]: 89'
            - generic [ref=e80]: Premier League
            - generic [ref=e81]:
              - generic [ref=e83]: M
              - generic [ref=e85]: A
              - img [ref=e88]
              - generic [ref=e90]:
                - generic [ref=e91]: "1"
                - generic [ref=e93]: "2"
            - generic [ref=e94]:
              - heading "Manchester City vs Arsenal" [level=3] [ref=e95]
              - paragraph [ref=e96]: Premier League • Matchday
          - link "PAUSED Bundesliga B B 3 1 Bayern Munich vs Borussia Dortmund Bundesliga • Matchday" [ref=e97] [cursor=pointer]:
            - /url: /watch/4
            - generic [ref=e99]: PAUSED
            - generic [ref=e100]: Bundesliga
            - generic [ref=e101]:
              - generic [ref=e103]: B
              - generic [ref=e105]: B
              - img [ref=e108]
              - generic [ref=e110]:
                - generic [ref=e111]: "3"
                - generic [ref=e113]: "1"
            - generic [ref=e114]:
              - heading "Bayern Munich vs Borussia Dortmund" [level=3] [ref=e115]
              - paragraph [ref=e116]: Bundesliga • Matchday
          - link "Live 12' Serie A J I 0 1 Juventus vs Inter Milan Serie A • Matchday" [ref=e117] [cursor=pointer]:
            - /url: /watch/5
            - generic [ref=e118]:
              - generic [ref=e119]: Live
              - generic [ref=e120]: 12'
            - generic [ref=e121]: Serie A
            - generic [ref=e122]:
              - generic [ref=e124]: J
              - generic [ref=e126]: I
              - img [ref=e129]
              - generic [ref=e131]:
                - generic [ref=e132]: "0"
                - generic [ref=e134]: "1"
            - generic [ref=e135]:
              - heading "Juventus vs Inter Milan" [level=3] [ref=e136]
              - paragraph [ref=e137]: Serie A • Matchday
    - generic [ref=e139]:
      - generic [ref=e140]:
        - generic [ref=e141]:
          - heading "INES TV" [level=3] [ref=e142]
          - paragraph [ref=e143]: Plateforme de streaming sports & TV en temps réel
        - generic [ref=e144]:
          - heading "Navigation" [level=4] [ref=e145]
          - list [ref=e146]:
            - listitem [ref=e147]:
              - link "Live" [ref=e148] [cursor=pointer]:
                - /url: /live
            - listitem [ref=e149]:
              - link "Programme" [ref=e150] [cursor=pointer]:
                - /url: /schedule
            - listitem [ref=e151]:
              - link "Catégories" [ref=e152] [cursor=pointer]:
                - /url: /categories
        - generic [ref=e153]:
          - heading "Sports" [level=4] [ref=e154]
          - list [ref=e155]:
            - listitem [ref=e156]: Football
            - listitem [ref=e157]: Basketball
            - listitem [ref=e158]: Tennis
        - generic [ref=e159]:
          - heading "Legal" [level=4] [ref=e160]
          - list [ref=e161]:
            - listitem [ref=e162]:
              - link "Privacy" [ref=e163] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e164]:
              - link "Terms" [ref=e165] [cursor=pointer]:
                - /url: /terms
      - paragraph [ref=e167]: © 2026 INES TV
  - alert [ref=e168]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Smoke Tests - UI Integrity', () => {
  4  |   test('home page should render with critical icons', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Check for logo/title
> 8  |     await expect(page.locator('h1')).toContainText('INES TV');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  |     
  10 |     // Check if Lucide icons are rendered (usually as <svg class="lucide ...">)
  11 |     const icons = page.locator('svg.lucide');
  12 |     const count = await icons.count();
  13 |     expect(count).toBeGreaterThan(0);
  14 |     
  15 |     // Check for search bar
  16 |     await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  17 |   });
  18 | 
  19 |   test('admin route should redirect to login', async ({ page }) => {
  20 |     // Middleware should catch this
  21 |     await page.goto('/admin');
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | 
  25 |   test('tv-os route should redirect to login', async ({ page }) => {
  26 |     // Middleware should catch this
  27 |     await page.goto('/tv-os');
  28 |     await expect(page).toHaveURL(/\/login/);
  29 |   });
  30 | });
  31 | 
```