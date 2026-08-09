import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DomaineDetail } from './domaine-detail';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDomainArea } from '../../../domain/model/domain-area';
import { createNewsItem } from '../../../domain/model/news-item';

const INTERFACE_STRINGS: Record<string, string> = {
  'domaineDetail.backToHome': "Retour à l'accueil",
  'domaineDetail.lastModified': 'Dernière mise à jour',
  'domaineDetail.notFound': 'Domaine introuvable.',
  'domaineDetail.onThisPage': 'Sur cette page',
  'domaineDetail.contentFallbackNotice': 'Contenu détaillé non traduit pour le moment.',
  'domaineDetail.relatedResources.title': 'Ressources associées',
  'domaineDetail.relatedNews.title': 'Actualités associées',
  'domaineDetail.relatedNews.readMore': 'Lire la suite',
  'domaineDetail.contribute.title': 'Contribuer à cette thématique',
  'domaineDetail.contribute.body': "Vous souhaitez contribuer ? Contactez l'OEI.",
  'domaineDetail.contribute.cta': 'Contribuer à cette thématique',
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

function domainWithFullContent() {
  return createDomainArea({
    slug: 'cybersecurite',
    icon: 'shield-lock',
    title: 'Cybersécurité',
    description: 'Renforcer la résilience des systèmes.',
    lastModified: '2026-07-12',
    subtitle: 'Protéger les infrastructures numériques.',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        paragraphs: ['La cybersécurité est essentielle.'],
      },
      {
        id: 'threat-landscape',
        title: 'Threat Landscape',
        paragraphs: ['Le paysage des menaces évolue.'],
        bullets: ['Rançongiciels', 'Espionnage'],
      },
      { id: 'oei-position', title: 'OEI Position', paragraphs: ["Position de l'OEI."] },
    ],
    relatedResources: [
      { title: 'Livre Blanc de l’OEI', description: 'La synthèse.', path: '/livre-blanc' },
    ],
    relatedNews: [
      createNewsItem({
        title: 'Cybersécurité : rejoignez le groupe de travail',
        excerpt: "L'OEI invite les professionnels à contribuer.",
        imageUrl: '/assets/news/appel-contribution.svg',
        path: '/nos-missions',
      }),
    ],
  });
}

describe('DomaineDetail', () => {
  it('givenExistingDomain_whenCreated_thenRendersItsDetailsSectionsResourcesAndNews', async () => {
    const domain = domainWithFullContent();
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
    expect(compiled.textContent).toContain('Protéger les infrastructures numériques.');
    expect(compiled.textContent).toContain('Dernière mise à jour');
    expect(compiled.textContent).toContain('Threat Landscape');
    expect(compiled.textContent).toContain('Rançongiciels');
    expect(compiled.textContent).toContain('Ressources associées');
    expect(compiled.textContent).toContain('Livre Blanc de l’OEI');
    expect(compiled.textContent).toContain('Actualités associées');
    expect(compiled.textContent).toContain('rejoignez le groupe de travail');
    expect(compiled.textContent).toContain('Contribuer à cette thématique');
    expect(
      compiled.querySelector('a.oei-domaine-detail__contribute-cta')?.getAttribute('href'),
    ).toBe('/contact');
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(3);
  });

  it('givenContentFallback_whenCreated_thenShowsFallbackNotice', async () => {
    const domain = createDomainArea({ ...domainWithFullContent(), isContentFallback: true });
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

    expect(compiled.querySelector('.oei-fallback-banner')).not.toBeNull();
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
