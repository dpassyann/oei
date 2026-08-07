import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlanDuSite } from './plan-du-site';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'planDuSite.title': 'Plan du site',
  'planDuSite.links.home': 'Accueil',
  'planDuSite.links.about': 'À propos',
  'planDuSite.links.missions': 'Nos missions',
  'planDuSite.links.ethics': 'Déontologie',
  'planDuSite.links.certifications': 'Certifications',
  'planDuSite.links.resources': 'Ressources',
  'planDuSite.links.whitePaper': 'Livre Blanc',
  'planDuSite.links.news': 'Actualités',
  'planDuSite.links.publications': 'Publications',
  'planDuSite.links.partners': 'Partenaires',
  'planDuSite.links.contact': 'Contact',
  'planDuSite.links.foundingMembers': 'Membres fondateurs',
  'planDuSite.links.legalNotices': 'Mentions légales',
  'planDuSite.links.sitemap': 'Plan du site',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('PlanDuSite', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlanDuSite],
      providers: [provideRouter([]), { provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
  });

  it('givenComponent_whenCreated_thenRendersHeadingAndAllRouteLinks', () => {
    const fixture = TestBed.createComponent(PlanDuSite);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Plan du site');
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-page__link');
    expect(links.length).toBe(14);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
    });
  });
});
