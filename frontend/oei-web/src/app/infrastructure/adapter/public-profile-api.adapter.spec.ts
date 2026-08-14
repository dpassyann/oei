import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PublicProfileApiAdapter } from './public-profile-api.adapter';
import { PublicProfile } from '../../domain/model/profile/public-profile';

describe('PublicProfileApiAdapter', () => {
  function createAdapter(): { adapter: PublicProfileApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [PublicProfileApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(PublicProfileApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  const profile: PublicProfile = {
    memberId: 'member-1',
    publicSlug: 'jane-dupont',
    visibleFields: ['title'],
    viewsCount: 1,
  };

  it('givenBackendReturnsProfile_whenGetMyPublicProfile_thenCallsPublicProfileEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getMyPublicProfile());
    const req = httpMock.expectOne('/api/member/v1/public-profile');
    expect(req.request.method).toBe('GET');
    req.flush(profile);
    expect((await result).publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });

  it('givenPublication_whenPublish_thenPostsBodyToPublishEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const publication = { publicSlug: 'jane-dupont', visibleFields: ['title'] };
    const result = firstValueFrom(adapter.publish(publication));
    const req = httpMock.expectOne('/api/member/v1/public-profile/publish');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(publication);
    req.flush(profile);
    expect((await result).publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });

  it('givenBackendReturnsProfile_whenGetBySlug_thenCallsPublicMembersEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getBySlug('jane-dupont'));
    const req = httpMock.expectOne('/api/public/v1/members/jane-dupont');
    expect(req.request.method).toBe('GET');
    req.flush(profile);
    expect((await result)?.publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });

  it('given404_whenGetBySlug_thenReturnsNull', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getBySlug('unknown-slug'));
    const req = httpMock.expectOne('/api/public/v1/members/unknown-slug');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
    httpMock.verify();
  });
});
