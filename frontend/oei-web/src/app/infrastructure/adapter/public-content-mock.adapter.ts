import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { PublicContentPort } from '../../domain/port/cms/public-content.port';
import { ContentVersion, createContentVersion } from '../../domain/model/cms/content.model';

// Only published versions are exposed here — mirrors `getPublicContent`'s summary ("Récupère la
// version publiée"). One demo document (the Livre Blanc) is published; document version history
// includes it as the only entry so `/documents/livre-blanc/versions` has something to show.
const PUBLISHED_VERSIONS: Record<string, ContentVersion> = {
  'livre-blanc': createContentVersion({
    id: 'version-livre-blanc-1',
    contentId: 'content-livre-blanc',
    version: '1.0',
    language: 'fr',
    title: 'Livre Blanc',
    body: "# Livre Blanc\n\nSynthèse des positions de l'OEI. (Exemple mocké.)",
    authorIds: ['yann-deungoue'],
    status: 'PUBLISHED',
    createdAt: '2026-08-01T09:00:00Z',
  }),
};

@Service()
export class PublicContentMockAdapter implements PublicContentPort {
  getPublishedBySlug(slug: string, _lang?: string): Observable<ContentVersion> {
    const version = PUBLISHED_VERSIONS[slug];
    return version ? of(version) : throwError(() => new Error(`No published content for slug "${slug}".`));
  }

  listDocumentVersions(slug: string): Observable<ContentVersion[]> {
    const version = PUBLISHED_VERSIONS[slug];
    return of(version ? [version] : []);
  }
}
