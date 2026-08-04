import { test, expect } from '@playwright/test';

test.describe('Adhésion & cotisation — smoke (mock mode)', () => {
  test('not authenticated: clicking "Join the movement" reaches the free account-creation page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.oei-cta-join').click();
    await expect(page).toHaveURL(/\/inscription$/);
    await expect(page.locator('.oei-inscription__free-notice')).toBeVisible();
  });

  test('completing the free registration form offers both "pay now" and "later" choices', async ({ page }) => {
    await page.goto('/inscription');

    await page.locator('input[name="email"]').fill('jane.doe@example.com');
    await page.locator('input[name="country"]').fill('FR');
    await page.locator('input[name="consent"]').check();
    await page.locator('.oei-inscription__form button[type="submit"]').click();

    await expect(page.locator('a[href="/espace-membre/cotisation"]')).toBeVisible();
    await expect(page.locator('a[href="/espace-membre/profil"]')).toBeVisible();
  });

  test.describe('authenticated member with an unpaid current cycle', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => sessionStorage.setItem('oei_mock_session_roles', JSON.stringify(['member'])));
    });

    test('clicking "Join the movement" routes to the cotisation payment page', async ({ page }) => {
      await page.goto('/');
      await page.locator('.oei-cta-join').click();
      await expect(page).toHaveURL(/\/espace-membre\/cotisation$/);
      await expect(page.locator('.oei-cotisation__amount-value')).toBeVisible();
    });

    test('paying the prorated cotisation simulates a successful payment', async ({ page }) => {
      await page.goto('/espace-membre/cotisation');
      await expect(page.locator('.oei-cotisation__amount-value')).toBeVisible();

      await page.locator('input[name="cardNumber"]').fill('4242 4242 4242 4242');
      await page.locator('.oei-cotisation__form button[type="submit"]').click();

      await expect(page.locator('.oei-cotisation__payment-success')).toBeVisible();
    });

    test('the espace membre profile page shows a read-only banner and disables editing until paid', async ({ page }) => {
      await page.goto('/espace-membre/profil');

      await expect(page.locator('.oei-read-only-banner')).toBeVisible();
      const editButton = page.locator('.oei-profil__view button');
      await expect(editButton).toBeDisabled();
    });
  });
});
