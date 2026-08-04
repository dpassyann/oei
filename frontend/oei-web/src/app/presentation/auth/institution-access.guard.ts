import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

// Garde de route simple pour `/espace-institution` (doc 03) : redirige vers le login Keycloak
// si l'utilisateur n'a pas de session — voir `KeycloakAuthService.isAuthenticated()` pour la
// limite honnête de cette vérification tant que l'échange de token n'est pas implémenté.
export const institutionAccessGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);
  if (keycloakAuth.isAuthenticated()) {
    return true;
  }
  keycloakAuth.login();
  return false;
};
