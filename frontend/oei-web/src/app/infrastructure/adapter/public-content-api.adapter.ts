import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PublicContentPort } from '../../domain/port/cms/public-content.port';
import { ContentVersion, ContentVersionPage } from '../../domain/model/cms/content.model';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class PublicContentApiAdapter implements PublicContentPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getPublishedBySlug(slug: string, lang?: string): Observable<ContentVersion> {
    let params = new HttpParams();
    if (lang) params = params.set('lang', lang);
    return this.http.get<ContentVersion>(`${this.runtimeConfig.apiBaseUrl()}/public/v1/content/${slug}`, { params });
  }

  listDocumentVersions(slug: string): Observable<ContentVersion[]> {
    return this.http
      .get<ContentVersionPage>(`${this.runtimeConfig.apiBaseUrl()}/public/v1/documents/${slug}/versions`)
      .pipe(map((page) => [...page.items]));
  }
}
