import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ADMIN_CONTENT_PORT,
  AdminContentSearchCriteria,
  ContentApprovalInput,
  ContentCreationInput,
  ContentTranslationInput,
  ContentVersionCreationInput,
} from '../../domain/port/cms/admin-content.port';
import {
  Content,
  ContentApproval,
  ContentPublication,
  ContentTranslation,
  ContentVersion,
} from '../../domain/model/cms/content.model';
import { availableActions, WorkflowActionName } from '../../domain/model/cms/content-workflow';

// `@Service()` for consistency with the other application services (see
// `application/service/publications-application.service.ts`). Returns `Observable`s end-to-end
// (see `infrastructure/adapter/README.md`).
@Service()
export class AdminContentApplicationService {
  private readonly port = inject(ADMIN_CONTENT_PORT);

  list(criteria?: AdminContentSearchCriteria): Observable<Content[]> {
    return this.port.list(criteria);
  }

  getById(id: string): Observable<Content> {
    return this.port.getById(id);
  }

  getVersions(contentId: string): Observable<ContentVersion[]> {
    return this.port.getVersions(contentId);
  }

  create(input: ContentCreationInput): Observable<Content> {
    return this.port.create(input);
  }

  createVersion(contentId: string, input: ContentVersionCreationInput): Observable<ContentVersion> {
    return this.port.createVersion(contentId, input);
  }

  submit(contentId: string): Observable<Content> {
    return this.port.submit(contentId);
  }

  approve(contentId: string, input: ContentApprovalInput): Observable<ContentApproval> {
    return this.port.approve(contentId, input);
  }

  reject(contentId: string, comment: string): Observable<Content> {
    return this.port.reject(contentId, comment);
  }

  requestTranslation(contentId: string): Observable<Content> {
    return this.port.requestTranslation(contentId);
  }

  schedule(contentId: string): Observable<Content> {
    return this.port.schedule(contentId);
  }

  publish(contentId: string): Observable<ContentPublication> {
    return this.port.publish(contentId);
  }

  archive(contentId: string): Observable<Content> {
    return this.port.archive(contentId);
  }

  addTranslation(contentId: string, input: ContentTranslationInput): Observable<ContentTranslation> {
    return this.port.addTranslation(contentId, input);
  }

  validateTranslation(contentId: string, language: string): Observable<ContentTranslation> {
    return this.port.validateTranslation(contentId, language);
  }

  /** Which workflow buttons the back-office should show for a given content's current status —
   * delegates to the pure domain function so the UI and the port/adapter never disagree. */
  availableActions(content: Content): readonly WorkflowActionName[] {
    return availableActions(content.status);
  }
}
