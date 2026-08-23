import { TestBed } from '@angular/core/testing';
import { CookieConsentService } from './cookie-consent.service';

describe('CookieConsentService', () => {
  function clearConsentCookie(): void {
    document.cookie = 'oei_cookie_consent=; Max-Age=0; Path=/';
  }

  beforeEach(() => {
    clearConsentCookie();
    TestBed.resetTestingModule();
  });

  it('shows the banner when no consent cookie exists', () => {
    const service = TestBed.inject(CookieConsentService);
    expect(service.shouldShowBanner()).toBe(true);
    expect(service.decision()).toBeUndefined();
  });

  it('stores accept decision in a persistent cookie', () => {
    const service = TestBed.inject(CookieConsentService);

    service.accept();

    expect(service.shouldShowBanner()).toBe(false);
    expect(service.decision()).toBe('accept');
    expect(document.cookie).toContain('oei_cookie_consent=accept%3A2026-08');
  });

  it('stores reject decision in a persistent cookie', () => {
    const service = TestBed.inject(CookieConsentService);

    service.rejectOptional();

    expect(service.shouldShowBanner()).toBe(false);
    expect(service.decision()).toBe('reject');
    expect(document.cookie).toContain('oei_cookie_consent=reject%3A2026-08');
  });
});

