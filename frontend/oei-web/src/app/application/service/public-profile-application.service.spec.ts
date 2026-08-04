import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { PublicProfileApplicationService } from './public-profile-application.service';
import { PUBLIC_PROFILE_PORT, PublicProfilePort } from '../../domain/port/profile/public-profile.port';
import { PublicProfile } from '../../domain/model/profile/public-profile';

describe('PublicProfileApplicationService', () => {
  function setup(fakePort: PublicProfilePort) {
    TestBed.configureTestingModule({ providers: [{ provide: PUBLIC_PROFILE_PORT, useValue: fakePort }] });
    return TestBed.inject(PublicProfileApplicationService);
  }

  const profile: PublicProfile = {
    memberId: 'member-1',
    publicSlug: 'jane-dupont',
    visibleFields: ['title'],
    viewsCount: 1,
  };

  it('givenPortReturnsProfile_whenGetMyPublicProfile_thenForwardsIt', async () => {
    const service = setup({
      getMyPublicProfile: () => of(profile),
      publish: () => of(profile),
      getBySlug: () => of(null),
    });
    const result = await firstValueFrom(service.getMyPublicProfile());
    expect(result).toEqual(profile);
  });

  it('givenPublication_whenPublish_thenForwardsItToPort', async () => {
    let received: unknown;
    const publication = { publicSlug: 'jane-dupont', visibleFields: ['title'] };
    const service = setup({
      getMyPublicProfile: () => of(profile),
      publish: (p) => {
        received = p;
        return of(profile);
      },
      getBySlug: () => of(null),
    });
    const result = await firstValueFrom(service.publish(publication));
    expect(received).toEqual(publication);
    expect(result).toEqual(profile);
  });

  it('givenSlug_whenGetBySlug_thenForwardsSlugToPort', async () => {
    let receivedSlug: string | undefined;
    const service = setup({
      getMyPublicProfile: () => of(profile),
      publish: () => of(profile),
      getBySlug: (slug) => {
        receivedSlug = slug;
        return of(profile);
      },
    });
    const result = await firstValueFrom(service.getBySlug('jane-dupont'));
    expect(receivedSlug).toBe('jane-dupont');
    expect(result).toEqual(profile);
  });

  it('givenUnknownSlug_whenGetBySlug_thenReturnsNull', async () => {
    const service = setup({
      getMyPublicProfile: () => of(profile),
      publish: () => of(profile),
      getBySlug: () => of(null),
    });
    const result = await firstValueFrom(service.getBySlug('unknown-slug'));
    expect(result).toBeNull();
  });
});
