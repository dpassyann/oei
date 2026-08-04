import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BADGE_PORT } from '../../domain/port/badge/badge.port';
import { BadgeAward } from '../../domain/model/badge/badge';

@Service()
export class BadgeApplicationService {
  private readonly port = inject(BADGE_PORT);

  listMyBadgeAwards(): Observable<BadgeAward[]> {
    return this.port.listMyBadgeAwards();
  }
}
