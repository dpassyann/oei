import { Service, inject } from '@angular/core';
import { LEAD_CAPTURE_PORT } from '../../domain/port/lead-capture.port';

// Deliberately simple (not RFC 5322-exhaustive): rejects obviously malformed input
// (missing '@', missing domain, empty/whitespace-only) without calling the backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `ContentApplicationService` (see application/service/content-application.service.ts).
@Service()
export class LeadCaptureApplicationService {
  private readonly port = inject(LEAD_CAPTURE_PORT);

  async submitEmail(email: string): Promise<{ success: boolean }> {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      return { success: false };
    }
    try {
      await this.port.submit(trimmed);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
