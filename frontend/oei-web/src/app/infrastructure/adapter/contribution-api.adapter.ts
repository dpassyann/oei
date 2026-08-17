import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContributionCreationInput, ContributionPort } from '../../domain/port/governance/contribution.port';
import { ContentComment, ContentContribution } from '../../domain/model/governance/content-contribution.model';

// Matches `/api/member/v1/contributions` and `/api/admin/v1/content/{id}/contributions` in
// `openapi/oei-api.yaml`. Comments have no dedicated OpenAPI endpoint yet (`ContentComment` is a
// documentary schema per ADR 0002 — referenced by `ContentContribution`, no CRUD in V1); this
// adapter models them under the contribution's own sub-resource, consistent with that decision.
const MEMBER_API_BASE = '/api/member/v1';
const ADMIN_API_BASE = '/api/admin/v1';

@Service()
export class ContributionApiAdapter implements ContributionPort {
  private readonly http = inject(HttpClient);

  listMine(): Observable<ContentContribution[]> {
    return this.http.get<ContentContribution[]>(`${MEMBER_API_BASE}/contributions`);
  }

  listForContent(contentId: string): Observable<ContentContribution[]> {
    return this.http.get<ContentContribution[]>(`${ADMIN_API_BASE}/content/${contentId}/contributions`);
  }

  create(input: ContributionCreationInput): Observable<ContentContribution> {
    return this.http.post<ContentContribution>(`${MEMBER_API_BASE}/contributions`, input);
  }

  listComments(contributionId: string): Observable<ContentComment[]> {
    return this.http.get<ContentComment[]>(`${MEMBER_API_BASE}/contributions/${contributionId}/comments`);
  }

  addComment(contributionId: string, body: string): Observable<ContentComment> {
    return this.http.post<ContentComment>(`${MEMBER_API_BASE}/contributions/${contributionId}/comments`, {
      body,
    });
  }
}
