import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemberBootstrapPort } from '../../domain/port/profile/member-bootstrap.port';
import { MemberBootstrap } from '../../domain/model/profile/member-bootstrap';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const MEMBER_API_BASE = '/api/member/v1';

/**
 * HTTP adapter for {@link MemberBootstrapPort}.
 *
 * Calls GET /api/member/v1/bootstrap — served by {@code MemberProfileResource#getMemberBootstrap()}
 * on the backend. Returns the full bootstrap state (profileStatus, membershipStatus, profileId)
 * so the frontend can decide the landing experience without additional API calls.
 */
@Service()
export class MemberBootstrapApiAdapter extends MemberBootstrapPort {
  private readonly http = inject(HttpClient);

  override getBootstrap(): Observable<MemberBootstrap> {
    return this.http.get<MemberBootstrap>(`${MEMBER_API_BASE}/bootstrap`);
  }
}

