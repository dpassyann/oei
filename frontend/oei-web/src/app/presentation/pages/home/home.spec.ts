import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { ContentApplicationService } from '../../../application/service/content-application.service';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createStat, Stat } from '../../../domain/model/stat';
import { createDomainArea, DomainArea } from '../../../domain/model/domain-area';
import { createNewsItem, NewsItem } from '../../../domain/model/news-item';
import { createPartner, Partner } from '../../../domain/model/partner';

const FAKE_CONTENT_SERVICE = {
  getHomeContent: () => Promise.resolve({ title: 'Titre test', body: 'Corps test', isFallback: false }),
};

// Real dictionary lookups go through `fetch`, which the unit test environment
// doesn't provide — this fake mirrors the handful of keys the template reads,
// so tests can assert on the rendered wording without depending on network I/O.
const INTERFACE_STRINGS: Record<string, string> = {
  'nav.join': 'Rejoignez le mouvement',
  'home.hero.panelTitle': "L'Ordre des Experts Informaticiens",
  'home.hero.panelBody': 'Un mouvement international pour reconnaître, structurer et élever la profession informatique.',
  'home.commitments.0.title': "Défendre l'intérêt général",
  'home.commitments.0.description': "Placer l'éthique et la sécurité au cœur des usages numériques.",
  'home.commitments.1.title': 'Valoriser les compétences',
  'home.commitments.1.description': "Reconnaître l'expertise et la formation continue.",
  'home.commitments.2.title': 'Instaurer un cadre déontologique',
  'home.commitments.2.description': 'Établir des règles claires et universelles.',
  'home.commitments.3.title': 'Agir au niveau international',
  'home.commitments.3.description': 'Collaborer avec les institutions, entreprises et académies.',
  'home.stats.title': 'Nos chiffres',
  'home.domains.title': "Nos domaines d'action",
  'home.news.title': 'Actualités',
  'home.news.readMore': 'Lire la suite',
  'home.news.empty': "Aucune actualité n'a été publiée pour le moment. Revenez bientôt.",
  'home.resources.title': 'Nos ressources',
  'home.resources.viewAll': 'Voir toutes les ressources',
  'home.resources.items.deontologie.label': 'Code de déontologie',
  'home.resources.items.referentiel.label': 'Référentiel de compétences',
  'home.resources.items.livreBlanc.label': 'Livre Blanc',
  'home.resources.pendingBadge': 'à venir',
  'home.partners.title': 'Ils nous soutiennent',
  'home.fallbackNotice': 'Traduction à venir dans cette langue.',
};

const LIST_STRINGS: Record<string, readonly string[]> = {
  'home.hero.checklist': [
    'Protéger le public et les professionnels',
    "Promouvoir l'excellence et la formation continue",
    'Établir un code de déontologie mondial',
    'Accompagner les transformations numériques de manière responsable',
  ],
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: (key: string) => LIST_STRINGS[key] ?? [],
};

function fakeSectionsService(overrides?: {
  stats?: Stat[];
  domainAreas?: DomainArea[];
  news?: NewsItem[];
}): Pick<HomeSectionsApplicationService, 'getStats' | 'getDomainAreas' | 'getLatestNews'> {
  return {
    getStats: () => Promise.resolve(overrides?.stats ?? []),
    getDomainAreas: () => Promise.resolve(overrides?.domainAreas ?? []),
    getLatestNews: () => Promise.resolve(overrides?.news ?? []),
  };
}

function fakePartnerService(partners: Partner[]): Pick<PartnerApplicationService, 'getPartners' | 'getPartner'> {
  return {
    getPartners: () => Promise.resolve(partners),
    getPartner: (id) => Promise.resolve(partners.find((partner) => partner.id === id) as Partner),
  };
}

