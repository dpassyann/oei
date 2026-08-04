import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemberPort } from '../../domain/port/identity/member.port';
import { Member } from '../../domain/model/identity/member';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const MEMBER_API_BASE = '/api/member/v1';

@Service()
export class MemberApiAdapter implements MemberPort {
  private readonly http = inject(HttpClient);

  getCurrentMember(): Observable<Member> {
    return this.http.get<Member>(`${MEMBER_API_BASE}/members/me`);
  }
}
