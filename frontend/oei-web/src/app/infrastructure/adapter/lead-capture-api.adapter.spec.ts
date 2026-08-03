import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { LeadCaptureApiAdapter } from './lead-capture-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('LeadCaptureApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: LeadCaptureApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        LeadCaptureApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(LeadCaptureApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenEmail_whenSubmit_thenPostsToLeadsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.submit('jane.doe@example.com'));
    const req = httpMock.expectOne('/api/v1/leads');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'jane.doe@example.com' });
    req.flush(null);

    await expect(result).resolves.toBeUndefined();
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenSubmit_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.submit('jane.doe@example.com'));
    const req = httpMock.expectOne('/custom-api/leads');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    await result;
    httpMock.verify();
  });

  it('givenNonOkResponse_whenSubmit_thenThrows', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.submit('bad'));
    const req = httpMock.expectOne('/api/v1/leads');
    req.flush(null, { status: 400, statusText: 'Bad Request' });

    await expect(result).rejects.toThrow();
    httpMock.verify();
  });
});
