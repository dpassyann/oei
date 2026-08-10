import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { DigitalBusinessCardApiAdapter } from './digital-business-card-api.adapter';

describe('DigitalBusinessCardApiAdapter', () => {
  function createAdapter(): { adapter: DigitalBusinessCardApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [DigitalBusinessCardApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      adapter: TestBed.inject(DigitalBusinessCardApiAdapter),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('givenBackendReturnsCard_whenGenerateCard_thenPostsToDigitalCardEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.generateCard());
    const req = httpMock.expectOne('/api/member/v1/digital-card');
    expect(req.request.method).toBe('POST');
    req.flush({
      memberId: 'member-1',
      publicSlug: 'jane-dupont',
      qrCodeUrl: '/qr.svg',
      vCardUrl: '/card.vcf',
      theme: 'default',
    });
    expect((await result).publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });

  it('givenBackendReturnsCard_whenGetPublicCard_thenGetsPublicMembersDigitalCardEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getPublicCard('jane-dupont'));
    const req = httpMock.expectOne('/api/public/v1/members/jane-dupont/digital-card');
    expect(req.request.method).toBe('GET');
    req.flush({ memberId: 'member-1', publicSlug: 'jane-dupont' });
    expect((await result)?.publicSlug).toBe('jane-dupont');
    httpMock.verify();
  });

  it('givenBackend404_whenGetPublicCard_thenResolvesToNull', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getPublicCard('unknown-slug'));
    const req = httpMock.expectOne('/api/public/v1/members/unknown-slug/digital-card');
    req.flush('not found', { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
    httpMock.verify();
  });
});
