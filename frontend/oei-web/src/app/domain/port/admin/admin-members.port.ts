import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminMemberSummary } from '../../model/admin/admin-member';

/**
 * Admin-side member operations (task brief `.prompt/plan/final/03-ADMIN-CONSOLE.md` §Membres):
 * consult dues status, resync a payment, suspend/lift suspension, set an exceptional status.
 * GAP: unlike `AdminInstitutionsPort`/`AdminAuditLogPort`, `openapi/oei-api.yaml` has no
 * `/api/admin/v1/members/**` operations yet — this mirrors `AdminDashboardPort`'s documented gap
 * (see `AdminDashboardApiAdapter`): the "api" adapter intentionally returns mock-shaped data until
 * a real Spring Boot backend adds the endpoints, rather than inventing a call to a path that does
 * not exist in the contract.
 */
export interface AdminMembersPort {
  list(): Observable<AdminMemberSummary[]>;
  resyncPayment(id: string): Observable<AdminMemberSummary>;
  suspend(id: string, reason: string): Observable<AdminMemberSummary>;
  liftSuspension(id: string): Observable<AdminMemberSummary>;
  setExceptionalStatus(id: string, status: 'EXCEPTIONAL_FREE' | 'EXCEPTIONAL_HONORARY'): Observable<AdminMemberSummary>;
}

export const ADMIN_MEMBERS_PORT = new InjectionToken<AdminMembersPort>('AdminMembersPort');
