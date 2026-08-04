import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { BadgeApiAdapter } from './badge-api.adapter';

describe('BadgeApiAdapter', () => {
  function createAdapter(): { adapter: BadgeApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [BadgeApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(BadgeApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsBadgeAwards_whenListMyBadgeAwards_thenCallsBadgesEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listMyBadgeAwards());
    const req = httpMock.expectOne('/api/member/v1/badges');
    req.flush([
      {
        id: 'badge-award-1',
        badgeId: 'badge-member',
        memberId: 'member-1',
        awardedAt: '2026-01-01T00:00:00Z',
        source: 'AUTOMATIC',
        revoked: false,
      },
    ]);
    expect((await result)[0].badgeId).toBe('badge-member');
    httpMock.verify();
  });
});
