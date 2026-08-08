import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ArticleSubmissionMockAdapter } from './article-submission-mock.adapter';

describe('ArticleSubmissionMockAdapter', () => {
  function createAdapter(): ArticleSubmissionMockAdapter {
    TestBed.configureTestingModule({});
    return TestBed.inject(ArticleSubmissionMockAdapter);
  }

  it('givenDraft_whenSubmit_thenReturnsPendingSubmission', async () => {
    const adapter = createAdapter();

    const submission = await firstValueFrom(
      adapter.submit({ title: 'Mon article', body: 'Contenu de démonstration.' }),
    );

    expect(submission.status).toBe('pending');
    expect(submission.title).toBe('Mon article');
    expect(submission.authorId).toBe('demo-member-1');
  });

  it('givenPriorSubmissions_whenListMine_thenReturnsThemInOrder', async () => {
    const adapter = createAdapter();
    await firstValueFrom(adapter.submit({ title: 'Premier', body: 'Corps 1' }));
    await firstValueFrom(adapter.submit({ title: 'Second', body: 'Corps 2' }));

    const mine = await firstValueFrom(adapter.listMine());

    expect(mine.map((s) => s.title)).toEqual(['Premier', 'Second']);
    expect(mine.every((s) => s.status === 'pending')).toBe(true);
  });
});
