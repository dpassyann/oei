import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { AdminInstitutionCreationInput } from '../../../../domain/port/admin/admin-institutions.port';
import { PartnershipLevel } from '../../../../domain/model/institution/partnership';
import { I18nService } from '../../../i18n/i18n.service';

// Same fallback discipline as `Onboarding` (`espace-membre/onboarding/onboarding.ts`): this form
// is a flat-ish set of scalar fields plus one dynamic list (`emailDomains`), so plain `signal<T>()`
// state + `FormsModule` two-way binding is preferred over Signal Forms' `form()`/`[formField]`
// here, consistent with that documented convention.
export interface AdminInstitutionNewDraft {
  readonly legalName: string;
  readonly publicName: string;
  readonly type: string;
  readonly country: string;
  readonly website: string;
  readonly logoUrl: string;
  readonly description: string;
  readonly primaryContactName: string;
  readonly institutionAdminEmail: string;
  readonly partnershipLevel: PartnershipLevel;
  readonly startedAt: string;
  readonly endsAt: string;
  readonly internalNotes: string;
}

function emptyDraft(): AdminInstitutionNewDraft {
  return {
    legalName: '',
    publicName: '',
    type: '',
    country: '',
    website: '',
    logoUrl: '',
    description: '',
    primaryContactName: '',
    institutionAdminEmail: '',
    partnershipLevel: 'PROSPECT',
    startedAt: '',
    endsAt: '',
    internalNotes: '',
  };
}

const PARTNERSHIP_LEVELS: readonly PartnershipLevel[] = ['PROSPECT', 'STANDARD', 'SILVER', 'GOLD', 'STRATEGIC'];

@Component({
  selector: 'oei-admin-institution-new',
  imports: [FormsModule],
  templateUrl: './admin-institution-new.html',
  styleUrl: './admin-institution-new.scss',
})
export class AdminInstitutionNew {
  private readonly institutionsService = inject(AdminInstitutionsApplicationService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly partnershipLevels = PARTNERSHIP_LEVELS;
  protected readonly draft = signal<AdminInstitutionNewDraft>(emptyDraft());
  protected readonly emailDomains = signal<readonly string[]>([]);
  protected readonly newEmailDomain = signal('');
  protected readonly submitting = signal(false);
  protected readonly submitError = signal(false);
  protected readonly validationError = signal(false);

  protected updateDraft(partial: Partial<AdminInstitutionNewDraft>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  protected addEmailDomain(): void {
    const value = this.newEmailDomain().trim();
    if (!value) {
      return;
    }
    this.emailDomains.update((domains) => [...domains, value]);
    this.newEmailDomain.set('');
  }

  protected removeEmailDomain(index: number): void {
    this.emailDomains.update((domains) => domains.filter((_, i) => i !== index));
  }

  protected submit(): void {
    const draft = this.draft();
    if (!draft.legalName.trim() || !draft.publicName.trim() || !draft.country.trim() || !draft.institutionAdminEmail.trim()) {
      this.validationError.set(true);
      return;
    }
    this.validationError.set(false);
    this.submitting.set(true);
    this.submitError.set(false);

    const input: AdminInstitutionCreationInput = {
      legalName: draft.legalName.trim(),
      publicName: draft.publicName.trim(),
      type: draft.type.trim(),
      country: draft.country.trim(),
      website: draft.website.trim() || undefined,
      emailDomains: this.emailDomains(),
      logoUrl: draft.logoUrl.trim() || undefined,
      description: draft.description.trim() || undefined,
      primaryContactName: draft.primaryContactName.trim(),
      institutionAdminEmail: draft.institutionAdminEmail.trim(),
      partnershipLevel: draft.partnershipLevel,
      startedAt: draft.startedAt || undefined,
      endsAt: draft.endsAt || null,
      internalNotes: draft.internalNotes.trim() || undefined,
    };

    this.institutionsService.create(input).subscribe({
      next: (created) => this.router.navigate(['/admin/institutions', created.id]),
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }
}
