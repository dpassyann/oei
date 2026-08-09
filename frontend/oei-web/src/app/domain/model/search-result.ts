export type SearchResultType = 'resource' | 'news';

export interface SearchResult {
  readonly type: SearchResultType;
  readonly title: string;
  readonly excerpt: string;
  /** Route to navigate to on click (always internal — never an external URL). */
  readonly path: string;
  /** Optional in-page anchor on `path` (e.g. the Livre Blanc section on `/ressources`). */
  readonly fragment?: string;
}

export function createSearchResult(fields: SearchResult): SearchResult {
  return Object.freeze({ ...fields });
}
