import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CvBuilder } from './cv-builder';
import { CvApplicationService } from '../../../../application/service/cv-application.service';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { MembershipFeeApplicationService } from '../../../../application/service/membership-fee-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { Cv, CvSection, CvTranslation } from '../../../../domain/model/cv/cv';
import { CvTemplate } from '../../../../domain/model/cv/cv-template';
import { createMember } from '../../../../domain/model/identity/member';
import { MembershipFeeStatus } from '../../../../domain/model/membership-fee/membership-fee-status';
import { Membership, MembershipStatus } from '../../../../domain/model/membership/membership';

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

function membershipFixture(status: MembershipStatus = 'ACTIVE'): Membership {
  return { memberId: 'demo-member-1', tier: 'SILVER', status, startedAt: '2026-01-01T00:00:00Z' };
}

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.cv.title': 'Mon CV',
  'espaceMembre.cv.empty': 'Aucun CV n’a encore été créé.',
  'espaceMembre.cv.templateLabel': 'Modèle',
  'espaceMembre.cv.sectionsTitle': 'Sections',
  'espaceMembre.cv.noSections': 'Aucune section pour le moment.',
  'espaceMembre.cv.sectionTypes.EXPERIENCE': 'Expérience professionnelle',
  'espaceMembre.cv.sectionTypes.IDENTITY': 'Identité',
  'espaceMembre.cv.translationsTitle': 'Traductions',
  'espaceMembre.cv.noTranslations': 'Aucune traduction pour le moment.',
  'espaceMembre.cv.translationStatus.MACHINE_GENERATED': 'Traduction automatique',
  'espaceMembre.cv.translationStatus.PENDING_VALIDATION': 'En attente de validation',
  'espaceMembre.cv.translationStatus.VALIDATED': 'Validée',
  'espaceMembre.cv.unvalidatedWarning': 'Traduction automatique non validée',
  'espaceMembre.cv.validateTranslation': 'Valider cette traduction',
  'espaceMembre.cv.addTranslationLanguageLabel': 'Langue',
  'espaceMembre.cv.addTranslationContentLabel': 'Contenu',
  'espaceMembre.cv.addTranslationSubmit': 'Ajouter une traduction',
  'espaceMembre.cv.addSectionTitle': 'Ajouter une section',
  'espaceMembre.cv.addSectionTypeLabel': 'Type de section',
  'espaceMembre.cv.addSectionContentLabel': 'Contenu',
  'espaceMembre.cv.addSectionSubmit': 'Ajouter la section',
  'espaceMembre.cv.noAvailableSectionTypes': 'Toutes les sections ont déjà été ajoutées.',
  'espaceMembre.cv.generatePdfTitle': 'Génération du PDF',
  'espaceMembre.cv.pdfDemoNotice':
    'Ceci est un PDF de démonstration : le moteur de rendu final n’est pas encore implémenté.',
  'espaceMembre.cv.generatePdf': 'Générer le PDF',
  'espaceMembre.cv.generatingPdf': 'Génération en cours…',
  'espaceMembre.cv.downloadPdf': 'Télécharger le PDF',
  'espaceMembre.cv.templateGallery.title': 'Galerie de templates',
  'espaceMembre.cv.templateGallery.intro': 'Choisissez un template.',
  'espaceMembre.cv.livePreview.title': 'Aperçu en direct',
  'espaceMembre.cv.livePreview.intro': 'Cet aperçu utilise vos données réelles.',
  'espaceMembre.cv.livePreview.orgLine': "Ordre International des Experts de l'Informatique",
  'espaceMembre.cv.livePreview.sealBrand': 'OEI',
  'espaceMembre.cv.livePreview.sealCertifiedLabel': 'CERTIFIÉ',
  'espaceMembre.cv.exportBlocked': "L'export PDF n'est pas disponible avec votre statut d'adhésion actuel.",
  'espaceMembre.cv.renewalImminentWarning': 'Votre renouvellement est proche.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

const TEMPLATE: CvTemplate = { id: 'template-1', code: 'CLASSIC', name: 'Classique' };

