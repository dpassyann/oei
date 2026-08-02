import { Service, inject } from '@angular/core';
import { PARTNER_REPOSITORY_PORT } from '../../domain/port/partner-repository.port';
import { Partner } from '../../domain/model/partner';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `RuntimeConfig` (see infrastructure/config/runtime-config.ts),
// where its availability in the installed @angular/core was confirmed.
@Service()
export class PartnerApplicationService {
  private readonly repository = inject(PARTNER_REPOSITORY_PORT);

  getPartners(): Promise<Partner[]> {
    return this.repository.getPartners();
  }

  getPartner(id: string): Promise<Partner> {
    return this.repository.getPartner(id);
  }
}
