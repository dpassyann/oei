import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AdminMembersPort } from '../../domain/port/admin/admin-members.port';
import { AdminMemberSummary, createAdminMemberSummary } from '../../domain/model/admin/admin-member';

// GAP: same situation as `AdminDashboardApiAdapter` — `openapi/oei-api.yaml` has no
// `/api/admin/v1/members/**` operations yet (only `/institutions`, `/content`, `/audit-log`,
// `/git/**`, `/media`, `/books` are defined under `/api/admin/v1`). Until a real Spring Boot
// backend adds those endpoints, this "api" adapter intentionally returns the same seed data as
// `AdminMembersMockAdapter` rather than calling a non-existent path. Swap this for real
// `HttpClient` calls once the contract exposes them.
const PLACEHOLDER_MEMBERS: readonly AdminMemberSummary[] = [
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

@Service()
export class AdminMembersApiAdapter implements AdminMembersPort {
  list(): Observable<AdminMemberSummary[]> {
    return of([...PLACEHOLDER_MEMBERS]);
  }

  resyncPayment(id: string): Observable<AdminMemberSummary> {
    return this.notImplemented(id);
  }

  suspend(id: string): Observable<AdminMemberSummary> {
    return this.notImplemented(id);
  }

  liftSuspension(id: string): Observable<AdminMemberSummary> {
    return this.notImplemented(id);
  }

  setExceptionalStatus(id: string): Observable<AdminMemberSummary> {
    return this.notImplemented(id);
  }

  private notImplemented(id: string): Observable<AdminMemberSummary> {
    return throwError(() => new Error(`Member action for "${id}" is not available yet: no /api/admin/v1/members endpoint.`));
  }
}
