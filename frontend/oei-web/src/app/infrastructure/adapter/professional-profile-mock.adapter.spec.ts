import { firstValueFrom } from 'rxjs';
import { ProfessionalProfileMockAdapter } from './professional-profile-mock.adapter';

describe('ProfessionalProfileMockAdapter', () => {
  it('givenDemoProfile_whenGetProfile_thenReturnsProfileForDemoMemberWithComputedScore', async () => {
    const adapter = new ProfessionalProfileMockAdapter();
    const profile = await firstValueFrom(adapter.getProfile());
    expect(profile.memberId).toBe('demo-member-1');
    expect(profile.experiences.every((experience) => experience.isDemoData)).toBe(true);
    expect(profile.completenessScore).toBeGreaterThan(0);
  });

  it('givenProfile_whenUpdateProfile_thenEchoesItBack', async () => {
    const adapter = new ProfessionalProfileMockAdapter();
    const input = await firstValueFrom(adapter.getProfile());
    const updated = { ...input, title: 'Nouveau titre' };
    const result = await firstValueFrom(adapter.updateProfile(updated));
    expect(result).toEqual(updated);
  });
});
