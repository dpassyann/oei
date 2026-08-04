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
});
