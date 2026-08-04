import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MemberApiAdapter } from './member-api.adapter';

describe('MemberApiAdapter', () => {
  function createAdapter(): { adapter: MemberApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MemberApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(MemberApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsMember_whenGetCurrentMember_thenCallsMemberMeEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getCurrentMember());
    const req = httpMock.expectOne('/api/member/v1/members/me');
    req.flush({
      id: 'member-1',
      publicSlug: 'jane-dupont',
      displayName: 'Jane Dupont',
      locale: 'fr',
      country: 'FR',
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });
});
