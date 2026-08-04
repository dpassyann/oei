import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContributionCreationInput, ContributionPort } from '../../domain/port/governance/contribution.port';
import { ContentComment, ContentContribution } from '../../domain/model/governance/content-contribution.model';
import { RuntimeConfig } from '../config/runtime-config';

// Matches `/api/member/v1/contributions` and `/api/admin/v1/content/{id}/contributions` in
// `openapi/oei-api.yaml`. Comments have no dedicated OpenAPI endpoint yet (`ContentComment` is a
// documentary schema per ADR 0002 — referenced by `ContentContribution`, no CRUD in V1); this
// adapter models them under the contribution's own sub-resource, consistent with that decision.
@Service()
export class ContributionApiAdapter implements ContributionPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listMine(): Observable<ContentContribution[]> {
    return this.http.get<ContentContribution[]>(`${this.runtimeConfig.apiBaseUrl()}/member/v1/contributions`);
  }

  listForContent(contentId: string): Observable<ContentContribution[]> {
    return this.http.get<ContentContribution[]>(`${this.runtimeConfig.apiBaseUrl()}/admin/v1/content/${contentId}/contributions`);
  }

  create(input: ContributionCreationInput): Observable<ContentContribution> {
    return this.http.post<ContentContribution>(`${this.runtimeConfig.apiBaseUrl()}/member/v1/contributions`, input);
  }

  listComments(contributionId: string): Observable<ContentComment[]> {
    return this.http.get<ContentComment[]>(`${this.runtimeConfig.apiBaseUrl()}/member/v1/contributions/${contributionId}/comments`);
  }

  addComment(contributionId: string, body: string): Observable<ContentComment> {
    return this.http.post<ContentComment>(`${this.runtimeConfig.apiBaseUrl()}/member/v1/contributions/${contributionId}/comments`, {
      body,
    });
  }
}
