import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Institution } from '../../model/institution/institution';
import { PartnershipLevel } from '../../model/institution/partnership';

// Matches `InstitutionAdminCreation` in `openapi/oei-api.yaml` (used by `createAdminInstitution`,
// `POST /api/admin/v1/institutions`) — see `.prompt/plan/final/02-PARTNERS-AND-INSTITUTION-ADMIN.md`
// §Création admin for the field list.
export interface AdminInstitutionCreationInput {
  readonly legalName: string;
  readonly publicName: string;
  readonly type: string;
  readonly country: string;
  readonly website?: string;
  readonly emailDomains: readonly string[];
  readonly logoUrl?: string;
  readonly description?: string;
  readonly primaryContactName: string;
  readonly institutionAdminEmail: string;
  readonly partnershipLevel: PartnershipLevel;
  readonly startedAt?: string;
  readonly endsAt?: string | null;
  readonly internalNotes?: string;
}

/**
 * Admin-side CRUD + lifecycle for institutions. Matches `/api/admin/v1/institutions/**` in
 * `openapi/oei-api.yaml`. Never exposes a hard-delete operation (task brief §Soft delete):
 * `suspend`/`revoke` are the only "destructive-looking" actions, both reversible/audited state
 * transitions rather than physical deletions.
 */
export interface AdminInstitutionsPort {
  list(): Observable<Institution[]>;
  getById(id: string): Observable<Institution>;
  create(input: AdminInstitutionCreationInput): Observable<Institution>;
  approve(id: string): Observable<Institution>;
  activate(id: string): Observable<Institution>;
  suspend(id: string, reason?: string): Observable<Institution>;
  revoke(id: string, reason: string): Observable<Institution>;
}

export const ADMIN_INSTITUTIONS_PORT = new InjectionToken<AdminInstitutionsPort>('AdminInstitutionsPort');
