import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InstitutionPublique } from './institution-publique';
import { InstitutionPublicApplicationService } from '../../../application/service/institution-public-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createInstitutionPublicPage } from '../../../domain/model/institution/institution-public-page';
import { DEMO_INSTITUTION, DEMO_OPPORTUNITIES, DEMO_PARTNERSHIP, DEMO_PUBLICATIONS } from '../../../infrastructure/adapter/institution-demo-data';

const INTERFACE_STRINGS: Record<string, string> = {
  'institutionPublic.demoBadge': 'Institution de démonstration',
  'institutionPublic.partnershipTitle': "Partenariat avec l'OEI",
  'institutionPublic.publicationsTitle': 'Publications',
  'institutionPublic.publicationsEmpty': 'Aucune publication publiée pour le moment.',
  'institutionPublic.opportunitiesTitle': 'Opportunités',
  'institutionPublic.opportunitiesEmpty': 'Aucune opportunité publiée pour le moment.',
  'institutionPublic.notFound': 'Institution introuvable.',
  'espaceInstitution.dashboard.levels.SILVER': 'Argent',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('InstitutionPublique', () => {
  function configure(getPublicInstitution: () => ReturnType<InstitutionPublicApplicationService['getPublicInstitution']>) {
    TestBed.configureTestingModule({
      imports: [InstitutionPublique],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: InstitutionPublicApplicationService, useValue: { getPublicInstitution } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'demo-institution' })) } },
      ],
    });
  }

  it('givenExistingSlug_whenCreated_thenRendersInstitutionPublicationsAndOpportunities', async () => {
    const page = createInstitutionPublicPage({
      institution: DEMO_INSTITUTION,
      partnership: DEMO_PARTNERSHIP,
      publications: [DEMO_PUBLICATIONS[0]],
      opportunities: [DEMO_OPPORTUNITIES[0]],
    });
    configure(() => of(page));
    const fixture = TestBed.createComponent(InstitutionPublique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('OEI Démonstration');
    expect(compiled.querySelector('.oei-institution-publique__demo-badge')).toBeTruthy();
    expect(compiled.textContent).toContain(DEMO_PUBLICATIONS[0].title);
    expect(compiled.textContent).toContain(DEMO_OPPORTUNITIES[0].title);
  });

  it('givenUnknownSlug_whenCreated_thenRendersNotFound', async () => {
    configure(() => throwError(() => new Error('not found')));
    const fixture = TestBed.createComponent(InstitutionPublique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