function machineTranslation(): CvTranslation {
  return {
    id: 'translation-1',
    sectionId: 'section-1',
    language: 'en',
    content: { text: 'Auto translated' },
    status: 'MACHINE_GENERATED',
    translatedAt: '2026-01-01T00:00:00Z',
  };
}

function section(overrides: Partial<CvSection> = {}): CvSection {
  return {
    id: 'section-1',
    cvId: 'demo-cv-1',
    type: 'EXPERIENCE',
    order: 0,
    content: { text: 'Ingénieur logiciel' },
    translations: [machineTranslation()],
    ...overrides,
  };
}

function cv(overrides: Partial<Cv> = {}): Cv {
  return {
    id: 'demo-cv-1',
    memberId: 'member-1',
    templateId: 'template-1',
    sourceLanguage: 'fr',
    status: 'DRAFT',
    sections: [section()],
    ...overrides,
  };
}

function fakeCvService(overrides: Partial<CvApplicationService> = {}) {
  return {
    listCvs: () => of([cv()]),
    listTemplates: () => of([TEMPLATE]),
    getCv: () => of(cv()),
    createCv: () => of(cv()),
    updateCv: () => of(cv()),
    addSection: () => of(section({ id: 'section-2', type: 'SUMMARY' })),
    updateSection: () => of(section()),
    addTranslation: () => of(machineTranslation()),
    validateTranslation: () => of({ ...machineTranslation(), status: 'VALIDATED' as const }),
    renderCv: () =>
      of({
        id: 'job-1',
        targetType: 'CV' as const,
        targetId: 'demo-cv-1',
        status: 'DONE' as const,
        resultUrl: '/assets/mock/demo-cv-1.pdf',
        requestedAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-01T00:00:01Z',
      }),
    ...overrides,
  };
}

const TEMPLATE_2: CvTemplate = { id: 'template-2', code: 'MODERN', name: 'Moderne' };

const FAKE_MEMBER_SERVICE: Pick<MemberApplicationService, 'getCurrentMember'> = {
  getCurrentMember: () =>
    of(
      createMember({
        id: 'member-1',
        publicSlug: 'demo-jane-dupont',
        displayName: 'Jane Dupont (Démonstration)',
        locale: 'fr',
        country: 'FR',
        createdAt: '2026-01-01T00:00:00Z',
      }),
    ),
};

