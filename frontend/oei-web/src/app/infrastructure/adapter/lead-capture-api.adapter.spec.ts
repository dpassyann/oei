import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LeadCaptureApiAdapter } from './lead-capture-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('LeadCaptureApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): LeadCaptureApiAdapter {
    TestBed.configureTestingModule({
      providers: [LeadCaptureApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(LeadCaptureApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenEmail_whenSubmit_thenPostsToLeadsEndpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    await expect(adapter.submit('jane.doe@example.com')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jane.doe@example.com' }),
    });
  });

  it('givenNonDefaultApiBaseUrl_whenSubmit_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    await adapter.submit('jane.doe@example.com');

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/leads', expect.objectContaining({ method: 'POST' }));
  });

  it('givenNonOkResponse_whenSubmit_thenThrows', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    const adapter = createAdapter('/api/v1');
    await expect(adapter.submit('bad')).rejects.toThrow();
  });
});
