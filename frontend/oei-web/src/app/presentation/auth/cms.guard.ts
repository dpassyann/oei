import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

/**
 * Protects `/cms/**`: only `member`/`admin` (the existing Keycloak roles — no new CMS-specific
 * role was introduced, per ADR 0002 and this task's brief) may reach the back-office. Anyone else
 * is redirected to the public home page rather than shown an empty/broken back-office.
 *
 * See `KeycloakAuthService.getSessionRoles()` for why this reads a mocked session signal rather
 * than a real decoded JWT: the OIDC callback/token-exchange step has not been implemented yet
 * (out of scope, per `keycloak-auth.service.ts`'s own top-level note).
 */
export const cmsGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);
  const router = inject(Router);

  if (keycloakAuth.hasAnyRole(['member', 'admin'])) {
    return true;
  }
  return router.createUrlTree(['/']);
};
