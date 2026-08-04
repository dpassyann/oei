import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  AdminContentPort,
  AdminContentSearchCriteria,
  ContentApprovalInput,
  ContentCreationInput,
  ContentTranslationInput,
  ContentVersionCreationInput,
} from '../../domain/port/cms/admin-content.port';
import {
  Content,
  ContentApproval,
  ContentPage,
  ContentPublication,
  ContentTranslation,
  ContentVersion,
} from '../../domain/model/cms/content.model';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) is used here
// (not `fetch()`/Promise). Endpoints match `/api/admin/v1/content/**` in `openapi/oei-api.yaml`.
@Service()
export class AdminContentApiAdapter implements AdminContentPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  private get baseUrl(): string {
    return `${this.runtimeConfig.apiBaseUrl()}/admin/v1/content`;
  }

  list(criteria?: AdminContentSearchCriteria): Observable<Content[]> {
    let params = new HttpParams();
    if (criteria?.type) params = params.set('type', criteria.type);
    if (criteria?.status) params = params.set('status', criteria.status);
    if (criteria?.lang) params = params.set('lang', criteria.lang);
    if (criteria?.tag) params = params.set('tag', criteria.tag);
    if (criteria?.q) params = params.set('q', criteria.q);
    return this.http.get<ContentPage>(this.baseUrl, { params }).pipe(map((page) => [...page.items]));
  }

  getById(id: string): Observable<Content> {
    return this.http.get<Content>(`${this.baseUrl}/${id}`);
  }

  getVersions(contentId: string): Observable<ContentVersion[]> {
    return this.http
      .get<{ items: ContentVersion[] }>(`${this.baseUrl}/${contentId}/versions`)
      .pipe(map((page) => [...page.items]));
  }

  create(input: ContentCreationInput): Observable<Content> {
    return this.http.post<Content>(this.baseUrl, input);
  }

  createVersion(contentId: string, input: ContentVersionCreationInput): Observable<ContentVersion> {
    return this.http.put<ContentVersion>(`${this.baseUrl}/${contentId}`, input);
  }

  submit(contentId: string): Observable<Content> {
    return this.http.post<Content>(`${this.baseUrl}/${contentId}/submit`, {});
  }

  approve(contentId: string, input: ContentApprovalInput): Observable<ContentApproval> {
    return this.http.post<ContentApproval>(`${this.baseUrl}/${contentId}/approve`, input);
  }

  reject(contentId: string, comment: string): Observable<Content> {
    return this.http.post<Content>(`${this.baseUrl}/${contentId}/reject`, { comment });
  }

  requestTranslation(contentId: string): Observable<Content> {
    return this.http.post<Content>(`${this.baseUrl}/${contentId}/translations/request`, {});
  }

  schedule(contentId: string): Observable<Content> {
    return this.http.post<Content>(`${this.baseUrl}/${contentId}/schedule`, {});
  }

  publish(contentId: string): Observable<ContentPublication> {
    return this.http.post<ContentPublication>(`${this.baseUrl}/${contentId}/publish`, {});
  }

  archive(contentId: string): Observable<Content> {
    return this.http.post<Content>(`${this.baseUrl}/${contentId}/archive`, {});
  }

  addTranslation(contentId: string, input: ContentTranslationInput): Observable<ContentTranslation> {
    return this.http.post<ContentTranslation>(`${this.baseUrl}/${contentId}/translations`, input);
  }

  validateTranslation(contentId: string, language: string): Observable<ContentTranslation> {
    return this.http.post<ContentTranslation>(`${this.baseUrl}/${contentId}/translations/${language}/validate`, {});
  }
}
