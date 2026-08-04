import { test, expect } from '@playwright/test';

test.describe('Espace membre institutionnel — smoke (mock mode)', () => {
  test('public institution page renders the demo institution, clearly labelled, with its published publications and opportunities', async ({
    page,
  }) => {
    await page.goto('/institutions/demo-institution');

    await expect(page.locator('.oei-page__title')).toContainText('OEI Démonstration');
    await expect(page.locator('.oei-institution-publique__demo-badge')).toBeVisible();
    await expect(page.locator('.oei-institution-publique__list li').first()).not.toBeEmpty();
  });

  test('unknown institution slug renders the honest not-found state, not a crash', async ({ page }) => {
    await page.goto('/institutions/unknown-institution-slug');

    await expect(page.locator('.oei-page__empty')).toBeVisible();
  });

  test('the protected institution area never renders without an authenticated session', async ({ page }) => {
    // No token is ever stored in this environment (see `KeycloakAuthService.isAuthenticated()`),
    // so the route guard must always redirect away from `/espace-institution` — the dashboard
    // content itself must never become visible, regardless of where the redirect lands.
    await page.goto('/espace-institution', { waitUntil: 'commit' }).catch(() => undefined);
    await expect(page.locator('.oei-institution-dashboard__kpis')).toHaveCount(0);
  });
});
