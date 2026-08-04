import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Inscription } from './inscription';
import { ACCOUNT_REGISTRATION_PORT, AccountRegistrationPort } from '../../../domain/port/identity/account-registration.port';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { Member } from '../../../domain/model/identity/member';

interface InscriptionTestHandle {
  readonly email: { set(value: string): void };
  readonly country: { set(value: string): void };
  readonly consentAccepted: { set(value: boolean): void };
  submit(): void;
}

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const NEW_MEMBER: Member = {
  id: 'new-member-1',
  publicSlug: 'nouveau-membre',
  displayName: 'nouveau.membre',
  locale: 'fr',
  country: 'FR',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('Inscription', () => {
  function configure(port: AccountRegistrationPort): { setMockAuthenticated: ReturnType<typeof vi.fn> } {
    const setMockAuthenticated = vi.fn();
    const fakeKeycloak = { setMockAuthenticated } as unknown as KeycloakAuthService;
    TestBed.configureTestingModule({
      imports: [Inscription],
      providers: [
        provideRouter([]),
        { provide: ACCOUNT_REGISTRATION_PORT, useValue: port },
        { provide: KeycloakAuthService, useValue: fakeKeycloak },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      ],
    });
    return { setMockAuthenticated };
  }

  it('givenIncompleteForm_whenSubmit_thenDoesNotCallRegisterPort', () => {
    const register = vi.fn().mockReturnValue(of(NEW_MEMBER));
    configure({ register });
    const fixture = TestBed.createComponent(Inscription);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as InscriptionTestHandle;

    component.submit(); // email/country empty, consent not accepted

    expect(register).not.toHaveBeenCalled();
  });

  it('givenValidFreeRegistration_whenSubmit_thenCreatesAccountAndShowsBothPaymentChoices', () => {
    const register = vi.fn().mockReturnValue(of(NEW_MEMBER));
    const { setMockAuthenticated } = configure({ register });
    const fixture = TestBed.createComponent(Inscription);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as InscriptionTestHandle;

    component.email.set('jane@example.com');
    component.country.set('FR');
    component.consentAccepted.set(true);
    component.submit();
    fixture.detectChanges();

    expect(register).toHaveBeenCalledWith({ email: 'jane@example.com', locale: 'fr', country: 'FR', consentAccepted: true });
    expect(setMockAuthenticated).toHaveBeenCalledWith(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/espace-membre/cotisation"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/espace-membre/profil"]')).toBeTruthy();
  });

  it('givenRegistrationFails_whenSubmit_thenShowsErrorMessage', () => {
    const register = vi.fn().mockReturnValue(throwError(() => new Error('boom')));
    configure({ register });
    const fixture = TestBed.createComponent(Inscription);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as InscriptionTestHandle;

    component.email.set('jane@example.com');
    component.country.set('FR');
    component.consentAccepted.set(true);
    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('inscription.error');
  });
});
