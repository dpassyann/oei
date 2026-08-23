import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

const API_VERSION_HEADER = 'API-Version';
const DEFAULT_API_VERSION = '1';

function isSameOriginApiRequest(url: string): boolean {
  const absoluteUrl = new URL(url, window.location.origin);
  return absoluteUrl.origin === window.location.origin && absoluteUrl.pathname.startsWith('/api/');
}

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isSameOriginApiRequest(req.url)) {
    return next(req);
  }

  const headersToSet: Record<string, string> = {};
  if (!req.headers.has(API_VERSION_HEADER)) {
    headersToSet[API_VERSION_HEADER] = DEFAULT_API_VERSION;
  }

  const oauthService = inject(OAuthService);
  if (oauthService.hasValidAccessToken()) {
    const accessToken = oauthService.getAccessToken();
    if (accessToken) {
      headersToSet['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return Object.keys(headersToSet).length > 0
    ? next(req.clone({ setHeaders: headersToSet }))
    : next(req);
};

