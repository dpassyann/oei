import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

/**
 * Protects `/cms/**`: only `member`/`admin` (the existing Keycloak roles — no new CMS-specific
 * role was introduced, per ADR 0002 and this task's brief) may reach the back-office. Anyone else
 * is redirected to the public home page rather than shown an empty/broken back-office.
 *
 * `KeycloakAuthService.hasAnyRole()` decodes the real access token's `realm_access.roles` claim
 * (see that service's doc comment) — no mocked session is involved anymore.
 */
export const cmsGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);
  const router = inject(Router);

  if (keycloakAuth.hasAnyRole(['member', 'admin'])) {
    return true;
  }
  return router.createUrlTree(['/']);
};
