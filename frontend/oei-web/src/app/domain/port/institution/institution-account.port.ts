import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Institution } from '../../model/institution/institution';
import { Partnership } from '../../model/institution/partnership';

// Compte institutionnel de l'institution de l'utilisateur connecté — résolu depuis le token
// (isolation multi-tenant, voir docs/architecture/keycloak-roles.md). Correspond à
// `GET/PUT /api/institution/v1/account` et `GET /api/institution/v1/partnership`.
export interface InstitutionAccountPort {
  getMyInstitution(): Observable<Institution>;
  updateMyInstitution(institution: Institution): Observable<Institution>;
  getMyPartnership(): Observable<Partnership>;
}

export const INSTITUTION_ACCOUNT_PORT = new InjectionToken<InstitutionAccountPort>('InstitutionAccountPort');
