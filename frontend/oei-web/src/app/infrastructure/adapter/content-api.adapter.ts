import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument, Document } from '../../domain/model/document';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation. The OpenAPI-generated client
// (src/app/infrastructure/api/generated/) compiles cleanly but defaults `basePath` to
// `http://localhost` unless wired via `provideApi(...)`; calling `HttpClient` directly against
// the same contract path keeps the adapter simple without that extra plumbing.
//
// `GET /content/{lang}/{slug}` (`content-legacy` tag) is the one historical endpoint kept
// entirely outside any `/api` prefix (see the contract preamble in `openapi/oei-api.yaml`) —
// unlike the other `home-legacy` endpoints it does NOT sit under `RuntimeConfig.apiBaseUrl()`
// (`/api/v1`), so this adapter builds the URL from a literal root-relative base instead.
const CONTENT_LEGACY_API_BASE = '/content';

interface ContentDocumentResponse {
  slug: string;
  lang: string;
  title: string;
  body: string;
  isFallback: boolean;
}

@Service()
export class ContentApiAdapter implements ContentRepositoryPort {
  private readonly http = inject(HttpClient);

  getHomeContent(lang: string): Observable<Document> {
    return this.http
      .get<ContentDocumentResponse>(`${CONTENT_LEGACY_API_BASE}/${lang}/home`)
      .pipe(map((data) => createDocument(data)));
  }
}
