import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { SalaryBenchmarkApplicationService } from '../../../../application/service/salary-benchmark-application.service';
import {
  Availability,
  Experience,
  Education,
  ProfessionalProfile,
  CompensationPeriod,
} from '../../../../domain/model/profile/professional-profile';
import { I18nService } from '../../../i18n/i18n.service';
import { MembershipAccessService } from '../../../auth/membership-access.service';
import { SmartOnboarding } from '../smart-onboarding/smart-onboarding';

// Signal Forms (`form()`/`required()` from `@angular/forms/signals`, verified against
// node_modules/@angular/forms/types/signals.d.ts) work well for this page's *flat*
// editable fields (title/summary/location/availability), so we use them there via the
// `[formField]` directive. The list-shaped sub-resources of the profile (experiences,
// educations, skills, languages, expertise/technology/sector chips) are read-only on
// this page — editing them is out of scope for this simple edit mode — so no
// list-editing form logic is needed here, avoiding the same unverified array-path
// question flagged in `onboarding.ts`.
interface EditableProfileFields {
  title: string;
  summary: string;
  location: string;
  availability: Availability | '';
  // Plain URL, edited via a text input — no upload pipeline exists yet in this codebase (the
  // onboarding wizard's "Photo" step, `espaceMembre.onboarding.steps.photo`, is URL-based too),
  // so the profile page's edit mode follows the same limitation rather than inventing a new one.
  photoUrl: string;
  linkedin: string;
  github: string;
  x: string;
  website: string;
  youtube: string;
  // Amount kept as a string draft (Signal Forms binds to text inputs) — parsed to a number
  // only on save, see `save()`. Never sent anywhere public — see `CurrentCompensation`'s
  // doc comment in the domain model.
  compensationAmount: string;
  compensationCurrency: string;
  compensationPeriod: CompensationPeriod | '';
  // Free text, same format as `NetworkExpert.country`/`CurrentCompensation.country` — used for
  // the anonymized per-country aggregation on the Professional Neural Network's salary
  // transparency feature (see that model's doc comment), never displayed individually.
  compensationCountry: string;
}

const AVAILABILITY_OPTIONS: readonly Availability[] = ['AVAILABLE', 'OPEN_TO_OPPORTUNITIES', 'NOT_AVAILABLE'];
const COMPENSATION_PERIODS: readonly CompensationPeriod[] = ['YEAR', 'MONTH'];

@Component({
  selector: 'oei-profil',
  imports: [FormsModule, FormField, SmartOnboarding],
  templateUrl: './profil.html',
  styleUrl: './profil.scss',
  // Component-scoped (not root-singleton) so the cotisation status is re-fetched fresh every
  // time this guarded page is entered — see `MembershipAccessService`'s doc comment.
  providers: [MembershipAccessService],
})
export class Profil {
  private readonly professionalProfileApplicationService = inject(ProfessionalProfileApplicationService);
  private readonly membershipApplicationService = inject(MembershipApplicationService);
  private readonly memberApplicationService = inject(MemberApplicationService);
  private readonly salaryBenchmarkApplicationService = inject(SalaryBenchmarkApplicationService);
  protected readonly membershipAccess = inject(MembershipAccessService);
  protected readonly i18n = inject(I18nService);

  protected readonly availabilityOptions = AVAILABILITY_OPTIONS;
  protected readonly compensationPeriods = COMPENSATION_PERIODS;

  protected readonly profileResource = rxResource({
    stream: () => this.professionalProfileApplicationService.getProfile(),
  });

  protected readonly memberResource = rxResource({
    stream: () => this.memberApplicationService.getCurrentMember(),
  });

  protected readonly membershipResource = rxResource({
    stream: () => this.membershipApplicationService.getMembership(),
  });

  protected readonly profile = computed(() => (this.profileResource.hasValue() ? this.profileResource.value() : undefined));
  // Distinguishes "genuinely no profile yet" from "the request failed" — without this, both
  // looked identical (a generic "Aucun profil disponible." message), which made a real fetch
  // error (e.g. `dataSource: 'api'` pointing at a backend that doesn't implement this endpoint
  // yet) indistinguishable from a brand-new, not-yet-onboarded account.
  protected readonly profileLoadFailed = computed(() => {
    const error = this.profileResource.error() as { status?: number } | undefined;
    return error !== undefined && error.status !== 404;
  });
  protected readonly profileMissing = computed(
    () => !this.profileResource.isLoading() && !this.profileResource.hasValue() && !this.profileLoadFailed(),
  );
  protected readonly member = computed(() => (this.memberResource.hasValue() ? this.memberResource.value() : undefined));
  protected readonly membership = computed(() => (this.membershipResource.hasValue() ? this.membershipResource.value() : undefined));

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly onboardingModalOpen = signal(false);
  private readonly onboardingAutoOpened = signal(false);

  private readonly editModel = signal<EditableProfileFields>({
    title: '',
    summary: '',
    location: '',
    availability: '',
    photoUrl: '',
    linkedin: '',
    github: '',
    x: '',
    website: '',
    youtube: '',
    compensationAmount: '',
    compensationCurrency: '',
    compensationPeriod: '',
    compensationCountry: '',
  });
  protected readonly editForm = form(this.editModel, (path) => {
    required(path.title);
  });

