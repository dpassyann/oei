import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileImportApplicationService } from '../../../../application/service/profile-import-application.service';
import { LinkedinOAuthService } from '../../../../infrastructure/auth/linkedin-oauth.service';
import { RuntimeConfig } from '../../../../infrastructure/config/runtime-config';

@Component({
  selector: 'oei-linkedin-callback',
  template: `
    <div class="smart-onboarding__step smart-onboarding__step--centered">
      <h1 class="smart-onboarding__title">Connexion LinkedIn en cours...</h1>
      <p class="smart-onboarding__subtitle">Nous finalisons l'import de votre identite.</p>
    </div>
  `,
})
export class LinkedinCallback {
  private readonly router = inject(Router);
  private readonly importService = inject(ProfileImportApplicationService);
  private readonly linkedinOAuth = inject(LinkedinOAuthService);
  private readonly runtimeConfig = inject(RuntimeConfig);

  constructor() {
    this.processCallback();
  }

  private processCallback(): void {
    const result = this.linkedinOAuth.parseCallback(new URLSearchParams(window.location.search));
    if (!result.ok) {
      this.redirectToOnboardingWithError(result.error);
      return;
    }

    this.importService
      .importLinkedinBasicFromAuthorizationCode(result.code, this.runtimeConfig.linkedinOAuthRedirectUri())
      .subscribe({
        next: () => {
          this.router.navigate(['/espace-membre/smart-onboarding'], {
            queryParams: { linkedin: 'success' },
            replaceUrl: true,
          });
        },
        error: (err) => {
          const message = err?.error?.detail ?? "Echec de l'import LinkedIn.";
          this.redirectToOnboardingWithError(message);
        },
      });
  }

  private redirectToOnboardingWithError(error: string): void {
    this.router.navigate(['/espace-membre/smart-onboarding'], {
      queryParams: { linkedinError: error },
      replaceUrl: true,
    });
  }
}


