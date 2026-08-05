import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';

// Garde de route simple pour `/espace-institution` (doc 03) : redirige vers le login Keycloak
// si l'utilisateur n'a pas de session valide — `KeycloakAuthService.isAuthenticated()` reflète
// désormais un vrai access token Keycloak (voir son commentaire de classe pour les limites
// connues, ex. absence de refresh silencieux).
export const institutionAccessGuard: CanActivateFn = () => {
  const keycloakAuth = inject(KeycloakAuthService);
  if (keycloakAuth.isAuthenticated()) {
    return true;
  }
  keycloakAuth.login();
  return false;
};
