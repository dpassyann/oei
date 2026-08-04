import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import {
  Education,
  Experience,
  LanguageLevel,
  LanguageProficiency,
  ProfessionalProfile,
} from '../../../../domain/model/profile/professional-profile';
import { PUBLIC_PROFILE_VISIBLE_FIELD_KEYS, PublicProfileVisibleFieldKey } from '../../../../domain/model/profile/public-profile';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../../domain/model/document';
import { I18nService } from '../../../i18n/i18n.service';

// This wizard drives a highly dynamic, list-heavy model (experiences, educations,
// certifications, languages all grow/shrink at runtime, plus a chip-like expertise
// list). We verified `form()`/`required()`/`email()` etc. do exist in
// `@angular/forms/signals` (see node_modules/@angular/forms/types/signals.d.ts) and the
// `[formField]` directive binds a `FieldTree` to a control — but that directive binds one
// scalar `FieldTree` per control, and the guide-documented patterns for *array* paths
// (`applyEach`, per-item `FieldTree`) are non-trivial to verify against this exact
// package version within this task's scope. Given the wizard is dominated by ad-hoc
// "add item to list" mini-forms rather than a single flat model, we fall back to plain
// `signal<T>()` state plus small manual validation guards, per the fallback discipline
// called out in the conventions doc. See also `profil.ts` for the same discipline
// applied to a flatter model, where a couple of scalar fields DO use `form()`.

export type OnboardingCertification = string;

export interface OnboardingDraft {
  readonly cguAccepted: boolean;
  readonly email: string;
  readonly locale: SupportedLanguage;
  readonly country: string;
  readonly displayName: string;
  readonly photoUrl: string;
  readonly title: string;
  readonly summary: string;
  readonly expertiseAreas: readonly string[];
  readonly experiences: readonly Experience[];
  readonly educations: readonly Education[];
  readonly certifications: readonly OnboardingCertification[];
  readonly languages: readonly LanguageProficiency[];
  readonly visibleFields: readonly PublicProfileVisibleFieldKey[];
  readonly charterAccepted: boolean;
}

function emptyDraft(): OnboardingDraft {
  return {
    cguAccepted: false,
    email: '',
    locale: 'fr',
    country: '',
    displayName: '',
    photoUrl: '',
    title: '',
    summary: '',
    expertiseAreas: [],
    experiences: [],
    educations: [],
    certifications: [],
    languages: [],
    visibleFields: [],
    charterAccepted: false,
  };
}

const DRAFT_STORAGE_KEY = 'oei-onboarding-draft';
const DEMO_MEMBER_ID = 'demo-member-1';
const DEFAULT_MEMBERSHIP_TIER = 'Standard';

interface StepDefinition {
  readonly id: string;
  readonly labelKey: string;
}

const STEPS: readonly StepDefinition[] = [
  { id: 'compte', labelKey: 'espaceMembre.onboarding.steps.compte' },
  { id: 'langue-pays', labelKey: 'espaceMembre.onboarding.steps.languePays' },
  { id: 'identite', labelKey: 'espaceMembre.onboarding.steps.identite' },
  { id: 'photo', labelKey: 'espaceMembre.onboarding.steps.photo' },
  { id: 'titre', labelKey: 'espaceMembre.onboarding.steps.titre' },
  { id: 'resume', labelKey: 'espaceMembre.onboarding.steps.resume' },
  { id: 'expertises', labelKey: 'espaceMembre.onboarding.steps.expertises' },
  { id: 'experiences', labelKey: 'espaceMembre.onboarding.steps.experiences' },
  { id: 'formations', labelKey: 'espaceMembre.onboarding.steps.formations' },
  { id: 'certifications', labelKey: 'espaceMembre.onboarding.steps.certifications' },
  { id: 'langues', labelKey: 'espaceMembre.onboarding.steps.langues' },
  { id: 'visibilite', labelKey: 'espaceMembre.onboarding.steps.visibilite' },
  { id: 'charte', labelKey: 'espaceMembre.onboarding.steps.charte' },
  { id: 'adhesion', labelKey: 'espaceMembre.onboarding.steps.adhesion' },
];

const LANGUAGE_LEVELS: readonly LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE'];

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

