import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PublicContentPort } from '../../domain/port/cms/public-content.port';
import { ContentVersion, ContentVersionPage } from '../../domain/model/cms/content.model';

// Endpoints under `/api/public/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints — see
// `stats-api.adapter.ts`/`domains-api.adapter.ts`/etc.).
const PUBLIC_CONTENT_API_BASE = '/api/public/v1';

@Service()
export class PublicContentApiAdapter implements PublicContentPort {
  private readonly http = inject(HttpClient);

  getPublishedBySlug(slug: string, lang?: string): Observable<ContentVersion> {
    let params = new HttpParams();
    if (lang) params = params.set('lang', lang);
    return this.http.get<ContentVersion>(`${PUBLIC_CONTENT_API_BASE}/content/${slug}`, { params });
  }

  listDocumentVersions(slug: string): Observable<ContentVersion[]> {
    return this.http
      .get<ContentVersionPage>(`${PUBLIC_CONTENT_API_BASE}/documents/${slug}/versions`)
      .pipe(map((page) => [...page.items]));
  }
}
