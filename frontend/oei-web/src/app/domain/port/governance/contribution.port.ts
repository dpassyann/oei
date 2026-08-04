import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentComment, ContentContribution } from '../../model/governance/content-contribution.model';

export interface ContributionCreationInput {
  readonly contentId: string;
  readonly patch: string;
}

/**
 * Governance port for member contributions (Markdown patch proposals, never a direct edit of a
 * published text) and their comments. Matches `/api/member/v1/contributions` and
 * `/api/admin/v1/content/{id}/contributions`.
 */
export interface ContributionPort {
  listMine(): Observable<ContentContribution[]>;
  listForContent(contentId: string): Observable<ContentContribution[]>;
  create(input: ContributionCreationInput): Observable<ContentContribution>;
  listComments(contributionId: string): Observable<ContentComment[]>;
  addComment(contributionId: string, body: string): Observable<ContentComment>;
}

export const CONTRIBUTION_PORT = new InjectionToken<ContributionPort>('ContributionPort');
