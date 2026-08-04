import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AdminContentMockAdapter, resetAdminContentFixtures } from './admin-content-mock.adapter';

describe('AdminContentMockAdapter', () => {
  let adapter: AdminContentMockAdapter;

  beforeEach(() => {
    resetAdminContentFixtures();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(AdminContentMockAdapter);
  });

  it('givenNoCriteria_whenListed_thenReturnsAllDemoContents', async () => {
    const contents = await firstValueFrom(adapter.list());

    expect(contents.length).toBeGreaterThanOrEqual(3);
    expect(contents.some((content) => content.status === 'PUBLISHED')).toBe(true);
    expect(contents.some((content) => content.status === 'DRAFT')).toBe(true);
  });

  it('givenTypeFilter_whenListed_thenReturnsOnlyMatchingType', async () => {
    const contents = await firstValueFrom(adapter.list({ type: 'WHITEPAPER' }));

    expect(contents.every((content) => content.type === 'WHITEPAPER')).toBe(true);
    expect(contents.length).toBe(1);
  });

  it('givenFreeTextQuery_whenListed_thenSearchesTitleAndBody', async () => {
    const contents = await firstValueFrom(adapter.list({ q: 'Article 1' }));

    expect(contents.map((content) => content.id)).toContain('content-reglement-interieur');
  });

  it('givenTagFilter_whenListed_thenReturnsOnlyMatchingTag', async () => {
    const contents = await firstValueFrom(adapter.list({ tag: 'éthique' }));

    expect(contents.map((content) => content.id)).toEqual(['content-charte-ethique']);
  });

  it('givenUnknownId_whenGetById_thenErrors', async () => {
    await expect(firstValueFrom(adapter.getById('does-not-exist'))).rejects.toThrow();
  });

  it('givenNewContent_whenCreated_thenAppearsInDraftStatus', async () => {
    const created = await firstValueFrom(
      adapter.create({ type: 'ARTICLE', slug: 'nouvel-article', sourceType: 'CMS', title: 'Nouvel article' }),
    );

    expect(created.status).toBe('DRAFT');
    const all = await firstValueFrom(adapter.list());
    expect(all.map((content) => content.id)).toContain(created.id);
  });

  it('givenDraftContent_whenSubmitted_thenMovesToInReview', async () => {
    const created = await firstValueFrom(
      adapter.create({ type: 'ARTICLE', slug: 'a-soumettre', sourceType: 'CMS', title: 'À soumettre' }),
    );

    const submitted = await firstValueFrom(adapter.submit(created.id));

    expect(submitted.status).toBe('IN_REVIEW');
  });

  it('givenContentInReview_whenApprovedThenPublished_thenReachesPublished', async () => {
    const id = 'content-reglement-interieur';

    await firstValueFrom(adapter.approve(id, { role: 'LEGAL', decision: 'APPROVED' }));
    await firstValueFrom(adapter.approve(id, { role: 'GOVERNANCE', decision: 'APPROVED' }));
    await firstValueFrom(adapter.approve(id, { role: 'GOVERNANCE', decision: 'APPROVED' }));
    const published = await firstValueFrom(adapter.publish(id));

    expect(published.contentVersionId).toBe('version-reglement-1');
    const content = await firstValueFrom(adapter.getById(id));
    expect(content.status).toBe('PUBLISHED');
  });

  it('givenPublishedContent_whenArchived_thenMovesToArchived', async () => {
    const archived = await firstValueFrom(adapter.archive('content-livre-blanc'));

    expect(archived.status).toBe('ARCHIVED');
  });

  it('givenContentInReview_whenRejected_thenReturnsToDraft', async () => {
    const rejected = await firstValueFrom(adapter.reject('content-reglement-interieur', 'Manque de clarté (exemple).'));

    expect(rejected.status).toBe('DRAFT');
  });

  it('givenNewVersion_whenCreated_thenBecomesCurrentVersionInDraft', async () => {
    const version = await firstValueFrom(
      adapter.createVersion('content-livre-blanc', { language: 'fr', title: 'Livre Blanc v2', body: 'Nouveau corps.' }),
    );

    expect(version.status).toBe('DRAFT');
    const content = await firstValueFrom(adapter.getById('content-livre-blanc'));
    expect(content.currentVersionId).toBe(version.id);
    expect(content.status).toBe('DRAFT');
  });

  it('givenTranslationRequested_whenAdded_thenListedAsPending', async () => {
    const translation = await firstValueFrom(adapter.addTranslation('content-livre-blanc', { language: 'de' }));

    expect(translation.status).toBe('PENDING');
  });
});
