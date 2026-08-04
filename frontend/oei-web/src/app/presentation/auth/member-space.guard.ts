import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

/**
 * Route guard protecting `/espace-membre/**`. Per the espace-membre-individuel plan,
 * a *real* token verification is out of scope (the Keycloak callback/token-exchange
 * step isn't implemented — see `KeycloakAuthService` doc comment): this guard only
 * checks the service's mocked `isAuthenticated` state and, when "not connected",
 * triggers the existing PKCE login redirect and blocks the navigation.
 */
export const memberSpaceGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);

  if (keycloakAuth.isAuthenticated()) {
    return true;
  }

  keycloakAuth.login();
  return false;
};
