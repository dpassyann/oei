import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificationPort } from '../../domain/port/certification/certification.port';
import { Certification, CertificationDeclaration } from '../../domain/model/certification/certification';
import { RecognizedCertification } from '../../domain/model/certification/recognized-certification';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const CERTIFICATION_API_BASE = '/api/member/v1';

// No dedicated `/certifications/recognized` endpoint exists per ADR 0002 (the recognized
// catalog is documentary/reference data, not a member-scoped resource). Pragmatic
// extension beyond the current OpenAPI contract: read it from the public reference API,
// since it is needed to validate a declaration against the catalog.
const PUBLIC_API_BASE = '/api/public/v1';

@Service()
export class CertificationApiAdapter implements CertificationPort {
  private readonly http = inject(HttpClient);

  listCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${CERTIFICATION_API_BASE}/certifications`);
  }

  getCertification(id: string): Observable<Certification> {
    return this.http.get<Certification>(`${CERTIFICATION_API_BASE}/certifications/${id}`);
  }

  declareCertification(declaration: CertificationDeclaration): Observable<Certification> {
    return this.http.post<Certification>(`${CERTIFICATION_API_BASE}/certifications`, declaration);
  }

  listRecognizedCertifications(): Observable<RecognizedCertification[]> {
    return this.http.get<RecognizedCertification[]>(`${PUBLIC_API_BASE}/recognized-certifications`);
  }
}