  protected startEditing(): void {
    if (this.membershipAccess.isReadOnly()) {
      return;
    }
    const current = this.profile();
    this.editModel.set({
      title: current?.title ?? '',
      summary: current?.summary ?? '',
      location: current?.location ?? '',
      availability: current?.availability ?? '',
      photoUrl: current?.photoUrl ?? '',
      linkedin: current?.socialLinks?.linkedin ?? '',
      github: current?.socialLinks?.github ?? '',
      x: current?.socialLinks?.x ?? '',
      website: current?.socialLinks?.website ?? '',
      youtube: current?.socialLinks?.youtube ?? '',
      compensationAmount: current?.currentCompensation?.amount?.toString() ?? '',
      compensationCurrency: current?.currentCompensation?.currency ?? '',
      compensationPeriod: current?.currentCompensation?.period ?? '',
      compensationCountry: current?.currentCompensation?.country ?? '',
    });
    this.editing.set(true);
    this.saveError.set(false);
  }

  protected cancelEditing(): void {
    this.editing.set(false);
  }

  // The select for `availability` is bound manually (not via `[formField]`) because the
  // `FormField` directive's doc comment only explicitly confirms native input/textarea
  // and custom `FormValueControl`/`FormCheckboxControl` support; `<select>` support isn't
  // called out, so we avoid relying on unverified behavior here — same fallback
  // discipline as `onboarding.ts`, applied narrowly to just this one control.
  protected setAvailability(value: string): void {
    this.editModel.update((current) => ({ ...current, availability: value as Availability | '' }));
  }

  // Same reasoning as `setAvailability` — `<select>` isn't a confirmed `[formField]` target.
  protected setCompensationPeriod(value: string): void {
    this.editModel.update((current) => ({ ...current, compensationPeriod: value as CompensationPeriod | '' }));
  }

  protected save(): void {
    const current = this.profile();
    if (!current || this.saving()) {
      return;
    }
    const edited = this.editModel();
    const socialLinks =
      edited.linkedin || edited.github || edited.x || edited.website || edited.youtube
        ? {
            linkedin: edited.linkedin || undefined,
            github: edited.github || undefined,
            x: edited.x || undefined,
            website: edited.website || undefined,
            youtube: edited.youtube || undefined,
          }
        : undefined;
    const amount = Number(edited.compensationAmount);
    const currentCompensation =
      edited.compensationAmount && Number.isFinite(amount) && edited.compensationCurrency && edited.compensationPeriod
        ? {
            amount,
            currency: edited.compensationCurrency,
            period: edited.compensationPeriod,
            country: edited.compensationCountry || undefined,
          }
        : undefined;
    const updated: ProfessionalProfile = {
      ...current,
      title: edited.title || undefined,
      summary: edited.summary || undefined,
      location: edited.location || undefined,
      availability: edited.availability || undefined,
      photoUrl: edited.photoUrl || undefined,
      socialLinks,
      currentCompensation,
    };
    this.saving.set(true);
    this.saveError.set(false);
    this.professionalProfileApplicationService.updateProfile(updated).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.profileResource.reload();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(true);
      },
    });
  }

  // Fallback avatar (initials on a navy disc) shown whenever no `photoUrl` is set — never
  // renders a broken `<img>` or an empty circle.
  protected readonly initials = computed(() => {
    const name = this.member()?.displayName ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  // Comparison widget: shows the anonymized low/high range for a similar profile (domain +
  // currency) alongside the member's own (never-displayed-elsewhere) figure — the query only
  // needs the profile's own expertise areas/currency/period, not the amount itself, since the
  // benchmark is an aggregate over OTHER demo profiles, not a lookup of this one.
  private readonly benchmarkResource = rxResource({
    params: () => {
      const compensation = this.profile()?.currentCompensation;
      if (!compensation) {
        return undefined;
      }
      return {
        expertiseAreas: this.profile()?.expertiseAreas ?? [],
        currency: compensation.currency,
        period: compensation.period,
      };
    },
    stream: ({ params }) => this.salaryBenchmarkApplicationService.getBenchmark(params),
  });
  protected readonly benchmark = computed(() => this.benchmarkResource.value());

  constructor() {
    effect(() => {
      if (this.onboardingAutoOpened() || !this.profileMissing()) {
        return;
      }
      this.onboardingAutoOpened.set(true);
      this.onboardingModalOpen.set(true);
    });
  }

  protected isDemoExperience(experience: Experience): boolean {
    return experience.isDemoData === true;
  }

  protected isDemoEducation(_education: Education): boolean {
    // `Education` has no `isDemoData` flag in the domain model; only experiences carry
    // it today. Kept as a hook so the "Démonstration" tag can be extended if the model
    // grows one, without callers of this method needing to change.
    return false;
  }

  protected openOnboardingModal(): void {
    this.onboardingModalOpen.set(true);
  }

  protected closeOnboardingModal(): void {
    this.onboardingModalOpen.set(false);
  }

  protected onOnboardingCompleted(): void {
    this.onboardingModalOpen.set(false);
    this.profileResource.reload();
    this.memberResource.reload();
  }
}
