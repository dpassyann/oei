import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CvPort } from '../../domain/port/cv/cv.port';
import { Cv, CvCreation, CvRenderRequest, CvSection, CvTranslation, PdfGenerationJob } from '../../domain/model/cv/cv';
import { CvTemplate } from '../../domain/model/cv/cv-template';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const CV_API_BASE = '/api/member/v1';

@Service()
export class CvApiAdapter implements CvPort {
  private readonly http = inject(HttpClient);

  listTemplates(): Observable<CvTemplate[]> {
    return this.http.get<CvTemplate[]>(`${CV_API_BASE}/cv/templates`);
  }

  listCvs(): Observable<Cv[]> {
    return this.http.get<Cv[]>(`${CV_API_BASE}/cv`);
  }

  getCv(id: string): Observable<Cv> {
    return this.http.get<Cv>(`${CV_API_BASE}/cv/${id}`);
  }

  createCv(creation: CvCreation): Observable<Cv> {
    return this.http.post<Cv>(`${CV_API_BASE}/cv`, creation);
  }

  updateCv(id: string, cv: Cv): Observable<Cv> {
    // The OpenAPI `updateCv` requestBody is `CvCreation` (`templateId`/`sourceLanguage`
    // only), not the full `Cv` resource — the port keeps the wider `Cv` signature for
    // caller convenience, so the DTO is narrowed here at the adapter boundary.
    const request: CvCreation = { templateId: cv.templateId, sourceLanguage: cv.sourceLanguage };
    return this.http.put<Cv>(`${CV_API_BASE}/cv/${id}`, request);
  }

  addSection(cvId: string, section: Omit<CvSection, 'id' | 'cvId' | 'translations'>): Observable<CvSection> {
    return this.http.post<CvSection>(`${CV_API_BASE}/cv/${cvId}/sections`, section);
  }

  updateSection(cvId: string, sectionId: string, section: CvSection): Observable<CvSection> {
    return this.http.put<CvSection>(`${CV_API_BASE}/cv/${cvId}/sections/${sectionId}`, section);
  }

  addTranslation(
    cvId: string,
    sectionId: string,
    translation: Pick<CvTranslation, 'language' | 'content'>,
  ): Observable<CvTranslation> {
    // The OpenAPI `requestCvSectionTranslation` requestBody is the full `CvTranslation`
    // schema, which requires `status` — the port only takes `language`/`content` (the only
    // fields a manual submission from this UI actually decides), so `status` is filled in
    // here at the adapter boundary. A manually-submitted translation is always
    // `PENDING_VALIDATION` (never auto-`VALIDATED`, never `MACHINE_GENERATED` — that value
    // is reserved for automatic/machine translation, not modeled by this port yet).
    const request: Pick<CvTranslation, 'language' | 'content' | 'status'> = {
      ...translation,
      status: 'PENDING_VALIDATION',
    };
    return this.http.post<CvTranslation>(`${CV_API_BASE}/cv/${cvId}/sections/${sectionId}/translations`, request);
  }

  validateTranslation(cvId: string, sectionId: string, language: string): Observable<CvTranslation> {
    return this.http.post<CvTranslation>(
      `${CV_API_BASE}/cv/${cvId}/sections/${sectionId}/translations/${language}/validate`,
      null,
    );
  }

  renderCv(cvId: string, request: CvRenderRequest): Observable<PdfGenerationJob> {
    // Contract documents a 202 async response; V1 API adapter does a plain POST with no
    // polling logic — the async job lifecycle is out of scope here.
    return this.http.post<PdfGenerationJob>(`${CV_API_BASE}/cv/${cvId}/render`, request);
  }
}
