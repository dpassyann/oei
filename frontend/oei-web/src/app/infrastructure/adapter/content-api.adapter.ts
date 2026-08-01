import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument, Document } from '../../domain/model/document';

// Note: the OpenAPI-generated client (src/app/infrastructure/api/generated/, produced by
// `pnpm generate:api`) does compile cleanly and exposes a usable `DefaultService.getContent(...)`
// method. It is intentionally NOT used here: its `BaseService` defaults `basePath` to
// `http://localhost` unless a `BASE_PATH`/`Configuration` provider is wired via `provideApi(...)`,
// which would require additional app.config.ts plumbing beyond what this task specifies, and would
// change the request URL asserted by this adapter's test (`/api/v1/content/{lang}/home`). Calling
// `HttpClient` directly against the same path keeps the adapter simple and matches the contract
// exactly, while the generated client remains available (and its build is verified) for future use.
interface ContentDocumentResponse {
  slug: string;
  lang: string;
  title: string;
  body: string;
  isFallback: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContentApiAdapter implements ContentRepositoryPort {
  private readonly http = inject(HttpClient);

  async getHomeContent(lang: string): Promise<Document> {
    const response = await firstValueFrom(
      this.http.get<ContentDocumentResponse>(`/api/v1/content/${lang}/home`),
    );
    return createDocument(response);
  }
}
