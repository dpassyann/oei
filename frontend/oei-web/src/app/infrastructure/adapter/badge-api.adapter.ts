import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BadgePort } from '../../domain/port/badge/badge.port';
import { BadgeAward } from '../../domain/model/badge/badge';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const BADGE_API_BASE = '/api/member/v1';

@Service()
export class BadgeApiAdapter implements BadgePort {
  private readonly http = inject(HttpClient);

  listMyBadgeAwards(): Observable<BadgeAward[]> {
    return this.http.get<BadgeAward[]>(`${BADGE_API_BASE}/badges`);
  }
}
