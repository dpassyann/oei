import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ProfessionalProfileApiAdapter } from './professional-profile-api.adapter';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

describe('ProfessionalProfileApiAdapter', () => {
  function createAdapter(): { adapter: ProfessionalProfileApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [ProfessionalProfileApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      adapter: TestBed.inject(ProfessionalProfileApiAdapter),
      httpMock: TestBed.inject(HttpTestingController),
    };
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

  it('givenBackendReturnsProfile_whenGetProfile_thenCallsProfileEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getProfile());
    const req = httpMock.expectOne('/api/member/v1/profile');
    expect(req.request.method).toBe('GET');
    req.flush(profile);
    expect((await result).memberId).toBe('member-1');
    httpMock.verify();
  });

  it('givenProfile_whenUpdateProfile_thenPutsWholeProfileToProfileEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.updateProfile(profile));
    const req = httpMock.expectOne('/api/member/v1/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(profile);
    req.flush(profile);
    expect((await result).memberId).toBe('member-1');
    httpMock.verify();
  });
});
