import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { vi } from 'vitest';
import { bearerTokenInterceptor } from './bearer-token.interceptor';

describe('bearerTokenInterceptor', () => {
  function setup(oauthOverrides?: Partial<Pick<OAuthService, 'hasValidAccessToken' | 'getAccessToken'>>) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([bearerTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: OAuthService,
          useValue: {
            hasValidAccessToken: vi.fn().mockReturnValue(false),
            getAccessToken: vi.fn().mockReturnValue(''),
            ...(oauthOverrides ?? {}),
          },
        },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('adds the bearer token to same-origin api requests when authenticated', () => {
    const { http, httpMock } = setup({ hasValidAccessToken: () => true, getAccessToken: () => 'access-token' });

    http.get('/api/member/v1/profile').subscribe();
    const req = httpMock.expectOne('/api/member/v1/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token');
    expect(req.request.headers.get('API-Version')).toBe('1');
    req.flush({});

    httpMock.verify();
  });

  it('does not add a bearer token when the request is not authenticated', () => {
    const { http, httpMock } = setup();

    http.get('/api/public/v1/recognized-certifications').subscribe();
    const req = httpMock.expectOne('/api/public/v1/recognized-certifications');
    expect(req.request.headers.get('Authorization')).toBeNull();
    expect(req.request.headers.get('API-Version')).toBe('1');
    req.flush([]);

    httpMock.verify();
  });

  it('preserves API-Version when already provided by the caller', () => {
    const { http, httpMock } = setup();

    http.get('/api/public/v1/recognized-certifications', { headers: { 'API-Version': '2' } }).subscribe();
    const req = httpMock.expectOne('/api/public/v1/recognized-certifications');
    expect(req.request.headers.get('API-Version')).toBe('2');
    req.flush([]);

    httpMock.verify();
  });
});

