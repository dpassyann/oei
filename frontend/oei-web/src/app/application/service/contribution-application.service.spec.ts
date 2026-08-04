import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ContributionApplicationService } from './contribution-application.service';
import { CONTRIBUTION_PORT, ContributionPort } from '../../domain/port/governance/contribution.port';
import { createContentContribution } from '../../domain/model/governance/content-contribution.model';

describe('ContributionApplicationService', () => {
  function createService(port: Partial<ContributionPort>): ContributionApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: CONTRIBUTION_PORT, useValue: port }] });
    return TestBed.inject(ContributionApplicationService);
  }

  it('givenListMine_whenCalled_thenDelegatesToPort', async () => {
    const listMine = vi.fn().mockReturnValue(of([]));
    const service = createService({ listMine });

    await firstValueFrom(service.listMine());

    expect(listMine).toHaveBeenCalled();
  });

  it('givenContributionAndCurrentBody_whenDiffed_thenReturnsLineDiff', () => {
    const service = createService({});
    const contribution = createContentContribution({
      id: 'c1',
      contentId: 'content-1',
      patch: 'a\nB',
      authorMemberId: 'member-demo',
      status: 'PROPOSED',
      createdAt: '2026-01-01T00:00:00Z',
    });

    const diff = service.diffAgainstCurrentBody(contribution, 'a\nb');

    expect(diff).toEqual([
      { type: 'unchanged', text: 'a' },
      { type: 'removed', text: 'b' },
      { type: 'added', text: 'B' },
    ]);
  });

  it('givenObservableCurrentBody_whenDiffed$_thenEmitsComputedDiff', async () => {
    const service = createService({});
    const contribution = createContentContribution({
      id: 'c1',
      contentId: 'content-1',
      patch: 'x',
      authorMemberId: 'member-demo',
      status: 'PROPOSED',
      createdAt: '2026-01-01T00:00:00Z',
    });

    const diff = await firstValueFrom(service.diffAgainstCurrentBody$(contribution, of('x')));

    expect(diff).toEqual([{ type: 'unchanged', text: 'x' }]);
  });
});
