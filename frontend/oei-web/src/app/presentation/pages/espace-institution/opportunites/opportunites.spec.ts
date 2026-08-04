import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InstitutionOpportunitiesPage } from './opportunites';
import { InstitutionOpportunitiesApplicationService } from '../../../../application/service/institution-opportunities-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { DEMO_OPPORTUNITIES } from '../../../../infrastructure/adapter/institution-demo-data';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceInstitution.nav.backToDashboard': 'Retour',
  'espaceInstitution.opportunities.title': 'Opportunités',
  'espaceInstitution.opportunities.intro': 'Intro',
  'espaceInstitution.opportunities.empty': 'Aucune opportunité publiée pour le moment.',
  'espaceInstitution.opportunities.newTitle': 'Nouvelle opportunité',
  'espaceInstitution.opportunities.typeLabel': 'Type',
  'espaceInstitution.opportunities.titleLabel': 'Titre',
  'espaceInstitution.opportunities.descriptionLabel': 'Description',
  'espaceInstitution.opportunities.expiresLabel': 'Expiration',
  'espaceInstitution.opportunities.createSubmit': "Publier l'opportunité",
  'espaceInstitution.opportunities.close': 'Clôturer',
  'espaceInstitution.opportunities.types.MENTORING': 'Mentorat',
  'espaceInstitution.opportunities.status.PUBLISHED': 'Publiée',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('InstitutionOpportunitiesPage', () => {
  function configure(opportunities = DEMO_OPPORTUNITIES) {
    const closeOpportunity = vi.fn(() => of(DEMO_OPPORTUNITIES[0]));
    TestBed.configureTestingModule({
      imports: [InstitutionOpportunitiesPage],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: InstitutionOpportunitiesApplicationService,
          useValue: {
            listOpportunities: () => of([...opportunities]),
            createOpportunity: () => of(opportunities[0]),
            closeOpportunity,
          },
        },
      ],
    });
    return { closeOpportunity };
  }

  it('givenDemoOpportunities_whenCreated_thenRendersEachWithStatus', async () => {
    configure();
    const fixture = TestBed.createComponent(InstitutionOpportunitiesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.oei-institution-opportunities__item').length).toBe(DEMO_OPPORTUNITIES.length);
    expect(compiled.textContent).toContain('Publiée');
  });

  it('givenPublishedOpportunity_whenCloseClicked_thenCallsCloseOpportunityWithId', async () => {
    const { closeOpportunity } = configure();
    const fixture = TestBed.createComponent(InstitutionOpportunitiesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent === 'Clôturer');
    closeButton?.dispatchEvent(new Event('click'));
    expect(closeOpportunity).toHaveBeenCalledWith('institution-opportunity-demo-1');
  });

  it('givenNoOpportunities_whenCreated_thenRendersHonestEmptyState', async () => {
    configure([]);
    const fixture = TestBed.createComponent(InstitutionOpportunitiesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune opportunité');
  });
});
