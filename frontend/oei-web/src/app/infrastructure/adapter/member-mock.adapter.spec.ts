import { firstValueFrom } from 'rxjs';
import { MemberMockAdapter } from './member-mock.adapter';

describe('MemberMockAdapter', () => {
  it('givenDemoMember_whenGetCurrentMember_thenReturnsItLabeledAsDemonstration', async () => {
    const adapter = new MemberMockAdapter();
    const member = await firstValueFrom(adapter.getCurrentMember());
    expect(member.displayName).toContain('Démonstration');
    expect(member.publicSlug).toBe('demo-jane-dupont');
  });
});
