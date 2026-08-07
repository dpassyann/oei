import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Document } from '../model/document';

/**
 * Reads a long-form Markdown document straight out of the static `assets/content/<lang>/<path>`
 * bundle produced from the repo-root `content/` folder (see `angular.json`'s `assets` entry).
 * Unlike `ContentRepositoryPort` (short home-page excerpts served via a backend/mock port), this
 * is a direct static-file fetch: there is no backend endpoint for these documents, only files
 * copied into the Angular build output.
 *
 * `path` is relative to a language folder, e.g. `200-WHITE-PAPERS/livre-blanc-complet.md`
 * (matches the `content/<lang>/...` layout). When the requested language has no such file yet
 * (most languages only have `.gitkeep` placeholders today), the adapter must retry against
 * `fr` and return `Document.isFallback = true` — the same "repli FR" convention already used by
 * `ContentMockAdapter`/`Home` (`isFallback()` / `oei-fallback-banner`).
 */
export interface MarkdownAssetPort {
  getMarkdownDocument(path: string, lang: string): Observable<Document>;
}

export const MARKDOWN_ASSET_PORT = new InjectionToken<MarkdownAssetPort>('MarkdownAssetPort');