const FOUR_STATS: Stat[] = [
  createStat({ label: 'Membres fondateurs', value: 0 }),
  createStat({ label: 'Partenaires académiques', value: 0 }),
  createStat({ label: 'Pays concernés', value: 0 }),
  createStat({ label: 'Certifications en développement', value: 0 }),
];

const EIGHT_DOMAINS: DomainArea[] = Array.from({ length: 8 }, (_, index) =>
  createDomainArea({ icon: 'shield-lock', title: `Domaine ${index + 1}`, description: `Description ${index + 1}` }),
);

describe('Home', () => {
  function configure(options?: { stats?: Stat[]; domainAreas?: DomainArea[]; news?: NewsItem[]; partners?: Partner[] }) {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: ContentApplicationService, useValue: FAKE_CONTENT_SERVICE },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: HomeSectionsApplicationService,
          useValue: fakeSectionsService({ stats: options?.stats, domainAreas: options?.domainAreas, news: options?.news }),
        },
        { provide: PartnerApplicationService, useValue: fakePartnerService(options?.partners ?? []) },
      ],
    });
  }

  it('givenMockContent_whenNgOnInit_thenTitleIsPopulated', async () => {
    configure();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Titre test');
  });

  it('givenFourStats_whenNgOnInit_thenRendersFourStatEntriesWithPlusSuffix', async () => {
    configure({ stats: FOUR_STATS });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const items = compiled.querySelectorAll('.oei-commitments__stat');
    expect(items.length).toBe(4);
    expect(compiled.querySelector('.oei-commitments__stat-value')?.textContent).toContain('0+');
  });

  it('givenEightDomainAreas_whenNgOnInit_thenRendersEightDomainCards', async () => {
    configure({ domainAreas: EIGHT_DOMAINS });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.oei-domains__card');
    expect(cards.length).toBe(8);
    expect(compiled.textContent).toContain('Domaine 1');
  });

  it('givenNoNews_whenNgOnInit_thenRendersHonestEmptyState', async () => {
    configure({ news: [] });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-news__empty')?.textContent).toContain('Aucune actualité');
    expect(compiled.querySelector('.oei-news__list')).toBeNull();
  });

  it('givenNewsItems_whenNgOnInit_thenRendersNewsListInsteadOfEmptyState', async () => {
    const news = [
      createNewsItem({ title: 'Publication du Livre Blanc', excerpt: 'Extrait', imageUrl: '/img.png', path: '/actualites' }),
    ];
    configure({ news });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-news__empty')).toBeNull();
    expect(compiled.querySelectorAll('.oei-news__item').length).toBe(1);
    expect(compiled.textContent).toContain('Publication du Livre Blanc');
  });

  it('givenComponent_whenNgOnInit_thenRendersResourceExcerptWithThreeLinksAndViewAllLink', async () => {
    configure();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.oei-resources-excerpt__item').length).toBe(3);
    expect(compiled.textContent).toContain('Code de déontologie');
    const viewAll = compiled.querySelector('.oei-resources-excerpt__view-all') as HTMLAnchorElement | null;
    expect(viewAll).not.toBeNull();
    expect(viewAll?.getAttribute('href')).toBe('/ressources');
  });

  it('givenNoPartners_whenNgOnInit_thenPartnersSectionIsAbsent', async () => {
    configure({ partners: [] });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-partners')).toBeNull();
  });

  it('givenPartners_whenNgOnInit_thenRendersPartnersRowWithLogos', async () => {
    const partners = [
      createPartner({
        id: 'demo-1',
        name: 'Partenaire de démonstration 1',
        logoUrl: '/assets/partners/demo-1.svg',
        description: 'Desc',
        websiteUrl: 'https://example.org',
        category: 'Démonstration',
      }),
    ];
    configure({ partners });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-partners')).not.toBeNull();
    const logos = compiled.querySelectorAll<HTMLImageElement>('.oei-partners__logo');
    expect(logos.length).toBe(1);
    expect(logos[0].getAttribute('src')).toBe('/assets/partners/demo-1.svg');
  });
});
