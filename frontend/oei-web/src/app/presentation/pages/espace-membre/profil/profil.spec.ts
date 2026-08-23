import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Profil } from './profil';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { MembershipFeeApplicationService } from '../../../../application/service/membership-fee-application.service';
import { SalaryBenchmarkApplicationService } from '../../../../application/service/salary-benchmark-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { createMember, Member } from '../../../../domain/model/identity/member';
import { Membership } from '../../../../domain/model/membership/membership';
import { ProfessionalProfile } from '../../../../domain/model/profile/professional-profile';
import { MembershipFeeStatus } from '../../../../domain/model/membership-fee/membership-fee-status';
import { ProfileImportPort } from '../../../../domain/port/profile/profile-import.port';
import { LinkedinOAuthService } from '../../../../infrastructure/auth/linkedin-oauth.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.profil.title': 'Profil professionnel',
  'espaceMembre.profil.loading': 'Chargement du profil…',
  'espaceMembre.profil.empty': 'Aucun profil disponible.',
  'espaceMembre.profil.completeness': 'Complétude :',
  'espaceMembre.profil.legalIdentity.title': 'Identité légale (privée)',
  'espaceMembre.profil.legalIdentity.hint': "Cette information n'est jamais affichée publiquement.",
  'espaceMembre.profil.expertiseAreas': "Domaines d'expertise",
  'espaceMembre.profil.technologies': 'Technologies',
  'espaceMembre.profil.sectors': 'Secteurs',
  'espaceMembre.profil.languages': 'Langues',
  'espaceMembre.profil.experiences': 'Expériences',
  'espaceMembre.profil.educations': 'Formations',
  'espaceMembre.profil.skills': 'Compétences',
  'espaceMembre.profil.demoTag': 'Démonstration',
  'espaceMembre.profil.edit': 'Modifier',
  'espaceMembre.profil.save': 'Enregistrer',
  'espaceMembre.profil.cancel': 'Annuler',
  'espaceMembre.profil.saveError': 'Une erreur est survenue lors de l’enregistrement.',
  'espaceMembre.profil.fields.title': 'Titre',
  'espaceMembre.profil.fields.summary': 'Résumé',
  'espaceMembre.profil.fields.location': 'Localisation',
  'espaceMembre.profil.fields.availability': 'Disponibilité',
  'espaceMembre.profil.fields.photoUrl': 'Photo de profil',
  'espaceMembre.profil.fields.photoUrlHint': 'URL de la photo',
  'espaceMembre.profil.photoAlt': 'Photo de profil',
  'espaceMembre.profil.availability.AVAILABLE': 'Disponible',
  'espaceMembre.profil.availability.OPEN_TO_OPPORTUNITIES': 'Ouvert aux opportunités',
  'espaceMembre.profil.availability.NOT_AVAILABLE': 'Non disponible',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

const MEMBER: Member = createMember({
  id: 'demo-member-1',
  publicSlug: 'demo-jane-dupont',
  displayName: 'Jane Dupont (Démonstration)',
  legalName: 'Jane Marie Dupont',
  locale: 'fr',
  country: 'FR',
  createdAt: '2026-01-15T09:00:00Z',
});

const MEMBERSHIP: Membership = {
  memberId: 'demo-member-1',
  tier: 'SILVER',
  status: 'ACTIVE',
  startedAt: '2026-01-15T09:00:00Z',
  renewedAt: null,
  endsAt: null,
};

function buildProfile(overrides: Partial<ProfessionalProfile> = {}): ProfessionalProfile {
  return {
    memberId: 'demo-member-1',
    title: 'Experte en éthique de l’IA',
    summary: 'Résumé de démonstration.',
    location: 'Paris, France',
    availability: 'OPEN_TO_OPPORTUNITIES',
    expertiseAreas: ['Gouvernance IA'],
    technologies: ['Python'],
    sectors: ['Finance'],
    languages: [{ language: 'fr', level: 'NATIVE' }],
    experiences: [
      {
        id: 'exp-1',
        organization: 'Institut Démonstration',
        title: 'Consultante',
        startDate: '2023-01-01',
        isDemoData: true,
      },
    ],
    educations: [{ id: 'edu-1', institution: 'Université', program: 'Master', startDate: '2018-09-01' }],
    skills: [{ id: 'skill-1', name: 'Audit', category: 'Gouvernance' }],
    completenessScore: 80,
    ...overrides,
  };
}

