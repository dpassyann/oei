import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { InstitutionDashboard } from './dashboard';
import { InstitutionAccountApplicationService } from '../../../../application/service/institution-account-application.service';
import { InstitutionDashboardApplicationService } from '../../../../application/service/institution-dashboard-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { DEMO_DASHBOARD, DEMO_INSTITUTION, DEMO_PARTNERSHIP } from '../../../../infrastructure/adapter/institution-demo-data';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceInstitution.dashboard.title': 'Espace institution',
  'espaceInstitution.dashboard.intro': 'Intro',
  'espaceInstitution.dashboard.maturityInProgress': 'Données en cours de constitution',
  'espaceInstitution.dashboard.partnership.title': 'Partenariat',
  'espaceInstitution.dashboard.partnership.level': 'Niveau',
  'espaceInstitution.dashboard.partnership.verified': 'Vérifié',
  'espaceInstitution.dashboard.levels.SILVER': 'Argent',
  'espaceInstitution.nav.membres': 'Membres affiliés',
  'espaceInstitution.nav.publications': 'Publications',
  'espaceInstitution.nav.opportunites': 'Opportunités',
  'institutionPublic.demoBadge': 'Institution de démonstration',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('InstitutionDashboard', () => {
  function configure() {
    TestBed.configureTestingModule({
      imports: [InstitutionDashboard],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: InstitutionAccountApplicationService,
          useValue: { getMyInstitution: () => of(DEMO_INSTITUTION), getMyPartnership: () => of(DEMO_PARTNERSHIP) },
        },
        { provide: InstitutionDashboardApplicationService, useValue: { getDashboard: () => of(DEMO_DASHBOARD) } },
      ],
    });
  }

  it('givenDemoInstitution_whenCreated_thenRendersIdentityDemoBadgeAndKpis', async () => {
    configure();
    const fixture = TestBed.createComponent(InstitutionDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Espace institution');
    expect(compiled.querySelector('.oei-institution-dashboard__demo-badge')?.textContent).toContain('démonstration');
    expect(compiled.querySelectorAll('.oei-institution-dashboard__kpi').length).toBe(11);
  });

  it('givenInProgressMaturity_whenCreated_thenShowsHonestInProgressMessage', async () => {
    configure();
    const fixture = TestBed.createComponent(InstitutionDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('en cours de constitution');
  });
});
