import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { PublicContentMockAdapter } from './public-content-mock.adapter';

describe('PublicContentMockAdapter', () => {
  function createAdapter(): PublicContentMockAdapter {
    TestBed.configureTestingModule({});
    return TestBed.inject(PublicContentMockAdapter);
  }

  it('givenPublishedSlug_whenGetPublishedBySlug_thenReturnsVersion', async () => {
    const version = await firstValueFrom(createAdapter().getPublishedBySlug('livre-blanc'));

    expect(version.title).toBe('Livre Blanc');
    expect(version.status).toBe('PUBLISHED');
  });

  it('givenUnknownSlug_whenGetPublishedBySlug_thenErrors', async () => {
    await expect(firstValueFrom(createAdapter().getPublishedBySlug('unknown'))).rejects.toThrow();
  });

  it('givenPublishedSlug_whenListDocumentVersions_thenReturnsHistory', async () => {
    const versions = await firstValueFrom(createAdapter().listDocumentVersions('livre-blanc'));

    expect(versions.length).toBe(1);
  });

  it('givenUnknownSlug_whenListDocumentVersions_thenReturnsEmptyList', async () => {
    const versions = await firstValueFrom(createAdapter().listDocumentVersions('unknown'));

    expect(versions).toEqual([]);
  });
});
