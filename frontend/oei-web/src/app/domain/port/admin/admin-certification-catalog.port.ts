import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CertificationLevel,
  CertificationOeiStatus,
  RecognizedCertification,
} from '../../model/certification/recognized-certification';

// Fields an admin can set when adding/editing a catalog entry from `/admin/certifications`. Mirrors
// `RecognizedCertification` minus `id` (server/mock-assigned on create, immutable on update).
export interface AdminCertificationCatalogInput {
  readonly name: string;
  readonly issuingOrganization: string;
  readonly catalogReference?: string;
  readonly autoValidate: boolean;
  readonly domain?: string;
  readonly level?: CertificationLevel;
  readonly language?: string;
  readonly oeiStatus?: CertificationOeiStatus;
  readonly description?: string;
  readonly competencies?: readonly string[];
  readonly validityMonths?: number | null;
  readonly associatedPathRoute?: string | null;
}

/**
 * Admin-side CRUD for the public `/certifications` recognized-certification catalog (task:
 * porteur du projet — "pouvoir ajouter une certification depuis /admin"). Distinct from
 * `CertificationPort` (public read + member self-declaration): this port is the admin console's
 * write side, journaled through `AdminAuditService` by `AdminCertificationCatalogApplicationService`
 * exactly like `AdminInstitutionsPort`/`AdminInstitutionsApplicationService`.
 *
 * No dedicated backend endpoint exists yet — a Spring Boot admin CRUD on `RecognizedCertification`
 * is being built in parallel (separate workstream). `AdminCertificationCatalogApiAdapter` documents
 * the expected contract; `AdminCertificationCatalogMockAdapter` is the interim implementation
 * (`RuntimeConfig.isMock()`), sharing its in-memory store with `CertificationMockAdapter` via
 * `certification-catalog-demo-data.ts` so an addition/edit is immediately visible on the public
 * `/certifications` mock catalog.
 */
export interface AdminCertificationCatalogPort {
  list(): Observable<RecognizedCertification[]>;
  create(input: AdminCertificationCatalogInput): Observable<RecognizedCertification>;
  update(id: string, input: AdminCertificationCatalogInput): Observable<RecognizedCertification>;
}

export const ADMIN_CERTIFICATION_CATALOG_PORT = new InjectionToken<AdminCertificationCatalogPort>(
  'AdminCertificationCatalogPort',
);
