import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument, Document } from '../../domain/model/document';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation. The OpenAPI-generated client
// (src/app/infrastructure/api/generated/) compiles cleanly but defaults `basePath` to
// `http://localhost` unless wired via `provideApi(...)`; calling `HttpClient` directly against
// the same contract path keeps the adapter simple without that extra plumbing.
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
  private readonly runtimeConfig = inject(RuntimeConfig);

  getHomeContent(lang: string): Observable<Document> {
    return this.http
      .get<ContentDocumentResponse>(`${this.runtimeConfig.apiBaseUrl()}/content/${lang}/home`)
      .pipe(map((data) => createDocument(data)));
  }
}
