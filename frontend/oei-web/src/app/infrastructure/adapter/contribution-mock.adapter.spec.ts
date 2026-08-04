import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContributionMockAdapter, resetContributionFixtures } from './contribution-mock.adapter';

describe('ContributionMockAdapter', () => {
  let adapter: ContributionMockAdapter;

  beforeEach(() => {
    resetContributionFixtures();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(ContributionMockAdapter);
  });

  it('givenDemoData_whenListMine_thenReturnsTheMemberDemoContribution', async () => {
    const contributions = await firstValueFrom(adapter.listMine());

    expect(contributions.length).toBe(1);
    expect(contributions[0].status).toBe('PROPOSED');
  });

  it('givenContentId_whenListForContent_thenFiltersByContent', async () => {
    const contributions = await firstValueFrom(adapter.listForContent('content-reglement-interieur'));

    expect(contributions.length).toBe(1);
    expect(await firstValueFrom(adapter.listForContent('content-livre-blanc'))).toEqual([]);
  });

  it('givenNewPatch_whenCreated_thenAppearsInMineWithProposedStatus', async () => {
    const created = await firstValueFrom(adapter.create({ contentId: 'content-livre-blanc', patch: 'patch' }));

    expect(created.status).toBe('PROPOSED');
    const mine = await firstValueFrom(adapter.listMine());
    expect(mine.map((c) => c.id)).toContain(created.id);
  });

  it('givenContribution_whenCommentAdded_thenListedInComments', async () => {
    await firstValueFrom(adapter.addComment('contribution-reglement-1', 'Nouveau commentaire.'));

    const comments = await firstValueFrom(adapter.listComments('contribution-reglement-1'));
    expect(comments.length).toBe(2);
    expect(comments[1].body).toBe('Nouveau commentaire.');
  });
});
