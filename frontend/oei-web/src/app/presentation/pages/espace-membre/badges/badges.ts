import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, required, FormField } from '@angular/forms/signals';
import { BadgeApplicationService } from '../../../../application/service/badge-application.service';
import { CertificationApplicationService } from '../../../../application/service/certification-application.service';
import { BadgeAward } from '../../../../domain/model/badge/badge';
import { Certification, CertificationDeclaration, CertificationStatus } from '../../../../domain/model/certification/certification';
import { I18nService } from '../../../i18n/i18n.service';

interface DeclarationFormModel {
  name: string;
  issuingOrganization: string;
  recognizedCertificationId: string;
  issuedAt: string;
  proofDocumentUrl: string;
}

const EMPTY_DECLARATION: DeclarationFormModel = {
  name: '',
  issuingOrganization: '',
  recognizedCertificationId: '',
  issuedAt: '',
  proofDocumentUrl: '',
};

@Component({
  selector: 'oei-badges',
  imports: [FormField, DatePipe],
  templateUrl: './badges.html',
  styleUrl: './badges.scss',
})
export class Badges {
  private readonly badgeApplicationService = inject(BadgeApplicationService);
  private readonly certificationApplicationService = inject(CertificationApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly badgeAwardsResource = rxResource({
    stream: () => this.badgeApplicationService.listMyBadgeAwards(),
  });
  protected readonly badgeAwards = computed<BadgeAward[]>(() => this.badgeAwardsResource.value() ?? []);

  private readonly certificationsResource = rxResource({
    stream: () => this.certificationApplicationService.listCertifications(),
  });
  protected readonly certifications = computed<Certification[]>(() => this.certificationsResource.value() ?? []);

  private readonly recognizedCertificationsResource = rxResource({
    stream: () => this.certificationApplicationService.listRecognizedCertifications(),
  });
  protected readonly recognizedCertifications = computed(
    () => this.recognizedCertificationsResource.value() ?? [],
  );

  // Signal Forms (`@angular/forms/signals`, stable in Angular 22 — see
  // `.prompt/plan/00-angular-22-conventions.md`) for the "declare a certification" form.
  // The `submit()` helper isn't used here: its `action` callback signature (returning a
  // `Promise<TreeValidationResult>`) is designed for validation-oriented server round-trips,
  // whereas this form just needs a plain "is it valid, then call the application service"
  // flow — so submission is driven imperatively from `declarationForm().valid()`.
  private readonly declarationModel = signal<DeclarationFormModel>({ ...EMPTY_DECLARATION });
  protected readonly declarationForm = form(this.declarationModel, (path) => {
    required(path.name);
    required(path.issuingOrganization);
    required(path.issuedAt);
    required(path.proofDocumentUrl);
  });

  protected readonly declareSubmitting = signal(false);
  protected readonly declareSucceeded = signal(false);
  protected readonly declareFailed = signal(false);

  protected statusClass(status: CertificationStatus): string {
    return `oei-badges__cert-status--${status.toLowerCase().replace(/_/g, '-')}`;
  }

  protected statusLabel(status: CertificationStatus): string {
    return this.i18n.translate(`espaceMembre.badges.certificationStatus.${status}`);
  }

  protected categoryLabel(category: string): string {
    return this.i18n.translate(`espaceMembre.badges.category.${category}`);
  }

  protected submitDeclaration(event?: Event): void {
    event?.preventDefault();
    this.declareSucceeded.set(false);
    this.declareFailed.set(false);

    if (!this.declarationForm().valid()) {
      this.declarationForm().markAsTouched();
      return;
    }

    const value = this.declarationModel();
    const declaration: CertificationDeclaration = {
      name: value.name,
      issuingOrganization: value.issuingOrganization,
      recognizedCertificationId: value.recognizedCertificationId || null,
      issuedAt: value.issuedAt,
      proofDocumentUrl: value.proofDocumentUrl,
    };

    this.declareSubmitting.set(true);
    this.certificationApplicationService.declareCertification(declaration).subscribe({
      next: () => {
        this.declareSubmitting.set(false);
        this.declareSucceeded.set(true);
        this.declarationModel.set({ ...EMPTY_DECLARATION });
        // `ResourceRef.reload()` (stable Resource API, Angular 22) re-runs the `stream()`
        // loader so the freshly declared certification shows up without a full page reload.
        this.certificationsResource.reload();
      },
      error: () => {
        this.declareSubmitting.set(false);
        this.declareFailed.set(true);
      },
    });
  }
}
