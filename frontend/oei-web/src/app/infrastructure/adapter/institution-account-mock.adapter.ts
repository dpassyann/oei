import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InstitutionAccountPort } from '../../domain/port/institution/institution-account.port';
import { Institution } from '../../domain/model/institution/institution';
import { Partnership } from '../../domain/model/institution/partnership';
import { DEMO_INSTITUTION, DEMO_PARTNERSHIP } from './institution-demo-data';

// Isolation multi-tenant mockée : cet adapter ne connaît qu'une institution "courante"
// (`DEMO_INSTITUTION`, cf. `institution-demo-data.ts`) — le vrai backend résoudra
// l'institution depuis le token JWT (voir docs/architecture/keycloak-roles.md).
@Service()
export class InstitutionAccountMockAdapter implements InstitutionAccountPort {
  private institution: Institution = DEMO_INSTITUTION;

  getMyInstitution(): Observable<Institution> {
    return of(this.institution);
  }

  updateMyInstitution(institution: Institution): Observable<Institution> {
    this.institution = institution;
    return of(this.institution);
  }

  getMyPartnership(): Observable<Partnership> {
    return of(DEMO_PARTNERSHIP);
  }
}
