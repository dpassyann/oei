import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { MarkdownAssetPort } from '../../domain/port/markdown-asset.port';
import { createDocument, Document } from '../../domain/model/document';

// This is the single "asset" adapter mentioned in the plan: unlike the rest of this
// codebase's ports, there is no backend content service for these long-form documents (only
// files under `content/<lang>/...` at the repo root, mirrored verbatim into
// `public/assets/content/<lang>/...` by `scripts/copy-content-assets.mjs`, run before
// `start`/`build`/`test` — see that script for why a symlink wasn't used). A mock/api split
// would therefore be pure duplication: both "modes" would fetch the very same static file.
// The port/adapter separation is still respected (see `markdown-asset.port.ts`) purely for
// testability — specs mock `MARKDOWN_ASSET_PORT`, they never need this adapter's `HttpClient`
// wiring.
@Service()
export class MarkdownAssetAdapter implements MarkdownAssetPort {
  private readonly http = inject(HttpClient);

  getMarkdownDocument(path: string, lang: string): Observable<Document> {
    return this.fetch(path, lang).pipe(
      map((content) =>
        createDocument({ slug: path, lang, title: '', body: content, isFallback: false }),
      ),
      catchError((error) => {
        // `fr` is the only language guaranteed to exist today (see `content/fr/...` vs. the
        // other languages' `.gitkeep`-only folders) — retrying `fr` from `fr` would just
        // reproduce the same 404, so propagate the original error instead of masking it.
        if (lang === 'fr') {
          return throwError(() => error);
        }
        return this.fetch(path, 'fr').pipe(
          map((content) =>
            createDocument({ slug: path, lang: 'fr', title: '', body: content, isFallback: true }),
          ),
        );
      }),
    );
  }

  private fetch(path: string, lang: string): Observable<string> {
    return this.http.get(`assets/content/${lang}/${path}`, { responseType: 'text' });
  }
}
