import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ProfessionalProfileApplicationService } from './professional-profile-application.service';
import {
  PROFESSIONAL_PROFILE_PORT,
  ProfessionalProfilePort,
} from '../../domain/port/profile/professional-profile.port';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

describe('ProfessionalProfileApplicationService', () => {
  function setup(fakePort: ProfessionalProfilePort) {
    TestBed.configureTestingModule({ providers: [{ provide: PROFESSIONAL_PROFILE_PORT, useValue: fakePort }] });
    return TestBed.inject(ProfessionalProfileApplicationService);
  }

  const profile: ProfessionalProfile = {
    memberId: 'member-1',
    expertiseAreas: [],
    technologies: [],
    sectors: [],
    languages: [],
    experiences: [],
    educations: [],
    skills: [],
    completenessScore: 0,
  };

  it('givenPortReturnsProfile_whenGetProfile_thenForwardsIt', async () => {
    const service = setup({ getProfile: () => of(profile), updateProfile: () => of(profile) });
    const result = await firstValueFrom(service.getProfile());
    expect(result).toEqual(profile);
  });

  it('givenProfile_whenUpdateProfile_thenForwardsItToPort', async () => {
    let receivedProfile: ProfessionalProfile | undefined;
    const service = setup({
      getProfile: () => of(profile),
      updateProfile: (p: ProfessionalProfile) => {
        receivedProfile = p;
        return of(p);
      },
    });
    const result = await firstValueFrom(service.updateProfile(profile));
    expect(receivedProfile).toEqual(profile);
    expect(result).toEqual(profile);
  });
});
