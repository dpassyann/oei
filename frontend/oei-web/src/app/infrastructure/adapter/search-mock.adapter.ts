import { inject, Service } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { SearchPort } from '../../domain/port/search.port';
import { createSearchResult, SearchResult } from '../../domain/model/search-result';
import { SupportedLanguage } from '../../domain/model/document';
import { NEWS_PORT } from '../../domain/port/news.port';

// In-memory, per-language index of the two resources that actually exist today on
// `/ressources` (Livre Blanc and the Code de déontologie — see `Ressources`'s
// `resourceLinks`). The other entries there (`referentiel`/`positions`/`rapports`) are
// still pending real content (see `ressources.resourceList.pendingBadge`) and are
// deliberately NOT indexed here, for the same "don't invent content" reason
// `PublicationsMockAdapter` returns `[]` rather than fake publications.
//
// This is intentionally a flat, hardcoded fixture (same pattern as `NewsMockAdapter`'s
// `FIXTURES`) rather than something read out of `Ressources` itself — there is no shared
// "resources catalog" port/model yet (the page builds its list from i18n keys directly).
// A future backend-backed search will replace this with a real index; this mock only
// proves the end-to-end mechanism (debounce → query → grouped results → navigation).
const RESOURCE_FIXTURES: Record<SupportedLanguage, SearchResult[]> = {
  fr: [
    createSearchResult({
      type: 'resource',
      title: 'Livre Blanc de l’OEI',
      excerpt:
        'Le document fondateur qui pose les bases éthiques et professionnelles du métier d’informaticien.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Code de déontologie',
      excerpt: 'Les principes déontologiques que s’engagent à respecter les membres de l’OEI.',
      path: '/deontologie',
    }),
  ],
  en: [
    createSearchResult({
      type: 'resource',
      title: 'OEI White Paper',
      excerpt:
        'The founding document laying out the ethical and professional foundations of the IT profession.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Code of Ethics',
      excerpt: 'The ethical principles OEI members commit to upholding.',
      path: '/deontologie',
    }),
  ],
  de: [
    createSearchResult({
      type: 'resource',
      title: 'OEI-Weißbuch',
      excerpt:
        'Das Grundlagendokument, das die ethischen und beruflichen Grundlagen des IT-Berufs darlegt.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Ethikkodex',
      excerpt: 'Die ethischen Grundsätze, zu denen sich die Mitglieder des OEI verpflichten.',
      path: '/deontologie',
    }),
  ],
  es: [
    createSearchResult({
      type: 'resource',
      title: 'Libro Blanco del OEI',
      excerpt:
        'El documento fundacional que sienta las bases éticas y profesionales de la profesión informática.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Código deontológico',
      excerpt: 'Los principios deontológicos que se comprometen a respetar los miembros del OEI.',
      path: '/deontologie',
    }),
  ],
  it: [
    createSearchResult({
      type: 'resource',
      title: 'Libro Bianco dell’OEI',
      excerpt:
        'Il documento fondativo che pone le basi etiche e professionali della professione informatica.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Codice deontologico',
      excerpt: 'I principi deontologici che i membri dell’OEI si impegnano a rispettare.',
      path: '/deontologie',
    }),
  ],
  pt: [
    createSearchResult({
      type: 'resource',
      title: 'Livro Branco do OEI',
      excerpt:
        'O documento fundador que estabelece as bases éticas e profissionais da profissão de informática.',
      path: '/ressources',
      fragment: 'livre-blanc',
    }),
    createSearchResult({
      type: 'resource',
      title: 'Código de deontologia',
      excerpt: 'Os princípios deontológicos que os membros do OEI se comprometem a respeitar.',
      path: '/deontologie',
    }),
  ],
};

// News is searched against the same, already-localized feed the home page and `/actualites`
// use (`NewsPort.getLatestNews`) — no separate fixture set, so search results and the news
// list itself can never drift apart. `50` is comfortably above the current fixture count
// (3 editorial items + however many approved article submissions exist) without needing a
// dedicated "search all news" method on `NewsPort`.
const NEWS_SEARCH_LIMIT = 50;

function matches(query: string, ...fields: readonly string[]): boolean {
  const needle = query.trim().toLowerCase();
  return needle.length > 0 && fields.some((field) => field.toLowerCase().includes(needle));
}

@Service()
export class SearchMockAdapter implements SearchPort {
  private readonly newsPort = inject(NEWS_PORT);

  search(query: string, lang: string): Observable<SearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return of([]);
    }

    const resources = (RESOURCE_FIXTURES[lang as SupportedLanguage] ?? RESOURCE_FIXTURES['en']).filter(
      (resource) => matches(trimmed, resource.title, resource.excerpt),
    );

    return this.newsPort.getLatestNews(NEWS_SEARCH_LIMIT, lang).pipe(
      map((newsItems) => {
        const news = newsItems
          .filter((item) => matches(trimmed, item.title, item.excerpt))
          .map((item) =>
            createSearchResult({
              type: 'news',
              title: item.title,
              excerpt: item.excerpt,
              path: item.path,
            }),
          );
        return [...resources, ...news];
      }),
    );
  }
}
