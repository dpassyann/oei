import { Service, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { LEAD_CAPTURE_PORT } from '../../domain/port/lead-capture.port';

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

  submitEmail(email: string): Observable<{ success: boolean }> {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      return of({ success: false });
    }
    return this.port.submit(trimmed).pipe(
      map(() => ({ success: true })),
      catchError(() => of({ success: false })),
    );
  }
}
