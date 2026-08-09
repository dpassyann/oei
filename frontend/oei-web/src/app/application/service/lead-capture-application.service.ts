import { Service, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { LEAD_CAPTURE_PORT } from '../../domain/port/lead-capture.port';
import { LoggingService } from '../../infrastructure/logging/logging.service';

// Deliberately simple (not RFC 5322-exhaustive): rejects obviously malformed input
// (missing '@', missing domain, empty/whitespace-only) without calling the backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `ContentApplicationService` (see application/service/content-application.service.ts).
//
// Returns an `Observable` (not a `Promise`) — see `src/app/infrastructure/adapter/README.md`
// for the RxJS-end-to-end architecture this service is part of. Submission failures are
// caught here and turned into a `{ success: false }` value rather than an Observable error, so
// callers can keep subscribing with a single `next` handler.
@Service()
export class LeadCaptureApplicationService {
  private readonly port = inject(LEAD_CAPTURE_PORT);
  private readonly logger = inject(LoggingService);

  submitEmail(email: string): Observable<{ success: boolean }> {
    const trimmed = email.trim();
    // Deliberately not logging the email address itself (PII, not needed to trace the
    // journey) — only the fact that a lead-capture form was submitted and its outcome.
    if (!EMAIL_PATTERN.test(trimmed)) {
      this.logger.warn('Lead capture submission rejected: invalid email format', undefined, 'LeadCaptureApplicationService');
      return of({ success: false });
    }
    this.logger.info('Lead capture submission started', undefined, 'LeadCaptureApplicationService');
    return this.port.submit(trimmed).pipe(
      map(() => {
        this.logger.info('Lead capture submission succeeded', undefined, 'LeadCaptureApplicationService');
        return { success: true };
      }),
      catchError((error: unknown) => {
        this.logger.error(
          'Lead capture submission failed',
          { error: error instanceof Error ? error.message : String(error) },
          'LeadCaptureApplicationService',
        );
        return of({ success: false });
      }),
    );
  }
}
