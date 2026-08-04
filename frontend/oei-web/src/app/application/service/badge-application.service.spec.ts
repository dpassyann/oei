import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { BadgeApplicationService } from './badge-application.service';
import { BADGE_PORT, BadgePort } from '../../domain/port/badge/badge.port';
import { createBadgeAward } from '../../domain/model/badge/badge';

describe('BadgeApplicationService', () => {
  function setup(fakePort: BadgePort) {
    TestBed.configureTestingModule({ providers: [{ provide: BADGE_PORT, useValue: fakePort }] });
    return TestBed.inject(BadgeApplicationService);
  }

  it('givenPortReturnsBadgeAwards_whenListMyBadgeAwards_thenForwardsThem', async () => {
    const expected = [
      createBadgeAward({
        id: 'badge-award-1',
        badgeId: 'badge-member',
        memberId: 'member-1',
        awardedAt: '2026-01-01T00:00:00Z',
        source: 'AUTOMATIC',
        revoked: false,
      }),
    ];
    const service = setup({ listMyBadgeAwards: () => of(expected) });
    const awards = await firstValueFrom(service.listMyBadgeAwards());
    expect(awards).toEqual(expected);
  });
});
