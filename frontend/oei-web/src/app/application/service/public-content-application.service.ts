import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PUBLIC_CONTENT_PORT } from '../../domain/port/cms/public-content.port';
import { ContentVersion } from '../../domain/model/cms/content.model';

@Service()
export class PublicContentApplicationService {
  private readonly port = inject(PUBLIC_CONTENT_PORT);

  getPublishedBySlug(slug: string, lang?: string): Observable<ContentVersion> {
    return this.port.getPublishedBySlug(slug, lang);
  }

  listDocumentVersions(slug: string): Observable<ContentVersion[]> {
    return this.port.listDocumentVersions(slug);
  }
}
