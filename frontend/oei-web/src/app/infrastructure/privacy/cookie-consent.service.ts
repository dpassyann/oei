import { Service, computed, signal } from '@angular/core';

const CONSENT_COOKIE_NAME = 'oei_cookie_consent';
const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
const CONSENT_POLICY_VERSION = '2026-08';

type ConsentDecision = 'accept' | 'reject';

function parseConsentCookie(rawCookie: string): ConsentDecision | undefined {
  const cookies = rawCookie.split(';').map((segment) => segment.trim());
  const cookiePrefix = `${CONSENT_COOKIE_NAME}=`;
  const entry = cookies.find((cookie) => cookie.startsWith(cookiePrefix));
  if (!entry) {
    return undefined;
  }
  const value = decodeURIComponent(entry.slice(cookiePrefix.length));
  const [decision] = value.split(':');
  return decision === 'accept' || decision === 'reject' ? decision : undefined;
}

@Service()
export class CookieConsentService {
  private readonly decisionSignal = signal<ConsentDecision | undefined>(
    typeof document === 'undefined' ? undefined : parseConsentCookie(document.cookie),
  );

  readonly decision = this.decisionSignal.asReadonly();
  readonly shouldShowBanner = computed(() => this.decisionSignal() === undefined);

  accept(): void {
    this.persistDecision('accept');
  }

  rejectOptional(): void {
    this.persistDecision('reject');
  }

  private persistDecision(decision: ConsentDecision): void {
    this.decisionSignal.set(decision);
    if (typeof document === 'undefined') {
      return;
    }
    const value = encodeURIComponent(`${decision}:${CONSENT_POLICY_VERSION}`);
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  }
}

