import { Service, inject } from '@angular/core';
import { ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument, Document } from '../../domain/model/document';
import { RuntimeConfig } from '../config/runtime-config';

// Uses native fetch() directly rather than HttpClient/RxJS — this project avoids Promise-wrapped
// Observable ceremony where a plain async fetch suffices, consistent with `provideHttpClient(withFetch())`
// already being the app's default HTTP transport. The OpenAPI-generated client
// (src/app/infrastructure/api/generated/) compiles cleanly but defaults `basePath` to
// `http://localhost` unless wired via `provideApi(...)`; calling fetch directly against the same
// contract path keeps the adapter simple without that extra plumbing.
interface ContentDocumentResponse {
  slug: string;
  lang: string;
  title: string;
  body: string;
  isFallback: boolean;
}

@Service()
export class ContentApiAdapter implements ContentRepositoryPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getHomeContent(lang: string): Promise<Document> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/content/${lang}/home`);
    if (!response.ok) {
      throw new Error(`getHomeContent failed with status ${response.status}`);
    }
    const data = (await response.json()) as ContentDocumentResponse;
    return createDocument(data);
  }
}
