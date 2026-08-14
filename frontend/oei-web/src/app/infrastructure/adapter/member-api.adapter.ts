import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemberPort } from '../../domain/port/identity/member.port';
import { Member } from '../../domain/model/identity/member';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const MEMBER_API_BASE = '/api/member/v1';

// No `getCurrentMember`-style operation exists anywhere in the current OpenAPI contract:
// `Member` (id/publicSlug/displayName/legalName/locale/country/createdAt/membership) is
// only ever returned by `POST /api/public/v1/accounts` (account registration) and
// `GET /api/admin/v1/members` (admin oversight) — there is no member-scoped "read my own
// Member resource" endpoint under `/api/member/v1/**`. `/api/member/v1/profile` returns a
// different schema (`ProfessionalProfile`, no `displayName`/`publicSlug`/`legalName`).
// `GET /api/member/v1/members/me` below is therefore a documented gap/assumption, not a
// confirmed contract path — kept as the most plausible convention pending a real backend
// operation, same spirit as the (now-confirmed) `PublicProfileApiAdapter.getBySlug` used to
// be before its endpoint existed.
@Service()
export class MemberApiAdapter implements MemberPort {
  private readonly http = inject(HttpClient);

  getCurrentMember(): Observable<Member> {
    return this.http.get<Member>(`${MEMBER_API_BASE}/members/me`);
  }
}
