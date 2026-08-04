import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PARTNER_REPOSITORY_PORT } from '../../domain/port/partner-repository.port';
import { Partner } from '../../domain/model/partner';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `RuntimeConfig` (see infrastructure/config/runtime-config.ts),
// where its availability in the installed @angular/core was confirmed.
//
// Returns `Observable`s (not `Promise`s) — see `src/app/infrastructure/adapter/README.md`
// for the RxJS-end-to-end architecture this service is part of.
@Service()
export class PartnerApplicationService {
  private readonly repository = inject(PARTNER_REPOSITORY_PORT);

  getPartners(lang: string): Observable<Partner[]> {
    return this.repository.getPartners(lang);
  }

  getPartner(id: string, lang: string): Observable<Partner> {
    return this.repository.getPartner(id, lang);
  }
}
