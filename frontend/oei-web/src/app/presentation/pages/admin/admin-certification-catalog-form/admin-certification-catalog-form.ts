import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCertificationCatalogApplicationService } from '../../../../application/service/admin-certification-catalog-application.service';
import { AdminCertificationCatalogInput } from '../../../../domain/port/admin/admin-certification-catalog.port';
import {
  CertificationLevel,
  CertificationOeiStatus,
  RecognizedCertification,
} from '../../../../domain/model/certification/recognized-certification';
import { I18nService } from '../../../i18n/i18n.service';

// Same order as the public `/certifications` page's `LEVEL_ORDER` (certifications.ts) — kept in
// sync so a level picked here shows the identical label/order everywhere on the site.
const LEVEL_ORDER: readonly CertificationLevel[] = [
  'PRACTITIONER',
  'ENGINEER',
  'ARCHITECT',
  'EXPERT',
  'SENIOR_EXPERT',
  'FELLOW',
];

const OEI_STATUS_OPTIONS: readonly CertificationOeiStatus[] = [
  'OEI_RECOGNIZED',
  'PARTNER_RECOGNIZED',
  'UNDER_REVIEW',
  'NOT_RECOGNIZED',
];

// Flat, form-friendly draft — same `signal<T>()` + `FormsModule` discipline as
// `AdminInstitutionNew` (see its doc comment): a mostly-scalar form plus one dynamic list
// (`competencies`), not worth a Signal Forms `form()` tree.
export interface AdminCertificationCatalogDraft {
  readonly name: string;
  readonly issuingOrganization: string;
  readonly catalogReference: string;
  readonly domain: string;
  readonly level: CertificationLevel | '';
  readonly language: string;
  readonly oeiStatus: CertificationOeiStatus | '';
  readonly description: string;
  readonly validityMonths: string;
  readonly autoValidate: boolean;
}

function emptyDraft(): AdminCertificationCatalogDraft {
  return {
    name: '',
    issuingOrganization: '',
    catalogReference: '',
    domain: '',
    level: '',
    language: '',
    oeiStatus: '',
    description: '',
    validityMonths: '',
    autoValidate: false,
  };
}

function draftFromCertification(certification: RecognizedCertification): AdminCertificationCatalogDraft {
  return {
    name: certification.name,
    issuingOrganization: certification.issuingOrganization,
    catalogReference: certification.catalogReference ?? '',
    domain: certification.domain ?? '',
    level: certification.level ?? '',
    language: certification.language ?? '',
    oeiStatus: certification.oeiStatus ?? '',
    description: certification.description ?? '',
    validityMonths: certification.validityMonths != null ? String(certification.validityMonths) : '',
    autoValidate: certification.autoValidate,
  };
}

/**
 * Single form for both adding and editing a `/certifications` catalog entry
 * (`/admin/certifications/new` and `/admin/certifications/:id/edit` — see `app.routes.ts`),
 * mirroring the "one form serves both" choice already made for e.g. `Onboarding`. Edit mode is
 * detected from the route's `:id` param; there is no separate "detail" page like
 * `AdminInstitutionDetail` because a catalog entry has no lifecycle/workflow, only field edits.
 */
@Component({
  selector: 'oei-admin-certification-catalog-form',
  imports: [FormsModule],
  templateUrl: './admin-certification-catalog-form.html',
  styleUrl: './admin-certification-catalog-form.scss',
})
export class AdminCertificationCatalogForm {
  private readonly catalogService = inject(AdminCertificationCatalogApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly levelOrder = LEVEL_ORDER;
  protected readonly oeiStatusOptions = OEI_STATUS_OPTIONS;

  private readonly editingId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = computed(() => this.editingId() !== null);

  // Only fetched in edit mode (`params` returns `undefined` on `/new`, which skips `stream()` —
  // same `rxResource` gating idiom used by `goalsResource` in `certifications.ts`). There is no
  // dedicated `getById` on `AdminCertificationCatalogPort` yet (only `list`/`create`/`update`),
  // so edit mode finds its entry within the full catalog list — acceptable given this catalog's
  // size; a future contract addition could add a direct `getById` the same way institutions did.
  private readonly existingResource = rxResource({
    params: () => this.editingId() ?? undefined,
    stream: () => this.catalogService.list(),
  });

  private readonly existingCertification = computed<RecognizedCertification | undefined>(() =>
    (this.existingResource.value() ?? []).find((candidate) => candidate.id === this.editingId()),
  );

  protected readonly draft = signal<AdminCertificationCatalogDraft>(emptyDraft());
  protected readonly submitting = signal(false);
  protected readonly submitError = signal(false);
  protected readonly validationError = signal(false);
  protected readonly competencies = signal<readonly string[]>([]);
  protected readonly newCompetency = signal('');

  constructor() {
    // Populates the draft + competencies list the moment the entry being edited is found in the
    // freshly-loaded catalog. A plain `effect()` (not `afterRenderEffect`) is enough here since
    // this only writes component state, never touches the DOM directly.
    effect(() => {
      const certification = this.existingCertification();
      if (certification) {
        this.draft.set(draftFromCertification(certification));
        this.competencies.set(certification.competencies ?? []);
      }
    });
  }

  protected updateDraft(partial: Partial<AdminCertificationCatalogDraft>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  protected addCompetency(): void {
    const value = this.newCompetency().trim();
    if (!value) {
      return;
    }
    this.competencies.update((values) => [...values, value]);
    this.newCompetency.set('');
  }

  protected removeCompetency(index: number): void {
    this.competencies.update((values) => values.filter((_, i) => i !== index));
  }

  protected submit(): void {
    const draft = this.draft();
    if (!draft.name.trim() || !draft.issuingOrganization.trim()) {
      this.validationError.set(true);
      return;
    }
    this.validationError.set(false);
    this.submitting.set(true);
    this.submitError.set(false);

    const input: AdminCertificationCatalogInput = {
      name: draft.name.trim(),
      issuingOrganization: draft.issuingOrganization.trim(),
      catalogReference: draft.catalogReference.trim() || undefined,
      domain: draft.domain.trim() || undefined,
      level: draft.level || undefined,
      language: draft.language.trim() || undefined,
      oeiStatus: draft.oeiStatus || undefined,
      description: draft.description.trim() || undefined,
      competencies: this.competencies().length > 0 ? this.competencies() : undefined,
      validityMonths: draft.validityMonths.trim() ? Number(draft.validityMonths) : null,
      autoValidate: draft.autoValidate,
    };

    const existing = this.existingCertification();
    const request$ = existing ? this.catalogService.update(existing, input) : this.catalogService.create(input);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/certifications']),
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }
}