@Component({
  selector: 'oei-onboarding',
  imports: [FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {
  private readonly professionalProfileApplicationService = inject(ProfessionalProfileApplicationService);
  private readonly membershipApplicationService = inject(MembershipApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly steps = STEPS;
  protected readonly supportedLanguages = SUPPORTED_LANGUAGES;
  protected readonly languageLevels = LANGUAGE_LEVELS;
  protected readonly visibleFieldKeys = PUBLIC_PROFILE_VISIBLE_FIELD_KEYS;
  protected readonly defaultMembershipTier = DEFAULT_MEMBERSHIP_TIER;

  protected readonly currentStep = signal(0);
  protected readonly draft = signal<OnboardingDraft>(emptyDraft());
  protected readonly draftRestored = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal(false);

  // Mini-form state for "add experience / education / certification / language" — kept
  // outside `draft` since they're transient inputs, not part of the saved profile.
  protected readonly newExperience = signal({ organization: '', title: '', startDate: '' });
  protected readonly newEducation = signal({ institution: '', program: '', startDate: '' });
  protected readonly newCertification = signal('');
  protected readonly newLanguage = signal<{ language: string; level: LanguageLevel }>({
    language: '',
    level: 'B1',
  });
  protected readonly expertiseInput = signal('');

  protected readonly stepCount = computed(() => this.steps.length);
  protected readonly stepLabel = computed(() => this.steps[this.currentStep()]?.labelKey ?? '');
  protected readonly isFirstStep = computed(() => this.currentStep() === 0);
  protected readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  constructor() {
    this.restoreDraft();

    // Autosave: any change to the draft (including step navigation, tracked via
    // `currentStep` read below) persists the whole in-progress wizard state to
    // `sessionStorage`, implementing "sauvegarde automatique et reprise ultérieure".
    effect(() => {
      const snapshot = this.draft();
      this.currentStep();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ step: this.currentStep(), draft: snapshot }));
      }
    });
  }

  private restoreDraft(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { step: number; draft: OnboardingDraft };
      this.draft.set({ ...emptyDraft(), ...parsed.draft });
      this.currentStep.set(parsed.step ?? 0);
      this.draftRestored.set(true);
    } catch {
      // Malformed stored draft — ignore and start fresh.
    }
  }

  protected updateDraft(partial: Partial<OnboardingDraft>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  protected goNext(): void {
    if (!this.isLastStep()) {
      this.currentStep.update((step) => step + 1);
    }
  }

  protected goPrevious(): void {
    if (!this.isFirstStep()) {
      this.currentStep.update((step) => step - 1);
    }
  }

  protected addExpertise(): void {
    const value = this.expertiseInput().trim();
    if (!value) {
      return;
    }
    this.updateDraft({ expertiseAreas: [...this.draft().expertiseAreas, value] });
    this.expertiseInput.set('');
  }

  protected removeExpertise(index: number): void {
    this.updateDraft({ expertiseAreas: this.draft().expertiseAreas.filter((_, i) => i !== index) });
  }

  protected addExperience(): void {
    const form = this.newExperience();
    if (!form.organization.trim() || !form.title.trim() || !form.startDate.trim()) {
      return;
    }
    const experience: Experience = {
      id: newId('experience'),
      organization: form.organization.trim(),
      title: form.title.trim(),
      startDate: form.startDate.trim(),
    };
    this.updateDraft({ experiences: [...this.draft().experiences, experience] });
    this.newExperience.set({ organization: '', title: '', startDate: '' });
  }

  protected removeExperience(id: string): void {
    this.updateDraft({ experiences: this.draft().experiences.filter((item) => item.id !== id) });
  }

  protected addEducation(): void {
    const form = this.newEducation();
    if (!form.institution.trim() || !form.program.trim() || !form.startDate.trim()) {
      return;
    }
    const education: Education = {
      id: newId('education'),
      institution: form.institution.trim(),
      program: form.program.trim(),
      startDate: form.startDate.trim(),
    };
    this.updateDraft({ educations: [...this.draft().educations, education] });
    this.newEducation.set({ institution: '', program: '', startDate: '' });
  }

  protected removeEducation(id: string): void {
    this.updateDraft({ educations: this.draft().educations.filter((item) => item.id !== id) });
  }

  protected addCertification(): void {
    const value = this.newCertification().trim();
    if (!value) {
      return;
    }
    this.updateDraft({ certifications: [...this.draft().certifications, value] });
    this.newCertification.set('');
  }

  protected removeCertification(index: number): void {
    this.updateDraft({ certifications: this.draft().certifications.filter((_, i) => i !== index) });
  }

  protected addLanguage(): void {
    const form = this.newLanguage();
    if (!form.language.trim()) {
      return;
    }
    this.updateDraft({
      languages: [...this.draft().languages, { language: form.language.trim(), level: form.level }],
    });
    this.newLanguage.set({ language: '', level: 'B1' });
  }

  protected removeLanguage(index: number): void {
    this.updateDraft({ languages: this.draft().languages.filter((_, i) => i !== index) });
  }

  protected toggleVisibleField(key: PublicProfileVisibleFieldKey): void {
    const current = this.draft().visibleFields;
    const next = current.includes(key) ? current.filter((field) => field !== key) : [...current, key];
    this.updateDraft({ visibleFields: next });
  }

  protected isVisibleFieldChecked(key: PublicProfileVisibleFieldKey): boolean {
    return this.draft().visibleFields.includes(key);
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    const draft = this.draft();

    const profile: ProfessionalProfile = {
      memberId: DEMO_MEMBER_ID,
      title: draft.title || undefined,
      summary: draft.summary || undefined,
      location: draft.country || undefined,
      availability: undefined,
      expertiseAreas: draft.expertiseAreas,
      technologies: [],
      sectors: [],
      languages: draft.languages,
      experiences: draft.experiences,
      educations: draft.educations,
      skills: [],
      completenessScore: 0,
    };

    this.professionalProfileApplicationService.updateProfile(profile).subscribe({
      next: () => {
        const finish = () => {
          this.submitting.set(false);
          this.submitted.set(true);
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        };
        if (draft.charterAccepted) {
          this.membershipApplicationService.signEthicalCharter('1.0').subscribe({
            next: finish,
            error: () => {
              this.submitting.set(false);
              this.submitError.set(true);
            },
          });
        } else {
          finish();
        }
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }
}
