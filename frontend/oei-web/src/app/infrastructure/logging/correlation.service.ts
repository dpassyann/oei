import { Service, computed, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

/**
 * Mints a correlation ID per user *journey* rather than per HTTP request (unlike the IAP
 * `iap-common` original this is adapted from — see this module's README). A fresh ID is
 * generated once at bootstrap and again on every `NavigationStart`, so every log line and
 * every outgoing HTTP request made while the user stays on a given page shares the same
 * `correlationId` — the granularity that best supports "suivre de bout en bout les
 * interactions utilisateur" (end-to-end tracing of a user's navigation, not just of a
 * single request).
 */
@Service()
export class CorrelationService {
  // `Router` is optional so this service stays constructible in unit tests that don't set
  // up routing (e.g. a bare `TestBed.configureTestingModule` for the logger itself).
  private readonly router = inject(Router, { optional: true });
  private readonly correlationId = signal<string>(this.generate());

  readonly current = computed(() => this.correlationId());

  constructor() {
    this.router?.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.correlationId.set(this.generate());
      }
    });
  }

  /** Current correlation ID for the ongoing navigation. */
  value(): string {
    return this.correlationId();
  }

  /** Forces a new correlation ID (e.g. for a background flow started outside the router). */
  renew(): string {
    const next = this.generate();
    this.correlationId.set(next);
    return next;
  }

  private generate(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
