import { test, expect } from '@playwright/test';

test.describe('OEI home page — smoke (mock mode)', () => {
  test('renders the hero content and language switcher without a backend', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.oei-hero h1')).not.toBeEmpty();
    await expect(page.locator('oei-language-switcher select')).toBeVisible();
    const options = page.locator('oei-language-switcher option');
    await expect(options).toHaveCount(6);
  });

  test('renders the stats bar, domains grid, actualités empty state, resources excerpt and partners row', async ({
    page,
  }) => {
    await page.goto('/');

    // Commitments band stats: 4 entries, all honestly at "0+" since no real figures exist yet.
    const statItems = page.locator('.oei-commitments__stat');
    await expect(statItems).toHaveCount(4);
    await expect(page.locator('.oei-commitments__stat-value').first()).toHaveText('0+');

    // Domains grid: the 8 fixed domain areas from the mock adapter.
    await expect(page.locator('.oei-domains__card')).toHaveCount(8);

    // Actualités: mock adapter returns no news yet, so the honest empty state shows
    // (default page language is English; wording differs from the French copy).
    await expect(page.locator('.oei-news__empty')).toContainText(/no news has been published/i);
    await expect(page.locator('.oei-news__list')).toHaveCount(0);

    // Ressources excerpt: 3 links truncated from the full list, plus a "view all" link.
    await expect(page.locator('.oei-resources-excerpt__item')).toHaveCount(3);
    await expect(page.locator('.oei-resources-excerpt__view-all')).toHaveAttribute('href', '/ressources');

    // Partners row: the mock adapter returns demo partners, so the section is present.
    await expect(page.locator('.oei-partners')).toBeVisible();
    await expect(page.locator('.oei-partners__logo').first()).toBeVisible();
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
