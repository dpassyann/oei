import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MemberPort } from '../../domain/port/identity/member.port';
import { createMember, Member } from '../../domain/model/identity/member';

// Demonstration member used across all member-space mock adapters — explicitly
// labeled as such (never presented as a real account), per the spec requirement on
// honest demo data ("données de démonstration honnêtes").
export const DEMO_MEMBER: Member = createMember({
  id: 'demo-member-1',
  publicSlug: 'demo-jane-dupont',
  displayName: 'Jane Dupont (Démonstration)',
  legalName: 'Jane Marie Dupont',
  locale: 'fr',
  country: 'FR',
  createdAt: '2026-01-15T09:00:00Z',
  membership: {
    memberId: 'demo-member-1',
    tier: 'SILVER',
    status: 'ACTIVE',
    startedAt: '2026-01-15T09:00:00Z',
    renewedAt: '2026-01-15T09:00:00Z',
    endsAt: null,
  },
});

@Service()
export class MemberMockAdapter implements MemberPort {
  getCurrentMember(): Observable<Member> {
    return of(DEMO_MEMBER);
  }
}