const PAID_FEE_STATUS: MembershipFeeStatus = {
  memberId: 'demo-member-1',
  account: { memberId: 'demo-member-1', tier: 'MEMBER', payments: [] },
  cycle: {
    year: 2026,
    cycleStartDate: new Date('2026-04-22T00:00:00Z'),
    cycleEndDate: new Date('2027-04-21T00:00:00Z'),
    reminderStartDate: new Date('2027-03-22T00:00:00Z'),
    nextDueDate: new Date('2027-04-22T00:00:00Z'),
  },
  isPaid: true,
  reminderActive: false,
  amountDue: 0,
  monthsRemaining: 0,
};

const UNPAID_FEE_STATUS: MembershipFeeStatus = { ...PAID_FEE_STATUS, isPaid: false, amountDue: 24.93, monthsRemaining: 6 };

describe('Profil', () => {
  let updateProfileSpy: ReturnType<typeof vi.fn>;

  function configure(profile: ProfessionalProfile | undefined, feeStatus: MembershipFeeStatus = PAID_FEE_STATUS) {
    updateProfileSpy = vi.fn((updated: ProfessionalProfile) => of(updated));

    TestBed.configureTestingModule({
      imports: [Profil],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        provideRouter([]),
        {
          provide: ProfessionalProfileApplicationService,
          useValue: { getProfile: () => of(profile), updateProfile: updateProfileSpy },
        },
        { provide: MemberApplicationService, useValue: { getCurrentMember: () => of(MEMBER) } },
        {
          provide: MembershipApplicationService,
          useValue: {
            getMembership: () => of(MEMBERSHIP),
            signEthicalCharter: () => of(undefined),
            listEmploymentAffiliations: () => of([]),
            requestEmploymentAffiliation: () => of(undefined),
            listVerificationRequests: () => of([]),
            submitVerificationRequest: () => of(undefined),
          },
        },
        { provide: MembershipFeeApplicationService, useValue: { getStatus: () => of(feeStatus) } },
        { provide: SalaryBenchmarkApplicationService, useValue: { getBenchmark: () => of(undefined) } },
        {
          provide: ProfileImportPort,
          useValue: {
            initiateCvImport: () => of({}),
            getImport: () => of({}),
            getImportDraft: () => of({}),
            updateImportDraft: () => of({}),
            confirmImport: () => of({}),
            importLinkedinBasic: () => of({}),
            importLinkedinBasicFromAuthorizationCode: () => of({}),
          },
        },
        { provide: LinkedinOAuthService, useValue: { startAuthorizationFlow: () => undefined } },
      ],
    });
  }

  it('givenProfile_whenCreated_thenDisplaysDisplayNameCompletenessAndNeverLegalNamePublicly', async () => {
    configure(buildProfile());
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Jane Dupont (Démonstration)');
    expect(compiled.textContent).toContain('80%');
    expect(compiled.querySelector('.oei-profil__legal')?.textContent).toContain('Jane Marie Dupont');
    expect(compiled.querySelector('.oei-profil__view')?.textContent).not.toContain('Jane Marie Dupont');
  });

  it('givenProfileWithPhoto_whenRendered_thenShowsPhotoImage', async () => {
    configure(buildProfile({ photoUrl: '/assets/livre-blanc/photo-auteur.png' }));
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const img = compiled.querySelector('.oei-profil-banner__photo img') as HTMLImageElement | null;
    expect(img?.src).toContain('/assets/livre-blanc/photo-auteur.png');
  });

  it('givenProfileWithoutPhoto_whenRendered_thenShowsInitialsFallback', async () => {
    configure(buildProfile({ photoUrl: undefined }));
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-profil-banner__photo img')).toBeFalsy();
    expect(compiled.querySelector('.oei-profil-banner__initials')?.textContent).toContain('JD');
  });

  it('givenCompensationAndBenchmark_whenRendered_thenShowsPrivateNoticeAndBenchmarkRange', async () => {
    configure(
      buildProfile({ currentCompensation: { amount: 120000, currency: 'CHF', period: 'YEAR' } }),
    );
    TestBed.overrideProvider(SalaryBenchmarkApplicationService, {
      useValue: { getBenchmark: () => of({ low: 90000, high: 130000, currency: 'CHF', period: 'YEAR', sampleSize: 3 }) },
    });
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-profil__compensation-value')?.textContent).toContain('120000');
    expect(compiled.querySelector('.oei-profil__private-notice')).toBeTruthy();
    expect(compiled.querySelector('.oei-profil__compensation-benchmark')?.textContent).toContain('90000');
    expect(compiled.querySelector('.oei-profil__compensation-benchmark')?.textContent).toContain('130000');
  });

  it('givenCompensationWithCountry_whenRendered_thenShowsCountry', async () => {
    configure(buildProfile({ currentCompensation: { amount: 120000, currency: 'CHF', period: 'YEAR', country: 'Suisse' } }));
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-profil__compensation-value')?.textContent).toContain('Suisse');
  });

  it('givenEditModeWithCompensationCountry_whenSaved_thenUpdateProfileReceivesCountry', async () => {
    configure(buildProfile());
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['startEditing']();
    fixture.detectChanges();
    component['editModel'].update((current) => ({
      ...current,
      compensationAmount: '95000',
      compensationCurrency: 'CHF',
      compensationPeriod: 'YEAR',
      compensationCountry: 'France',
    }));

    component['save']();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(updateProfileSpy).toHaveBeenCalled();
    const updated = updateProfileSpy.mock.calls[0][0] as { currentCompensation?: { country?: string } };
    expect(updated.currentCompensation?.country).toBe('France');
  });

  it('givenSocialLinks_whenRendered_thenShowsOnlyProvidedLinks', async () => {
    configure(buildProfile({ socialLinks: { linkedin: 'https://linkedin.com/in/demo', github: undefined } }));
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const links = compiled.querySelectorAll('.oei-profil__social-links a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://linkedin.com/in/demo');
  });

  it('givenDemoExperience_whenRendered_thenShowsDemonstrationTag', async () => {
    configure(buildProfile());
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-profil__demo-tag')?.textContent).toContain('Démonstration');
  });

  it('givenEditMode_whenSaved_thenCallsUpdateProfileAndReturnsToViewMode', async () => {
    configure(buildProfile());
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['startEditing']();
    fixture.detectChanges();
    expect(component['editing']()).toBe(true);

    component['save']();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(updateProfileSpy).toHaveBeenCalled();
    expect(component['editing']()).toBe(false);
  });

  it('givenNoProfile_whenLoaded_thenRendersHonestEmptyState', async () => {
    configure(undefined);
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucun profil');
  });

  it('givenUnpaidCotisation_whenRendered_thenShowsReadOnlyBannerAndDisablesEditButton', async () => {
    configure(buildProfile(), UNPAID_FEE_STATUS);
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-read-only-banner')).toBeTruthy();
    const editButton = compiled.querySelector('.oei-profil__view button') as HTMLButtonElement | null;
    expect(editButton?.disabled).toBe(true);
  });

  it('givenUnpaidCotisation_whenStartEditingCalledDirectly_thenDoesNotEnterEditMode', async () => {
    configure(buildProfile(), UNPAID_FEE_STATUS);
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['startEditing']();

    expect(component['editing']()).toBe(false);
  });

  it('givenPaidCotisation_whenRendered_thenNoReadOnlyBannerAndEditButtonEnabled', async () => {
    configure(buildProfile(), PAID_FEE_STATUS);
    const fixture = TestBed.createComponent(Profil);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-read-only-banner')).toBeFalsy();
    const editButton = compiled.querySelector('.oei-profil__view button') as HTMLButtonElement | null;
    expect(editButton?.disabled).toBe(false);
  });
});
