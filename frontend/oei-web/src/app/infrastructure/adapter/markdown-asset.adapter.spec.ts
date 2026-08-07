import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MarkdownAssetAdapter } from './markdown-asset.adapter';

describe('MarkdownAssetAdapter', () => {
  function createAdapter(): { adapter: MarkdownAssetAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MarkdownAssetAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      adapter: TestBed.inject(MarkdownAssetAdapter),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('givenFileExistsForRequestedLang_whenGetMarkdownDocument_thenReturnsItWithoutFallback', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(
      adapter.getMarkdownDocument('200-WHITE-PAPERS/livre-blanc-complet.md', 'fr'),
    );
    const req = httpMock.expectOne('assets/content/fr/200-WHITE-PAPERS/livre-blanc-complet.md');
    req.flush('# Livre Blanc\n\nCorps.');

    const doc = await result;
    expect(doc.lang).toBe('fr');
    expect(doc.body).toBe('# Livre Blanc\n\nCorps.');
    expect(doc.isFallback).toBe(false);
    httpMock.verify();
  });

  it('givenFileMissingForRequestedLang_whenGetMarkdownDocument_thenRetriesFrenchAndFlagsFallback', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(
      adapter.getMarkdownDocument('200-WHITE-PAPERS/livre-blanc-complet.md', 'de'),
    );

    httpMock.expectOne('assets/content/de/200-WHITE-PAPERS/livre-blanc-complet.md').flush(null, {
      status: 404,
      statusText: 'Not Found',
    });
    httpMock
      .expectOne('assets/content/fr/200-WHITE-PAPERS/livre-blanc-complet.md')
      .flush('# Livre Blanc\n\nCorps FR.');

    const doc = await result;
    expect(doc.lang).toBe('fr');
    expect(doc.body).toBe('# Livre Blanc\n\nCorps FR.');
    expect(doc.isFallback).toBe(true);
    httpMock.verify();
  });

  it('givenFrenchFileMissing_whenGetMarkdownDocument_thenThrowsWithoutRetrying', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(
      adapter.getMarkdownDocument('200-WHITE-PAPERS/livre-blanc-complet.md', 'fr'),
    );
    httpMock.expectOne('assets/content/fr/200-WHITE-PAPERS/livre-blanc-complet.md').flush(null, {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(result).rejects.toThrow();
    httpMock.verify();
  });
});
