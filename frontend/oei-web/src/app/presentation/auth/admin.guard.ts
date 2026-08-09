import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';
import { ADMIN_ROLES } from '../../domain/model/admin/admin-role';

/**
 * Protects `/admin/**`: only one of the 8 admin realm roles listed in `ADMIN_ROLES`
 * (`domain/model/admin/admin-role.ts`, see `.prompt/plan/final/03-ADMIN-CONSOLE.md` §RBAC) may
 * reach the admin console shell. Anyone else is redirected to the public home page, exactly like
 * `cms.guard.ts` — this guard only decides whether the *shell* is reachable; which sidebar
 * sections a given role actually sees is filtered separately by `canAccessSection` /
 * `visibleSections`, used by `AdminLayout`.
 *
 * As documented on `KeycloakAuthService.hasAnyRole()`, this reads the real access token's
 * `realm_access.roles` claim — no mocked session. Per the task brief's §Sécurité ("Aucun contrôle
 * d'accès ne repose seulement sur l'UI"), this client-side guard is a UX convenience only; every
 * admin endpoint must independently enforce its own role requirement server-side.
 */
export const adminGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);
  const router = inject(Router);

  if (keycloakAuth.hasAnyRole(ADMIN_ROLES)) {
    return true;
  }
  return router.createUrlTree(['/']);
};
