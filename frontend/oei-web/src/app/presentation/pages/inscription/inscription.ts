import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountRegistrationApplicationService } from '../../../application/service/account-registration-application.service';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../domain/model/document';
import { Member } from '../../../domain/model/identity/member';
import { I18nService } from '../../i18n/i18n.service';

type RegistrationStatus = 'idle' | 'submitting' | 'success' | 'error';

// Public, unguarded account-creation page — reached from the home hero's "Rejoignez le
// mouvement" button when the visitor isn't authenticated (see `home.ts`'s `onJoinClick`).
// Deliberately distinct from `/espace-membre/inscription` (`Onboarding`): that page is the
// detailed *professional* onboarding wizard (experiences, CV, expertise areas...) reachable
// only once already authenticated, whereas this page is the minimal, free, public "create an
// account" step — no cotisation is collected here (see `AccountRegistration` doc comment).
@Component({
  selector: 'oei-inscription',
  imports: [FormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  private readonly accountRegistration = inject(AccountRegistrationApplicationService);
  private readonly keycloakAuth = inject(KeycloakAuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly supportedLanguages = SUPPORTED_LANGUAGES;

  protected readonly email = signal('');
  protected readonly locale = signal<SupportedLanguage>('fr');
  protected readonly country = signal('');
  protected readonly consentAccepted = signal(false);

  protected readonly status = signal<RegistrationStatus>('idle');
  protected readonly createdMember = signal<Member | undefined>(undefined);

  protected readonly canSubmit = computed(
    () => this.email().trim().length > 0 && this.country().trim().length > 0 && this.consentAccepted() && this.status() !== 'submitting',
  );

  protected setLocale(value: string): void {
    this.locale.set(value as SupportedLanguage);
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.status.set('submitting');
    this.accountRegistration
      .register({
        email: this.email().trim(),
        locale: this.locale(),
        country: this.country().trim(),
        consentAccepted: this.consentAccepted(),
      })
      .subscribe({
        next: (member) => {
          this.createdMember.set(member);
          this.status.set('success');
          // Mocked "the new account is immediately signed in" step — no real Keycloak
          // callback/token-exchange is implemented (see `KeycloakAuthService` doc comment),
          // so route guards (e.g. `memberSpaceGuard`, protecting the "payer maintenant" /
          // "plus tard" destinations below) rely on this mocked session mechanism instead.
          this.keycloakAuth.setMockAuthenticated(true);
        },
        error: () => this.status.set('error'),
      });
  }
}
