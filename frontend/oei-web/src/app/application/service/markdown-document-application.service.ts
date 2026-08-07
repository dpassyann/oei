import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MARKDOWN_ASSET_PORT } from '../../domain/port/markdown-asset.port';
import { Document } from '../../domain/model/document';

// Same layering as `ContentApplicationService` (see `infrastructure/adapter/README.md`):
// returns an `Observable`, consumed via `rxResource()` from a page component. No DTO mapping is
// needed here — the raw Markdown `body` and `isFallback` are exactly what the presentation layer
// (`livre-blanc.ts`) needs, so the `Document` model is passed through unchanged.
@Service()
export class MarkdownDocumentApplicationService {
  private readonly repository = inject(MARKDOWN_ASSET_PORT);

  getMarkdownDocument(path: string, lang: string): Observable<Document> {
    return this.repository.getMarkdownDocument(path, lang);
  }
}
