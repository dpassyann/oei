import { Service } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { AdminMembersPort } from '../../domain/port/admin/admin-members.port';
import { AdminMemberSummary, createAdminMemberSummary } from '../../domain/model/admin/admin-member';

function buildSeedMembers(): AdminMemberSummary[] {
  return [
    createAdminMemberSummary({
      id: 'member-admin-demo-1',
      displayName: 'Amina Diallo (exemple)',
      email: 'amina.diallo@example.org',
      country: 'SN',
      duesStatus: 'PAID',
      membershipStatus: 'ACTIVE',
      lastPaymentAt: '2026-02-10T00:00:00Z',
      suspendedReason: null,
    }),
    createAdminMemberSummary({
      id: 'member-admin-demo-2',
      displayName: 'Julien Petit (exemple)',
      email: 'julien.petit@example.org',
      country: 'FR',
      duesStatus: 'EXPIRED',
      membershipStatus: 'ACTIVE',
      lastPaymentAt: '2025-01-05T00:00:00Z',
      suspendedReason: null,
    }),
    createAdminMemberSummary({
      id: 'member-admin-demo-3',
      displayName: 'Chidi Okafor (exemple)',
      email: 'chidi.okafor@example.org',
      country: 'NG',
      duesStatus: 'UNPAID',
      membershipStatus: 'SUSPENDED',
      lastPaymentAt: null,
      suspendedReason: 'Signalement pour comportement abusif en communauté (exemple).',
    }),
  ];
}

// In-memory "database", same convention as `admin-institutions-mock.adapter.ts`: every mutating
// call from a mock-mode admin action updates this array so the `/admin/members` list reflects
// real session activity, not just the seed rows.
let members: AdminMemberSummary[] = buildSeedMembers();

export function resetAdminMembersFixtures(): void {
  members = buildSeedMembers();
}

function findOrThrow(id: string): AdminMemberSummary {
  const found = members.find((member) => member.id === id);
  if (!found) {
    throw new Error(`Member "${id}" not found.`);
  }
  return found;
}

function replace(id: string, updated: AdminMemberSummary): void {
  members = members.map((member) => (member.id === id ? updated : member));
}

@Service()
export class AdminMembersMockAdapter implements AdminMembersPort {
  list(): Observable<AdminMemberSummary[]> {
    return of([...members]);
  }

  resyncPayment(id: string): Observable<AdminMemberSummary> {
    return this.transition(id, () => ({ duesStatus: 'PAID', lastPaymentAt: new Date().toISOString() }));
  }

  suspend(id: string, reason: string): Observable<AdminMemberSummary> {
    if (!reason.trim()) {
      return throwError(() => new Error('A reason is required to suspend a member.'));
    }
    return this.transition(id, (member) => ({ ...member, membershipStatus: 'SUSPENDED', suspendedReason: reason }));
  }

  liftSuspension(id: string): Observable<AdminMemberSummary> {
    return this.transition(id, (member) => ({ ...member, membershipStatus: 'ACTIVE', suspendedReason: null }));
  }

  setExceptionalStatus(id: string, status: 'EXCEPTIONAL_FREE' | 'EXCEPTIONAL_HONORARY'): Observable<AdminMemberSummary> {
    return this.transition(id, (member) => ({ ...member, membershipStatus: status, suspendedReason: null }));
  }

  private transition(
    id: string,
    computeNext: (member: AdminMemberSummary) => Partial<AdminMemberSummary>,
  ): Observable<AdminMemberSummary> {
    return of(id).pipe(
      map(() => {
        const member = findOrThrow(id);
        const updated = createAdminMemberSummary({ ...member, ...computeNext(member) });
        replace(id, updated);
        return updated;
      }),
    );
  }
}
