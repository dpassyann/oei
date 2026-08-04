import { firstValueFrom } from 'rxjs';
import { BadgeMockAdapter } from './badge-mock.adapter';

describe('BadgeMockAdapter', () => {
  it('givenDemoMember_whenListMyBadgeAwards_thenReturnsAwardsWithDenormalizedBadge', async () => {
    const adapter = new BadgeMockAdapter();
    const awards = await firstValueFrom(adapter.listMyBadgeAwards());
    expect(awards.length).toBeGreaterThanOrEqual(2);
    expect(awards.every((award) => award.memberId === 'demo-member-1')).toBe(true);
    expect(awards.every((award) => award.badge !== undefined)).toBe(true);
    expect(awards.every((award) => award.revoked === false)).toBe(true);
  });
});
