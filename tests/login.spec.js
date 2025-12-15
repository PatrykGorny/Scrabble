const { test, expect } = require('@playwright/test');

test('login and redirect to profile', async ({ page }) => {
  // Przejdź do strony logowania
  await page.goto('http://localhost:3000/user/signin');

  // Wypełnij formularz
  await page.getByLabel('Email').fill('patryk.gorny@microsoft.wsei.edu.pl');
  await page.getByLabel('Hasło').fill('zaq123');

  // Kliknij przycisk logowania
  await page.getByTestId('login-submit').click();

  // ✅ CZYSTE POPRAWKI PONIŻEJ ✅

  // 1. Poczekaj na zmianę URL po zalogowaniu (np. na dashboard / stronę główną)
  //    – dostosuj ten URL do rzeczywistej strony docelowej po zalogowaniu!
  await page.waitForURL('http://localhost:3000/**', { timeout: 20000 });

  // 2. (Opcjonalnie) poczekaj na wskaźnik zalogowanego użytkownika — np. avatar, dropdown, nav
  //    Przykład: jeśli w nawigacji pojawia się np. data-testid="user-nav"
  // await page.getByTestId('user-nav').waitFor({ state: 'visible', timeout: 15000 });

  // 3. Bezpieczniejsze oczekiwanie na link "Profil"
  const profileLink = page.getByRole('link', { name: 'Profil', exact: true });
  
  // Czekaj wyraźnie na jego widoczność (WebKit często potrzebuje tego jawnie)
  await profileLink.waitFor({ state: 'visible', timeout: 20000 });

  // Debug: jeśli test się wywali, zrób screenshot i zapisz HTML
  try {
    await profileLink.click({ timeout: 15000 });
  } catch (error) {
    await page.screenshot({ path: 'error-click-profile-link.png' });
    await page.context().tracing.stop({ path: 'trace-profile-click.zip' });
    throw error;
  }

  // 4. Poczekaj na załadowanie strony profilu
  await page.waitForURL('http://localhost:3000/user/profile', { timeout: 20000 });

  // 5. Upewnij się, że zawartość się załadowała (np. nagłówek)
  const profileHeading = page.getByRole('heading', { name: 'Profil użytkownika', exact: true });
  await profileHeading.waitFor({ state: 'visible', timeout: 15000 });

  // ✅ Assertiony
  await expect(page).toHaveURL('http://localhost:3000/user/profile');
  await expect(profileHeading).toBeVisible();

  // Opcjonalnie: screenshot końcowy
  await page.screenshot({ path: 'after-login.png', fullPage: true });
});