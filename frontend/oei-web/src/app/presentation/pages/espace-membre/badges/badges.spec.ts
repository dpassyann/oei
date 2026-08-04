import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Badges } from './badges';
import { BadgeApplicationService } from '../../../../application/service/badge-application.service';
import { CertificationApplicationService } from '../../../../application/service/certification-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { BadgeAward, createBadge, createBadgeAward } from '../../../../domain/model/badge/badge';
import { Certification, createCertification } from '../../../../domain/model/certification/certification';
import { RecognizedCertification } from '../../../../domain/model/certification/recognized-certification';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.badges.title': 'Mes badges et certifications',
  'espaceMembre.badges.intro': 'Retrouvez ici vos badges obtenus et vos certifications déclarées.',
  'espaceMembre.badges.sectionBadges': 'Badges',
  'espaceMembre.badges.emptyBadges': "Vous n'avez encore reçu aucun badge.",
  'espaceMembre.badges.badgeRevoked': 'Révoqué',
  'espaceMembre.badges.badgeUnknownPrefix': 'Badge :',
  'espaceMembre.badges.awardedAtPrefix': 'Obtenu le',
  'espaceMembre.badges.sectionCertifications': 'Certifications',
  'espaceMembre.badges.emptyCertifications': "Vous n'avez déclaré aucune certification.",
  'espaceMembre.badges.certificationStatus.DECLARED': 'Déclarée',
  'espaceMembre.badges.certificationStatus.UNDER_REVIEW': 'En cours de vérification',
  'espaceMembre.badges.certificationStatus.VALIDATED': 'Validée',
  'espaceMembre.badges.certificationStatus.REJECTED': 'Rejetée',
  'espaceMembre.badges.certificationStatus.EXPIRED': 'Expirée',
  'espaceMembre.badges.certificationStatus.REVOKED': 'Révoquée',
  'espaceMembre.badges.category.MEMBERSHIP': 'Adhésion',
  'espaceMembre.badges.category.CONTRIBUTION': 'Contribution',
  'espaceMembre.badges.category.CERTIFICATION': 'Certification',
  'espaceMembre.badges.category.RECOGNITION': 'Reconnaissance',
  'espaceMembre.badges.declareForm.title': 'Déclarer une certification',
  'espaceMembre.badges.declareForm.name': 'Nom de la certification',
  'espaceMembre.badges.declareForm.issuingOrganization': 'Organisme émetteur',
  'espaceMembre.badges.declareForm.recognizedCertification': 'Certification reconnue (optionnel)',
  'espaceMembre.badges.declareForm.recognizedCertificationNone': 'Aucune',
  'espaceMembre.badges.declareForm.issuedAt': "Date d'obtention",
  'espaceMembre.badges.declareForm.proofDocumentUrl': 'Référence du justificatif',
  'espaceMembre.badges.declareForm.proofDocumentNote':
    "L'envoi d'un document réel n'est pas implémenté dans cette démonstration : indiquez une URL ou une référence.",
  'espaceMembre.badges.declareForm.submit': 'Déclarer',
  'espaceMembre.badges.declareForm.successMessage': 'Votre certification a été déclarée avec succès.',
  'espaceMembre.badges.declareForm.errorMessage': 'La déclaration a échoué. Merci de réessayer.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function fakeBadgeService(
  awards: BadgeAward[],
): Pick<BadgeApplicationService, 'listMyBadgeAwards'> {
  return {
    listMyBadgeAwards: () => of(awards),
  };
}

function fakeCertificationService(
  certifications: Certification[],
  recognized: RecognizedCertification[] = [],
  declareResult: Certification | 'error' = certifications[0],
): Pick<
  CertificationApplicationService,
  'listCertifications' | 'listRecognizedCertifications' | 'declareCertification' | 'getCertification'
> {
  return {
    listCertifications: () => of(certifications),
    listRecognizedCertifications: () => of(recognized),
    getCertification: (id: string) => of(certifications.find((c) => c.id === id) as Certification),
    declareCertification: () =>
      declareResult === 'error'
        ? new Observable((subscriber) => subscriber.error(new Error('declare failed')))
        : of(declareResult),
  };
}

