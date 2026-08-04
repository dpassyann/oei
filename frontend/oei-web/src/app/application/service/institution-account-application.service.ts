import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_ACCOUNT_PORT } from '../../domain/port/institution/institution-account.port';
import { Institution } from '../../domain/model/institution/institution';
import { Partnership } from '../../domain/model/institution/partnership';

@Service()
export class InstitutionAccountApplicationService {
  private readonly port = inject(INSTITUTION_ACCOUNT_PORT);

  getMyInstitution(): Observable<Institution> {
    return this.port.getMyInstitution();
  }

  updateMyInstitution(institution: Institution): Observable<Institution> {
    return this.port.updateMyInstitution(institution);
  }

  getMyPartnership(): Observable<Partnership> {
    return this.port.getMyPartnership();
  }
}
