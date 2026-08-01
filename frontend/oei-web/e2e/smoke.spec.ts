import { test, expect } from '@playwright/test';

test.describe('OEI home page — smoke (mock mode)', () => {
  test('renders the hero content and language switcher without a backend', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.oei-hero h1')).not.toBeEmpty();
    await expect(page.locator('oei-language-switcher select')).toBeVisible();
    const options = page.locator('oei-language-switcher option');
    await expect(options).toHaveCount(6);
  });

  test('switching language re-renders interface strings', async ({ page }) => {
    await page.goto('/');
    const heroHeading = page.locator('.oei-hero h1');
    // Establish a known starting locale explicitly rather than relying on
    // whatever the app's default happens to be, so this test stays valid
    // regardless of which language loads first.
    await page.locator('oei-language-switcher select').selectOption('fr');
    // Wait for the French content to actually load (async, mock-adapter-backed)
    // before capturing it — selecting an option doesn't itself wait for the
    // resulting content fetch to settle.
    await expect(heroHeading).not.toContainText(/digital trust/i);
    const frenchTitle = await heroHeading.textContent();
    await page.locator('oei-language-switcher select').selectOption('en');
    await expect(page.locator('.oei-cta-join')).toHaveText(/join/i);
    await expect(heroHeading).not.toHaveText(frenchTitle ?? '');
    await expect(heroHeading).toContainText(/digital trust/i);
  });
});
