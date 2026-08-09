import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { CorrelationService } from './correlation.service';
import { LoggingService } from './logging.service';

/** Header carrying the current navigation's correlation ID to the (mock or real) backend. */
export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

/**
 * Functional `HttpInterceptorFn` (Angular 22 style — no `HttpInterceptor` class/NgModule)
 * that:
 * 1. Stamps every same-origin outgoing request with `X-Correlation-Id` so the backend can
 *    join its own logs to this request's user journey.
 * 2. Logs the request/response/error through `LoggingService` as structured JSON, with
 *    request/response bodies passed through `redactSensitiveData` (via `LoggingService`) —
 *    so a token, password or full CV body never ends up in a log line.
 *
 * Cross-origin requests (e.g. Keycloak's `/protocol/openid-connect/...` endpoints) are left
 * untouched: adding a custom header to them would trigger a CORS preflight they are not
 * configured for, exactly as in the `iap-common` original (`correlation.interceptor.ts`).
 */
export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const correlation = inject(CorrelationService);
  const logger = inject(LoggingService);

  const isSameOrigin = !req.url.startsWith('http') || req.url.startsWith(window.location.origin);
  if (!isSameOrigin) {
    return next(req);
  }

  const correlationId = correlation.value();
  const stampedReq = req.clone({ setHeaders: { [CORRELATION_ID_HEADER]: correlationId } });
  const startedAt = performance.now();

  logger.info(`HTTP request → ${stampedReq.method} ${stampedReq.url}`, {
    method: stampedReq.method,
    url: stampedReq.url,
    body: stampedReq.body,
  }, 'HttpLoggingInterceptor');

  return next(stampedReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        logger.info(`HTTP response ← ${stampedReq.method} ${stampedReq.url} (${event.status})`, {
          method: stampedReq.method,
          url: stampedReq.url,
          status: event.status,
          durationMs: Math.round(performance.now() - startedAt),
          body: event.body,
        }, 'HttpLoggingInterceptor');
      }
    }),
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : undefined;
      logger.error(`HTTP error ← ${stampedReq.method} ${stampedReq.url}`, {
        method: stampedReq.method,
        url: stampedReq.url,
        status: httpError?.status,
        statusText: httpError?.statusText,
        durationMs: Math.round(performance.now() - startedAt),
        body: httpError?.error,
      }, 'HttpLoggingInterceptor');
      return throwError(() => error);
    }),
  );
};
