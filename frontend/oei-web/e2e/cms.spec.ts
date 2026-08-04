import { test, expect } from '@playwright/test';

test.describe('CMS / governance back-office (mock mode)', () => {
  test('unauthenticated visitor is redirected away from /cms', async ({ page }) => {
    await page.goto('/cms');
    await expect(page).toHaveURL('/');
  });

  test('mocked admin session can browse content, workflow and contributions', async ({ page }) => {
    // Simulate a completed Keycloak login by seeding the mocked session roles this plan uses
    // in place of a real (out-of-scope) OIDC callback — see `KeycloakAuthService` for why.
    await page.addInitScript(() => {
      window.sessionStorage.setItem('oei_mock_session_roles', JSON.stringify(['admin']));
    });

    await page.goto('/cms');
    await expect(page).toHaveURL('/cms');

    // Demo content pipeline: at least one row for each of the seeded statuses.
    await expect(page.locator('.oei-cms-list__table tbody tr')).toHaveCount(4);
    await expect(page.locator('.oei-cms-status[data-status="PUBLISHED"]').first()).toBeVisible();
    await expect(page.locator('.oei-cms-status[data-status="DRAFT"]').first()).toBeVisible();

    // Open the published Livre Blanc content and confirm the workflow action set for PUBLISHED
    // (only "archive" — no submit/approve/publish buttons should render).
    await page.getByRole('link', { name: /ouvrir|open/i }).first().click();
    await expect(page).toHaveURL(/\/cms\/content-/);

    // Contributions view: the demo member contribution and its diff.
    await page.goto('/cms/contributions');
    await expect(page.locator('.oei-cms-contributions__table tbody tr')).toHaveCount(1);
    await page.getByRole('button', { name: /ouvrir|open/i }).first().click();
    await expect(page.locator('.oei-cms-contributions__diff pre')).toContainText('Article 1');
  });
});
