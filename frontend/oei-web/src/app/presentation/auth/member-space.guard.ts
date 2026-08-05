import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

/**
 * Route guard protecting `/espace-membre/**`. Checks `KeycloakAuthService.isAuthenticated()`,
 * which now reflects a real, non-expired Keycloak access token (see that service's doc comment
 * for the exact flow and known limitations) — and, when not authenticated, triggers the real
 * Keycloak Authorization Code + PKCE login redirect and blocks the navigation.
 */
export const memberSpaceGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);

  if (keycloakAuth.isAuthenticated()) {
    return true;
  }

  keycloakAuth.login();
  return false;
};
