import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApprovalDecisionValue,
  ApprovalGateRole,
  Content,
  ContentApproval,
  ContentPublication,
  ContentSourceType,
  ContentTranslation,
  ContentVersion,
  ContentWorkflowStatus,
} from '../../model/cms/content.model';
import { ContentType } from '../../model/cms/content-type';

export interface ContentCreationInput {
  readonly type: ContentType;
  readonly slug: string;
  readonly sourceType: ContentSourceType;
  readonly title: string;
  readonly tags?: readonly string[];
  readonly governance?: { readonly approvalRequired: boolean; readonly decisionId?: string | null };
}

export interface ContentVersionCreationInput {
  readonly language: string;
  readonly title: string;
  readonly body: string;
  readonly frontMatter?: Record<string, unknown>;
}

export interface ContentApprovalInput {
  readonly role: ApprovalGateRole;
  readonly decision: ApprovalDecisionValue;
  readonly comment?: string;
}

export interface ContentTranslationInput {
  readonly language: string;
  readonly translatorId?: string | null;
}

/** Filters supported by `listAdminContent` — extended (per ADR 0002) with free-text search (`q`)
 * and `tag`, both applied over the mocked fixtures for the "recherche simple" requirement. */
export interface AdminContentSearchCriteria {
  readonly type?: ContentType;
  readonly status?: ContentWorkflowStatus;
  readonly lang?: string;
  readonly tag?: string;
  readonly q?: string;
}

/**
 * Back-office port for CMS/governance content: CRUD + full workflow lifecycle. Matches
 * `/api/admin/v1/content/**` in `openapi/oei-api.yaml`. Never exposes a delete operation — no
 * normative document can be overwritten or destroyed (acceptance constraint of the CMS plan);
 * every mutation either creates a new `ContentVersion` or transitions `Content.status`.
 */
export interface AdminContentPort {
  list(criteria?: AdminContentSearchCriteria): Observable<Content[]>;
  getById(id: string): Observable<Content>;
  getVersions(contentId: string): Observable<ContentVersion[]>;
  create(input: ContentCreationInput): Observable<Content>;
  createVersion(contentId: string, input: ContentVersionCreationInput): Observable<ContentVersion>;
  submit(contentId: string): Observable<Content>;
  approve(contentId: string, input: ContentApprovalInput): Observable<ContentApproval>;
  reject(contentId: string, comment: string): Observable<Content>;
  requestTranslation(contentId: string): Observable<Content>;
  schedule(contentId: string): Observable<Content>;
  publish(contentId: string): Observable<ContentPublication>;
  archive(contentId: string): Observable<Content>;
  addTranslation(contentId: string, input: ContentTranslationInput): Observable<ContentTranslation>;
  validateTranslation(contentId: string, language: string): Observable<ContentTranslation>;
}

export const ADMIN_CONTENT_PORT = new InjectionToken<AdminContentPort>('AdminContentPort');
