import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { CORRELATION_ID_HEADER, httpLoggingInterceptor } from './http-logging.interceptor';
import { CorrelationService } from './correlation.service';

describe('httpLoggingInterceptor', () => {
  function setup(): { http: HttpClient; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpLoggingInterceptor])), provideHttpClientTesting()],
    });
    return { http: TestBed.inject(HttpClient), httpMock: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('givenSameOriginRequest_whenSent_thenStampsTheCorrelationIdHeader', () => {
    const { http, httpMock } = setup();
    const correlationId = TestBed.inject(CorrelationService).value();

    http.get('/api/v1/leads').subscribe();

    const req = httpMock.expectOne('/api/v1/leads');
    expect(req.request.headers.get(CORRELATION_ID_HEADER)).toBe(correlationId);
    req.flush({});
    httpMock.verify();
  });

  it('givenCrossOriginRequest_whenSent_thenDoesNotAddTheCorrelationHeader', () => {
    const { http, httpMock } = setup();

    http.get('https://keycloak.example.com/protocol/openid-connect/auth').subscribe();

    const req = httpMock.expectOne('https://keycloak.example.com/protocol/openid-connect/auth');
    expect(req.request.headers.has(CORRELATION_ID_HEADER)).toBe(false);
    req.flush({});
    httpMock.verify();
  });

  it('givenSuccessfulResponse_whenReceived_thenLogsAsInfoAsStructuredJson', async () => {
    const { http, httpMock } = setup();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const result = firstValueFrom(http.get('/api/v1/leads'));
    httpMock.expectOne('/api/v1/leads').flush({ ok: true });
    await result;

    expect(infoSpy).toHaveBeenCalled();
    const responseLogLine = infoSpy.mock.calls.map((call) => call[0] as string).find((line) => line.includes('"status":200'));
    expect(responseLogLine).toBeDefined();
    const parsed = JSON.parse(responseLogLine as string) as Record<string, unknown>;
    expect(parsed['level']).toBe('info');
    expect(parsed['correlationId']).toBeTruthy();
  });

  it('givenBackendReturnsAnError_whenRequestFails_thenLogsAsErrorAndRethrows', async () => {
    const { http, httpMock } = setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = firstValueFrom(http.get('/api/v1/leads'));
    httpMock.expectOne('/api/v1/leads').flush('boom', { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toBeTruthy();
    expect(errorSpy).toHaveBeenCalled();
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string) as { level: string; meta: { status: number } };
    expect(parsed.level).toBe('error');
    expect(parsed.meta.status).toBe(500);
  });

  it('givenRequestBodyContainsAToken_whenLogged_thenTheTokenIsRedacted', () => {
    const { http, httpMock } = setup();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    http.post('/api/v1/session', { accessToken: 'super-secret-jwt-value' }).subscribe();
    httpMock.expectOne('/api/v1/session').flush({});

    const requestLogLine = infoSpy.mock.calls.map((call) => call[0] as string).find((line) => line.includes('"method":"POST"'));
    expect(requestLogLine).toBeDefined();
    expect(requestLogLine).not.toContain('super-secret-jwt-value');
    expect(requestLogLine).toContain('[REDACTED]');
  });
});