describe('CvBuilder', () => {
  function configure(
    cvServiceOverrides: Partial<CvApplicationService> = {},
    feeStatus: MembershipFeeStatus = PAID_FEE_STATUS,
    membershipStatus: MembershipStatus = 'ACTIVE',
  ) {
    TestBed.configureTestingModule({
      imports: [CvBuilder],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: CvApplicationService, useValue: fakeCvService(cvServiceOverrides) },
        { provide: MemberApplicationService, useValue: FAKE_MEMBER_SERVICE },
        { provide: MembershipFeeApplicationService, useValue: { getStatus: () => of(feeStatus) } },
        {
          provide: MembershipApplicationService,
          useValue: { getMembership: () => of(membershipFixture(membershipStatus)) },
        },
      ],
    });
  }

  it('givenNoCv_whenCreated_thenRendersHonestEmptyState', async () => {
    configure({ listCvs: () => of([]) });
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucun CV');
  });

  it('givenCvWithMachineGeneratedTranslation_whenCreated_thenRendersUnvalidatedWarning', async () => {
    configure();
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Expérience professionnelle');
    expect(compiled.querySelector('.oei-cv-builder__translation-warning')?.textContent).toContain(
      'Traduction automatique non validée',
    );
    expect(compiled.querySelector('.oei-cv-builder__validate-button')).not.toBeNull();
  });

  it('givenValidatedTranslation_whenCreated_thenHidesValidateButton', async () => {
    configure({
      listCvs: () =>
        of([
          cv({
            sections: [section({ translations: [{ ...machineTranslation(), status: 'VALIDATED' }] })],
          }),
        ]),
    });
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-cv-builder__validate-button')).toBeNull();
    expect(compiled.querySelector('.oei-cv-builder__translation-warning')).toBeNull();
  });

  it('givenGeneratePdfClicked_whenJobResolves_thenRendersDownloadLink', async () => {
    configure();
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const button = compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__generate-button');
    button?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.oei-cv-builder__download-link');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/assets/mock/demo-cv-1.pdf');
    expect(compiled.textContent).toContain('démonstration');
  });

  it('givenBrandedPreview_whenCreated_thenRendersWatermarkAndDiplomaSeal', async () => {
    configure();
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-cv-preview__watermark')).not.toBeNull();
    expect(compiled.querySelector('.oei-cv-preview__seal')).not.toBeNull();
    // Circular ring text (SVG `textPath`) replaces the old flat seal text — still carries the
    // same institutional wording (org name + "certified" label), just laid out around the seal.
    expect(compiled.querySelector('.oei-cv-preview__seal-ring-text')?.textContent).toContain(
      "Ordre International des Experts de l'Informatique",
    );
    expect(compiled.querySelector('.oei-cv-preview__seal-ring-text')?.textContent).toContain('CERTIFIÉ');
  });

  it('givenTemplateThumbnailClicked_whenSelected_thenUpdatesLivePreviewAndPersistsChoice', async () => {
    let receivedTemplateId: string | undefined;
    configure({
      listTemplates: () => of([TEMPLATE, TEMPLATE_2]),
      updateCv: (id, updatedCv) => {
        receivedTemplateId = updatedCv.templateId;
        return of(updatedCv);
      },
    });
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const thumbs = compiled.querySelectorAll<HTMLButtonElement>('.oei-cv-builder__template-thumb');
    expect(thumbs.length).toBe(2);
    thumbs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(receivedTemplateId).toBe('template-2');
    expect(compiled.querySelector('.oei-cv-preview--modern')).not.toBeNull();
  });

  it('givenUnpaidCotisation_whenRendered_thenShowsReadOnlyBannerAndDisablesMutatingButtons', async () => {
    configure({}, UNPAID_FEE_STATUS);
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-read-only-banner')).toBeTruthy();
    expect(compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__validate-button')?.disabled).toBe(true);
    expect(compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__add-translation-submit')?.disabled).toBe(true);
    expect(compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__add-section-submit')?.disabled).toBe(true);
  });

  it('givenUnpaidCotisation_whenAddSectionCalledDirectly_thenDoesNotPersist', async () => {
    const addSection = vi.fn().mockReturnValue(of(section({ id: 'section-2', type: 'SUMMARY' })));
    configure({ addSection }, UNPAID_FEE_STATUS);
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['newSectionType'].set('SUMMARY');
    component['addSection']();

    expect(addSection).not.toHaveBeenCalled();
  });

  it('givenExpiredMembership_whenRendered_thenDisablesExportButtonAndShowsExplicitMessage', async () => {
    configure({}, PAID_FEE_STATUS, 'EXPIRED');
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__generate-button')?.disabled).toBe(true);
    expect(compiled.querySelector('.oei-cv-builder__export-blocked')).toBeTruthy();
  });

  it('givenExpiredMembership_whenGeneratePdfCalledDirectly_thenDoesNotRenderJob', async () => {
    const renderCv = vi.fn().mockReturnValue(
      of({
        id: 'job-1',
        targetType: 'CV' as const,
        targetId: 'demo-cv-1',
        status: 'DONE' as const,
        resultUrl: '/assets/mock/demo-cv-1.pdf',
        requestedAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-01T00:00:01Z',
      }),
    );
    configure({ renderCv }, PAID_FEE_STATUS, 'EXPIRED');
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['generatePdf']();

    expect(renderCv).not.toHaveBeenCalled();
  });

  it('givenGracePeriodMembership_whenRendered_thenKeepsExportEnabledAndShowsRenewalWarning', async () => {
    configure({}, PAID_FEE_STATUS, 'GRACE_PERIOD');
    const fixture = TestBed.createComponent(CvBuilder);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector<HTMLButtonElement>('.oei-cv-builder__generate-button')?.disabled).toBe(false);
    expect(compiled.querySelector('.oei-cv-builder__renewal-warning')).toBeTruthy();
  });
});
