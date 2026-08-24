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
//
// `GET /content/{lang}/{slug}` (`content-legacy`) is outside `/api/v1` but still served by
// the backend host. In production the static site host is CloudFront/S3, so using a root-relative
// `/content` would hit S3 and fail 403; we must target the API host origin explicitly.

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

  private contentBaseUrl(): string {
    const apiBaseUrl = this.runtimeConfig.apiBaseUrl();
    try {
      const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
      return `${apiOrigin}/content`;
    } catch {
      return '/content';
    }
  }

  getHomeContent(lang: string): Observable<Document> {
    return this.http
      .get<ContentDocumentResponse>(`${this.contentBaseUrl()}/${lang}/home`)
      .pipe(map((data) => createDocument(data)));
  }
}
