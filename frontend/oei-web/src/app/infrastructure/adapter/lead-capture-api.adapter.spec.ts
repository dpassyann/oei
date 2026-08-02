import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LeadCaptureApiAdapter } from './lead-capture-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('LeadCaptureApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): LeadCaptureApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LeadCaptureApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(LeadCaptureApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenEmail_whenSubmit_thenPostsToLeadsEndpoint', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.submit('jane.doe@example.com');
    const req = httpMock.expectOne('/api/v1/leads');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'jane.doe@example.com' });
    req.flush(null);
    await expect(promise).resolves.toBeUndefined();
  });

  it('givenNonDefaultApiBaseUrl_whenSubmit_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.submit('jane.doe@example.com');
    const req = httpMock.expectOne('/custom-api/leads');
    req.flush(null);
    await expect(promise).resolves.toBeUndefined();
  });
});
