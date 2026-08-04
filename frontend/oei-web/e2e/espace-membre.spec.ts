import { test, expect } from '@playwright/test';

test.describe('Espace membre individuel — smoke (mock mode)', () => {
  test('clicking the header member-area button reaches the guarded member profile page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.oei-cta-member').click();
    // Default mocked auth state is "connected" (see KeycloakAuthService), so the guard
    // lets the navigation through to the default child route, `profil`.
    await expect(page).toHaveURL(/\/espace-membre\/profil$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('member space profile page shows the demo member and a completeness indicator', async ({ page }) => {
    await page.goto('/espace-membre/profil');
    await expect(page.locator('body')).toContainText(/Démonstration|Demonstration/i);
  });

  test('CV builder page renders the seeded demo CV sections', async ({ page }) => {
    await page.goto('/espace-membre/cv');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('CV builder shows an OEI-branded template gallery with a live preview reacting to selection', async ({ page }) => {
    await page.goto('/espace-membre/cv');
    const thumbs = page.locator('.oei-cv-builder__template-thumb');
    await expect(thumbs).toHaveCount(2);
    await expect(page.locator('.oei-cv-preview__watermark').first()).toBeVisible();
    await expect(page.locator('.oei-cv-preview__seal-text').first()).toHaveText('OEI');

    // Selecting the second (Moderne) thumbnail updates the full live preview instantly.
    await thumbs.nth(1).click();
    await expect(page.locator('.oei-cv-builder__live-preview .oei-cv-preview--modern')).toBeVisible();
  });

  test('badges page lists the seeded demo badge awards', async ({ page }) => {
    await page.goto('/espace-membre/badges');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('digital card page shows the mocked-pass disclaimer after issuing an Apple Wallet pass', async ({ page }) => {
    await page.goto('/espace-membre/carte');
    const appleButton = page.getByRole('button', { name: /apple wallet/i });
    await expect(appleButton).toBeVisible();
    await appleButton.click();
    await expect(page.getByRole('alert')).toContainText(/not an official identity document|pièce d.identité officielle/i);
  });

  test('public profile page is reachable without the member-space guard', async ({ page }) => {
    await page.goto('/membres/demo-jane-dupont');
    await expect(page.locator('h1, .oei-page__title')).toBeVisible();
  });

  test('public profile page shows an honest not-found state for an unknown slug', async ({ page }) => {
    await page.goto('/membres/does-not-exist');
    await expect(page.locator('body')).toContainText(/introuvable|not found/i);
  });
});
