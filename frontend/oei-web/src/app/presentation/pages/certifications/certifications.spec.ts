import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Certifications } from './certifications';
import { I18nService } from '../../i18n/i18n.service';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { CertificationApplicationService } from '../../../application/service/certification-application.service';
import { MemberCertificationGoalApplicationService } from '../../../application/service/member-certification-goal-application.service';
import { createRecognizedCertification } from '../../../domain/model/certification/recognized-certification';
import { createMemberCertificationGoal } from '../../../domain/model/certification/member-certification-goal';

const INTERFACE_STRINGS: Record<string, string> = {
  'certifications.title': 'Certifications',
  'certifications.intro':
    "Nous construisons un cadre de certification indépendante des éditeurs commerciaux de logiciels...",
  'certifications.levels.0': 'Praticien',
  'certifications.levels.1': 'Ingénieur',
  'certifications.levels.2': 'Architecte',
  'certifications.levels.3': 'Expert',
  'certifications.levels.4': 'Expert senior',
  'certifications.levels.5': 'Fellow',
  'certifications.catalog.expertDisclaimer': "Une certification n'accorde jamais automatiquement le niveau Expert.",
  'certifications.catalog.card.viewPath': 'Voir le parcours associé',
  'certifications.catalog.pendingBadge': 'à venir',
  'certifications.catalog.memberCta.view': 'Voir cette certification',
  'certifications.catalog.memberCta.PLANNED': 'Ajouter à mes objectifs',
  'certifications.catalog.memberCta.PREPARING': 'En préparation',
  'certifications.catalog.memberCta.OBTAINED': 'Je possède cette certification',
  'certifications.catalog.memberCta.loginPrompt': 'Connectez-vous pour suivre vos objectifs.',
  'certifications.catalog.empty': 'Aucune certification ne correspond à ces critères.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

const AWS_CERTIFICATION = createRecognizedCertification({
  id: 'rc-1',
  name: 'AWS Certified Solutions Architect',
  issuingOrganization: 'Amazon Web Services',
  autoValidate: true,
  domain: 'Cloud & infrastructure',
  level: 'ARCHITECT',
  language: 'en',
  oeiStatus: 'OEI_RECOGNIZED',
  competencies: ['Architecture cloud'],
  validityMonths: 36,
  associatedPathRoute: null,
});

function configure(options: { connected: boolean; goals?: unknown[] }) {
  const upsertMyCertificationGoal = vi.fn().mockReturnValue(
    of(
      createMemberCertificationGoal({
        id: 'goal-1',
        memberId: 'demo-member-1',
        recognizedCertificationId: 'rc-1',
        status: 'PLANNED',
        createdAt: 'now',
        updatedAt: 'now',
      }),
    ),
  );
  TestBed.configureTestingModule({
    imports: [Certifications],
    providers: [
      provideRouter([]),
      { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      { provide: KeycloakAuthService, useValue: { isAuthenticated: () => options.connected } },
      {
        provide: CertificationApplicationService,
        useValue: { listRecognizedCertifications: () => of([AWS_CERTIFICATION]) },
      },
      {
        provide: MemberCertificationGoalApplicationService,
        useValue: {
          listMyCertificationGoals: () => of(options.goals ?? []),
          upsertMyCertificationGoal,
        },
      },
    ],
  });
  return { upsertMyCertificationGoal };
}

describe('Certifications', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndSixExpertiseLevels', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Certifications');
    const levels = compiled.querySelectorAll('.oei-page__level');
    expect(levels.length).toBe(6);
    expect(compiled.textContent).toContain('Fellow');
  });

  it('givenCatalogEntry_whenRendered_thenShowsCardWithOrganizationAndCompetencies', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('AWS Certified Solutions Architect');
    expect(text).toContain('Amazon Web Services');
    expect(text).toContain('Architecture cloud');
    expect(text).toContain('à venir');
  });

  it('givenNoAssociatedPathRoute_whenRendered_thenViewPathCtaIsDisabled', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const disabledButton = (fixture.nativeElement as HTMLElement).querySelector('.oei-card__button[disabled]');
    expect(disabledButton?.textContent).toContain('Voir le parcours associé');
  });

  it('givenDisconnectedVisitor_whenRendered_thenShowsLoginPromptInsteadOfGoalCtas', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Connectez-vous pour suivre vos objectifs.');
    expect(text).not.toContain('Ajouter à mes objectifs');
  });

  it('givenConnectedMember_whenClickingAddToGoals_thenUpsertsPlannedGoalForThatCertification', async () => {
    const { upsertMyCertificationGoal } = configure({ connected: true, goals: [] });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const plannedButton = buttons.find((button) => button.textContent?.includes('Ajouter à mes objectifs'));
    expect(plannedButton).toBeTruthy();
    plannedButton?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(upsertMyCertificationGoal).toHaveBeenCalledWith({ recognizedCertificationId: 'rc-1', status: 'PLANNED' });
  });
});
