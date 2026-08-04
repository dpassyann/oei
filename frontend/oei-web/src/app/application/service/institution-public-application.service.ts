import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_PUBLIC_PORT } from '../../domain/port/institution/institution-public.port';
import { InstitutionPublicPage } from '../../domain/model/institution/institution-public-page';

@Service()
export class InstitutionPublicApplicationService {
  private readonly port = inject(INSTITUTION_PUBLIC_PORT);

  getPublicInstitution(slug: string): Observable<InstitutionPublicPage> {
    return this.port.getPublicInstitution(slug);
  }
}
