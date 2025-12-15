const { test, expect } = require('@playwright/test');

test('redirect unauthenticated user to login', async ({ page }) => {
  // Spróbuj wejść na chronioną stronę profilu bez logowania
  await page.goto('http://localhost:3000/user/profile');
  
  // Sprawdź czy zostałeś przekierowany do strony logowania
  await expect(page).toHaveURL(/.*user\/signin.*/);
  
  // Sprawdź czy jest formularz logowania
    await expect(page.locator('h2', { hasText: 'Logowanie' }))
  .toBeVisible();
});