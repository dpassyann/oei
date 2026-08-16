import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminCertificationCatalogInput,
  AdminCertificationCatalogPort,
} from '../../domain/port/admin/admin-certification-catalog.port';
import { RecognizedCertification } from '../../domain/model/certification/recognized-certification';

// Expected contract for the admin CRUD on `RecognizedCertification` currently being built in a
// separate backend workstream (Spring Boot, `backend/` — not touched by this frontend change).
// Path/verbs below follow the same `/api/admin/v1/**` convention as `AdminInstitutionsApiAdapter`
// (role-versioned per ADR 0002, literal prefix rather than `RuntimeConfig.apiBaseUrl()`):
//   GET    /api/admin/v1/certifications/catalog        -> RecognizedCertification[]
//   POST   /api/admin/v1/certifications/catalog        -> RecognizedCertification (create)
//   PUT    /api/admin/v1/certifications/catalog/{id}   -> RecognizedCertification (update)
// Adjust verbs/paths here once the real OpenAPI contract lands — this adapter is a stub wired
// behind `RuntimeConfig.isMock()` so swapping it in is a one-line change in `app.config.ts`.
const ADMIN_CERTIFICATION_CATALOG_API_BASE = '/api/admin/v1/certifications/catalog';

@Service()
export class AdminCertificationCatalogApiAdapter implements AdminCertificationCatalogPort {
  private readonly http = inject(HttpClient);

  list(): Observable<RecognizedCertification[]> {
    return this.http.get<RecognizedCertification[]>(ADMIN_CERTIFICATION_CATALOG_API_BASE);
  }

  create(input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    return this.http.post<RecognizedCertification>(ADMIN_CERTIFICATION_CATALOG_API_BASE, input);
  }

  update(id: string, input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    return this.http.put<RecognizedCertification>(`${ADMIN_CERTIFICATION_CATALOG_API_BASE}/${id}`, input);
  }
}