describe('Badges', () => {
  function configure(
    awards: BadgeAward[] = [],
    certifications: Certification[] = [],
    recognized: RecognizedCertification[] = [],
    declareResult: Certification | 'error' = certifications[0],
  ) {
    TestBed.configureTestingModule({
      imports: [Badges],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: BadgeApplicationService, useValue: fakeBadgeService(awards) },
        {
          provide: CertificationApplicationService,
          useValue: fakeCertificationService(certifications, recognized, declareResult),
        },
      ],
    });
  }

  it('givenNoBadgesOrCertifications_whenCreated_thenRendersHonestEmptyStates', async () => {
    configure([], []);
    const fixture = TestBed.createComponent(Badges);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const emptyStates = compiled.querySelectorAll('.oei-page__empty');
    expect(emptyStates.length).toBe(2);
    expect(compiled.querySelector('.oei-badges__list')).toBeNull();
    expect(compiled.querySelector('.oei-badges__cert-list')).toBeNull();
  });

  it('givenBadgeAwardWithDenormalizedBadge_whenCreated_thenRendersBadgeDetails', async () => {
    const badge = createBadge({
      id: 'badge-1',
      code: 'MEMBER',
      name: 'Membre',
      description: 'Badge de membre',
      category: 'MEMBERSHIP',
    });
    const award = createBadgeAward({
      id: 'award-1',
      badgeId: 'badge-1',
      memberId: 'member-1',
      awardedAt: '2026-01-15T00:00:00.000Z',
      source: 'AUTOMATIC',
      badge,
    });
    configure([award], []);
    const fixture = TestBed.createComponent(Badges);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Membre');
    expect(compiled.textContent).toContain('Badge de membre');
    expect(compiled.querySelector('.oei-badges__revoked-tag')).toBeNull();
  });

  it('givenRevokedBadgeAward_whenCreated_thenRevocationIsNeverHidden', async () => {
    const award = createBadgeAward({
      id: 'award-2',
      badgeId: 'badge-2',
      memberId: 'member-1',
      awardedAt: '2026-01-15T00:00:00.000Z',
      source: 'MANUAL',
      revoked: true,
      revokedAt: '2026-02-01T00:00:00.000Z',
    });
    configure([award], []);
    const fixture = TestBed.createComponent(Badges);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-badges__revoked-tag')?.textContent).toContain('Révoqué');
    expect(compiled.textContent).toContain('badge-2');
  });

  it('givenCertificationWithStatus_whenCreated_thenRendersDistinctStatusModifierClass', async () => {
    const certification = createCertification({
      id: 'cert-1',
      memberId: 'member-1',
      name: 'AWS Certified',
      issuingOrganization: 'Amazon',
      status: 'VALIDATED',
    });
    configure([], [certification]);
    const fixture = TestBed.createComponent(Badges);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const statusEl = compiled.querySelector('.oei-badges__cert-status');
    expect(statusEl?.classList.contains('oei-badges__cert-status--validated')).toBe(true);
    expect(statusEl?.textContent).toContain('Validée');
  });

  it('givenValidDeclarationForm_whenSubmitted_thenCallsDeclareCertificationAndRefreshesList', async () => {
    const declared = createCertification({
      id: 'cert-2',
      memberId: 'member-1',
      name: 'PMP',
      issuingOrganization: 'PMI',
      status: 'DECLARED',
    });
    configure([], [], [], declared);
    const fixture = TestBed.createComponent(Badges);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll<HTMLInputElement>('.oei-badges__field input');
    const [nameInput, issuingOrganizationInput, issuedAtInput, proofDocumentUrlInput] = Array.from(inputs);

    function setValue(input: HTMLInputElement, value: string): void {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));
      input.dispatchEvent(new Event('blur'));
    }

    setValue(nameInput, 'PMP');
    setValue(issuingOrganizationInput, 'PMI');
    setValue(issuedAtInput, '2026-01-01');
    setValue(proofDocumentUrlInput, 'https://example.org/proof.pdf');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = compiled.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.oei-badges__declare-success')).not.toBeNull();
  });
});
