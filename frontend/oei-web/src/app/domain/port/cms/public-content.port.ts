import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentVersion } from '../../model/cms/content.model';

/**
 * Public (unauthenticated) read port for published content, matching
 * `/api/public/v1/content/{slug}` and `/api/public/v1/documents/{slug}/versions`. Distinct from
 * the legacy `ContentRepositoryPort` (`GET /content/{lang}/{slug}`, home page only) which is kept
 * unchanged per ADR 0002.
 */
export interface PublicContentPort {
  getPublishedBySlug(slug: string, lang?: string): Observable<ContentVersion>;
  listDocumentVersions(slug: string): Observable<ContentVersion[]>;
}

export const PUBLIC_CONTENT_PORT = new InjectionToken<PublicContentPort>('PublicContentPort');
