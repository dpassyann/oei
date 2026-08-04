import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DomaineDetail } from './domaine-detail';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDomainArea } from '../../../domain/model/domain-area';

const INTERFACE_STRINGS: Record<string, string> = {
  'domaineDetail.backToHome': "Retour à l'accueil",
  'domaineDetail.lastModified': 'Dernière mise à jour',
  'domaineDetail.notFound': 'Domaine introuvable.',
  'domaineDetail.onThisPage': 'Sur cette page',
  'domaineDetail.placeholder': 'Contenu à venir.',
  'domaineDetail.sections.apercu': "Vue d'ensemble",
  'domaineDetail.sections.groupe-de-travail': 'Groupe de travail',
  'domaineDetail.sections.ressources': 'Ressources',
  'domaineDetail.sections.contenu-cms': 'Contenu',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithSlug(slug: string) {
  return { paramMap: of(convertToParamMap({ slug })) };
}

describe('DomaineDetail', () => {
  it('givenExistingDomain_whenCreated_thenRendersItsDetailsAndLastModifiedDate', async () => {
    const domain = createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersécurité',
      description: 'Renforcer la résilience des systèmes.',
      lastModified: '2026-07-12',
    });
    TestBed.configureTestingModule({
      imports: [DomaineDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('cybersecurite') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: HomeSectionsApplicationService, useValue: { getDomainArea: () => of(domain) } },
      ],
    });
    const fixture = TestBed.createComponent(DomaineDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Cybersécurité');
    expect(compiled.textContent).toContain('Renforcer la résilience des systèmes.');
    expect(compiled.textContent).toContain('Dernière mise à jour');
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(4);
  });

  it('givenUnknownSlug_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [DomaineDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('unknown') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: HomeSectionsApplicationService,
          useValue: { getDomainArea: () => throwError(() => new Error('not found')) },
        },
      ],
    });
    const fixture = TestBed.createComponent(DomaineDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
