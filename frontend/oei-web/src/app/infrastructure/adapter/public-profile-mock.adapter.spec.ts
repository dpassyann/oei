import { firstValueFrom } from 'rxjs';
import { PublicProfileMockAdapter } from './public-profile-mock.adapter';

describe('PublicProfileMockAdapter', () => {
  it('givenDemoPublicProfile_whenGetMyPublicProfile_thenReturnsItForDemoSlug', async () => {
    const adapter = new PublicProfileMockAdapter();
    const profile = await firstValueFrom(adapter.getMyPublicProfile());
    expect(profile.memberId).toBe('demo-member-1');
    expect(profile.publicSlug).toBe('demo-jane-dupont');
    expect(profile.viewsCount).toBe(42);
  });

  it('givenPublication_whenPublish_thenEchoesItBackWithDemoMemberIdAndFreshCounters', async () => {
    const adapter = new PublicProfileMockAdapter();
    const publication = { publicSlug: 'demo-jane-dupont', visibleFields: ['title'] };
    const result = await firstValueFrom(adapter.publish(publication));
    expect(result.memberId).toBe('demo-member-1');
    expect(result.publicSlug).toBe('demo-jane-dupont');
    expect(result.viewsCount).toBe(0);
    expect(result.publishedAt).toBeTruthy();
  });

  it('givenDemoSlug_whenGetBySlug_thenReturnsDemoPublicProfile', async () => {
    const adapter = new PublicProfileMockAdapter();
    const profile = await firstValueFrom(adapter.getBySlug('demo-jane-dupont'));
    expect(profile?.memberId).toBe('demo-member-1');
  });

  it('givenUnknownSlug_whenGetBySlug_thenReturnsNull', async () => {
    const adapter = new PublicProfileMockAdapter();
    const profile = await firstValueFrom(adapter.getBySlug('unknown-slug'));
    expect(profile).toBeNull();
  });
});
