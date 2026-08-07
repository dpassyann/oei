import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { MarkdownDocumentApplicationService } from './markdown-document-application.service';
import { MARKDOWN_ASSET_PORT, MarkdownAssetPort } from '../../domain/port/markdown-asset.port';
import { createDocument } from '../../domain/model/document';

describe('MarkdownDocumentApplicationService', () => {
  it('givenPortReturnsDocument_whenGetMarkdownDocument_thenPassesItThrough', async () => {
    const fakePort: MarkdownAssetPort = {
      getMarkdownDocument: (path, lang) =>
        of(createDocument({ slug: path, lang, title: '', body: '# Titre', isFallback: false })),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: MARKDOWN_ASSET_PORT, useValue: fakePort }],
    });
    const service = TestBed.inject(MarkdownDocumentApplicationService);

    const doc = await firstValueFrom(
      service.getMarkdownDocument('200-WHITE-PAPERS/livre-blanc-complet.md', 'fr'),
    );

    expect(doc.body).toBe('# Titre');
    expect(doc.isFallback).toBe(false);
  });
});
