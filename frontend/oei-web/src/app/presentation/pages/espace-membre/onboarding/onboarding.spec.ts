import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Onboarding } from './onboarding';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { ProfessionalProfile } from '../../../../domain/model/profile/professional-profile';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.onboarding.title': 'Inscription et onboarding',
  'espaceMembre.onboarding.intro': 'Complétez votre profil en quelques étapes.',
  'espaceMembre.onboarding.draftRestored': 'Brouillon restauré.',
  'espaceMembre.onboarding.confirmation': 'Votre profil a été enregistré.',
  'espaceMembre.onboarding.error': 'Une erreur est survenue.',
  'espaceMembre.onboarding.progress': 'Étape',
  'espaceMembre.onboarding.previous': 'Précédent',
  'espaceMembre.onboarding.next': 'Suivant',
  'espaceMembre.onboarding.finish': 'Terminer',
  'espaceMembre.onboarding.add': 'Ajouter',
  'espaceMembre.onboarding.steps.compte': 'Compte',
  'espaceMembre.onboarding.steps.languePays': 'Langue et pays',
  'espaceMembre.onboarding.steps.identite': 'Identité',
  'espaceMembre.onboarding.steps.photo': 'Photo',
  'espaceMembre.onboarding.steps.titre': 'Titre',
  'espaceMembre.onboarding.steps.resume': 'Résumé',
  'espaceMembre.onboarding.steps.expertises': 'Expertises',
  'espaceMembre.onboarding.steps.experiences': 'Expériences',
  'espaceMembre.onboarding.steps.formations': 'Formations',
  'espaceMembre.onboarding.steps.certifications': 'Certifications',
  'espaceMembre.onboarding.steps.langues': 'Langues',
  'espaceMembre.onboarding.steps.visibilite': 'Visibilité',
  'espaceMembre.onboarding.steps.charte': 'Charte',
  'espaceMembre.onboarding.steps.adhesion': 'Adhésion',
  'espaceMembre.onboarding.compte.cgu': "J'accepte les CGU",
  'espaceMembre.onboarding.compte.email': 'Email',
  'espaceMembre.onboarding.languePays.langue': 'Langue',
  'espaceMembre.onboarding.languePays.pays': 'Pays',
  'espaceMembre.onboarding.identite.displayName': 'Nom public',
  'espaceMembre.onboarding.photo.url': 'URL de la photo',
  'espaceMembre.onboarding.titre.label': 'Titre',
  'espaceMembre.onboarding.resume.label': 'Résumé',
  'espaceMembre.onboarding.expertises.label': 'Expertises',
  'espaceMembre.onboarding.experiences.organization': 'Organisation',
  'espaceMembre.onboarding.experiences.jobTitle': 'Poste',
  'espaceMembre.onboarding.experiences.startDate': 'Date de début',
  'espaceMembre.onboarding.formations.institution': 'Établissement',
  'espaceMembre.onboarding.formations.program': 'Programme',
  'espaceMembre.onboarding.formations.startDate': 'Date de début',
  'espaceMembre.onboarding.certifications.label': 'Certification',
  'espaceMembre.onboarding.langues.language': 'Langue',
  'espaceMembre.onboarding.langues.level': 'Niveau',
  'espaceMembre.onboarding.visibilite.hint': 'Choisissez les champs visibles publiquement.',
  'espaceMembre.onboarding.visibilite.fields.title': 'Titre',
  'espaceMembre.onboarding.visibilite.fields.summary': 'Résumé',
  'espaceMembre.onboarding.visibilite.fields.location': 'Localisation',
  'espaceMembre.onboarding.visibilite.fields.expertiseAreas': "Domaines d'expertise",
  'espaceMembre.onboarding.visibilite.fields.technologies': 'Technologies',
  'espaceMembre.onboarding.visibilite.fields.sectors': 'Secteurs',
  'espaceMembre.onboarding.visibilite.fields.languages': 'Langues',
  'espaceMembre.onboarding.visibilite.fields.experiences': 'Expériences',
  'espaceMembre.onboarding.visibilite.fields.educations': 'Formations',
   'espaceMembre.onboarding.visibilite.fields.certifications': 'Certifications',
   'espaceMembre.onboarding.visibilite.fields.badges': 'Badges',
   'espaceMembre.onboarding.visibilite.fields.membershipTier': "Niveau d'adhésion",
   'espaceMembre.onboarding.visibilite.fields.socialLinks': 'Réseaux sociaux',
   'espaceMembre.onboarding.charte.label': "J'accepte la charte éthique de l'OEI",
  'espaceMembre.onboarding.adhesion.summary': "Votre niveau d'adhésion par défaut est :",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Onboarding', () => {
  let updateProfileSpy: ReturnType<typeof vi.fn>;
  let signEthicalCharterSpy: ReturnType<typeof vi.fn>;

  function configure() {
    updateProfileSpy = vi.fn((profile: ProfessionalProfile) => of(profile));
    signEthicalCharterSpy = vi.fn((version: string) =>
      of({ id: 'sig-1', memberId: 'demo-member-1', version, signedAt: new Date().toISOString() }),
    );

    TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: ProfessionalProfileApplicationService,
          useValue: { getProfile: () => of(undefined), updateProfile: updateProfileSpy },
        },
        {
          provide: MembershipApplicationService,
          useValue: {
            getMembership: () => of(undefined),
            signEthicalCharter: signEthicalCharterSpy,
            listEmploymentAffiliations: () => of([]),
            requestEmploymentAffiliation: () => of(undefined),
            listVerificationRequests: () => of([]),
            submitVerificationRequest: () => of(undefined),
          },
        },
      ],
    });
  }

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('givenNoStoredDraft_whenCreated_thenStartsAtFirstStepWithoutRestoredIndicator', () => {
    configure();
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-onboarding__restored')).toBeNull();
    expect(compiled.textContent).toContain('Compte');
  });

  it('givenStoredDraft_whenCreated_thenRestoresDraftAndShowsIndicator', () => {
    sessionStorage.setItem(
      'oei-onboarding-draft',
      JSON.stringify({
        step: 2,
        draft: {
          cguAccepted: true,
          email: 'jane@example.org',
          locale: 'fr',
          country: 'FR',
          displayName: 'Jane D.',
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
        },
      }),
    );
    configure();
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-onboarding__restored')).not.toBeNull();
    expect(compiled.textContent).toContain('Identité');
  });

  it('givenStepNavigation_whenAdvancingAndGoingBack_thenCurrentStepUpdatesAndAutosaves', () => {
    configure();
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['goNext']();
    fixture.detectChanges();
    expect(component['currentStep']()).toBe(1);

    const stored = sessionStorage.getItem('oei-onboarding-draft');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).step).toBe(1);

    component['goPrevious']();
    fixture.detectChanges();
    expect(component['currentStep']()).toBe(0);
  });

  it('givenAddExperience_whenFormFilled_thenExperienceAppendedToDraft', () => {
    configure();
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['newExperience'].set({ organization: 'OEI', title: 'Analyste', startDate: '2024-01-01' });
    component['addExperience']();
    fixture.detectChanges();

    expect(component['draft']().experiences.length).toBe(1);
    expect(component['draft']().experiences[0].organization).toBe('OEI');
  });

  it('givenFinalStepWithCharterAccepted_whenSubmitted_thenUpdatesProfileSignsCharterAndClearsDraft', () => {
    configure();
    const fixture = TestBed.createComponent(Onboarding);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['currentStep'].set(component['steps'].length - 1);
    component['updateDraft']({ charterAccepted: true, title: 'Experte' });
    fixture.detectChanges();
    component['submit']();
    fixture.detectChanges();

    expect(updateProfileSpy).toHaveBeenCalled();
    expect(updateProfileSpy.mock.calls.at(-1)?.[0].memberId).toBe('demo-member-1');
    expect(signEthicalCharterSpy).toHaveBeenCalledWith('1.0');
    expect(component['submitted']()).toBe(true);
    expect(sessionStorage.getItem('oei-onboarding-draft')).toBeNull();
  });
});
