import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InstitutionPublicationsPage } from './publications';
import { InstitutionPublicationsApplicationService } from '../../../../application/service/institution-publications-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { DEMO_PUBLICATIONS } from '../../../../infrastructure/adapter/institution-demo-data';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceInstitution.nav.backToDashboard': 'Retour',
  'espaceInstitution.publications.title': 'Publications institutionnelles',
  'espaceInstitution.publications.intro': 'Intro',
  'espaceInstitution.publications.empty': 'Aucune publication institutionnelle pour le moment.',
  'espaceInstitution.publications.newTitle': 'Nouvelle publication',
  'espaceInstitution.publications.typeLabel': 'Type',
  'espaceInstitution.publications.titleLabel': 'Titre',
  'espaceInstitution.publications.bodyLabel': 'Contenu',
  'espaceInstitution.publications.createSubmit': 'Créer le brouillon',
  'espaceInstitution.publications.submitForReview': 'Soumettre',
  'espaceInstitution.publications.workflow.DRAFT': 'Brouillon',
  'espaceInstitution.publications.workflow.PUBLISHED': 'Publiée',
  'espaceInstitution.publications.types.STUDY': 'Étude',
  'espaceInstitution.publications.types.EXPERIENCE_REPORT': "Retour d'expérience",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('InstitutionPublicationsPage', () => {
  function configure(publications = DEMO_PUBLICATIONS) {
    const submitPublication = vi.fn(() => of(DEMO_PUBLICATIONS[1]));
    TestBed.configureTestingModule({
      imports: [InstitutionPublicationsPage],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: InstitutionPublicationsApplicationService,
          useValue: {
            listPublications: () => of([...publications]),
            createPublication: () => of(publications[0]),
            submitPublication,
          },
        },
      ],
    });
    return { submitPublication };
  }

  it('givenDemoPublications_whenCreated_thenRendersWorkflowStatusForEach', async () => {
    configure();
    const fixture = TestBed.createComponent(InstitutionPublicationsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.oei-institution-publications__item').length).toBe(DEMO_PUBLICATIONS.length);
    expect(compiled.textContent).toContain('Brouillon');
  });

  it('givenDraftPublication_whenSubmitClicked_thenCallsSubmitPublicationWithId', async () => {
    const { submitPublication } = configure();
    const fixture = TestBed.createComponent(InstitutionPublicationsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent === 'Soumettre');
    submitButton?.dispatchEvent(new Event('click'));
    expect(submitPublication).toHaveBeenCalledWith('institution-publication-demo-2');
  });

  it('givenNoPublications_whenCreated_thenRendersHonestEmptyState', async () => {
    configure([]);
    const fixture = TestBed.createComponent(InstitutionPublicationsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune publication');
  });
});
