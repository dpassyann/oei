import { firstValueFrom } from 'rxjs';
import { ArticleModerationMockAdapter, getApprovedArticleSubmissions, resetArticleModerationFixtures } from './article-moderation-mock.adapter';

describe('ArticleModerationMockAdapter', () => {
  beforeEach(() => {
    resetArticleModerationFixtures();
  });

  it('givenSeedData_whenListPending_thenReturnsThreeDemoSubmissions', async () => {
    const adapter = new ArticleModerationMockAdapter();
    const pending = await firstValueFrom(adapter.listPending());
    expect(pending.length).toBe(3);
    expect(pending.every((submission) => submission.status === 'pending')).toBe(true);
  });

  it('givenPendingSubmission_whenApprove_thenNoLongerListedAsPendingAndSurfacedAsApproved', async () => {
    const adapter = new ArticleModerationMockAdapter();
    const [first] = await firstValueFrom(adapter.listPending());

    await firstValueFrom(adapter.approve(first.id));

    const pendingAfter = await firstValueFrom(adapter.listPending());
    expect(pendingAfter.find((submission) => submission.id === first.id)).toBeUndefined();
    expect(getApprovedArticleSubmissions().some((submission) => submission.id === first.id)).toBe(true);
  });

  it('givenPendingSubmission_whenReject_thenNoLongerListedAsPendingAndNotSurfacedAsApproved', async () => {
    const adapter = new ArticleModerationMockAdapter();
    const [first] = await firstValueFrom(adapter.listPending());

    await firstValueFrom(adapter.reject(first.id, 'Hors sujet'));

    const pendingAfter = await firstValueFrom(adapter.listPending());
    expect(pendingAfter.find((submission) => submission.id === first.id)).toBeUndefined();
    expect(getApprovedArticleSubmissions().some((submission) => submission.id === first.id)).toBe(false);
  });

  it('givenUnknownId_whenApprove_thenErrors', async () => {
    const adapter = new ArticleModerationMockAdapter();
    await expect(firstValueFrom(adapter.approve('does-not-exist'))).rejects.toThrow();
  });
});
