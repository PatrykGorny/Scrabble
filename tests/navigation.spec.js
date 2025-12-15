const { test, expect } = require('@playwright/test');

test('has link to login page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Symulacja kliknięcia na link z tekstem "Zaloguj się"
  await page.click("text=Zaloguj się");
  
  // Sprawdzenie, czy została otwarta strona ze ścieżką do formularza logowania
  await expect(page).toHaveURL('http://localhost:3000/user/signin');
  
  // Sprawdzenie, czy na stronie logowania jest nagłówek z tekstem "Logowanie"
  await expect(page.locator('h2', { hasText: 'Logowanie' }))
  .toBeVisible();

});