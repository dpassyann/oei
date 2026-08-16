import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

function isSameOriginApiRequest(url: string): boolean {
  const absoluteUrl = new URL(url, window.location.origin);
  return absoluteUrl.origin === window.location.origin && absoluteUrl.pathname.startsWith('/api/');
}

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isSameOriginApiRequest(req.url)) {
    return next(req);
  }

  const oauthService = inject(OAuthService);
  if (!oauthService.hasValidAccessToken()) {
    return next(req);
  }

  const accessToken = oauthService.getAccessToken();
  if (!accessToken) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));
};

