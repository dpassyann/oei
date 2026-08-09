import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { EspaceMembreLayout } from './espace-membre-layout';
import { I18nService } from '../../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.nav.title': 'Mon espace',
  'espaceMembre.nav.profil': 'Profil',
  'espaceMembre.nav.cv': 'CV',
  'espaceMembre.nav.badges': 'Badges',
  'espaceMembre.nav.carte': 'Carte numérique',
  'espaceMembre.nav.cotisation': 'Cotisation',
  'espaceMembre.nav.publier': 'Publier un article',
  'espaceMembre.nav.proposerEvenement': 'Proposer un événement',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('EspaceMembreLayout', () => {
  function configure() {
    TestBed.configureTestingModule({
      imports: [EspaceMembreLayout],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }, provideRouter([])],
    });
  }

  it('whenRendered_thenListsAllSubRoutesInTheMenu', () => {
    configure();
    const fixture = TestBed.createComponent(EspaceMembreLayout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.oei-espace-membre-nav__link'));

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Profil',
      'CV',
      'Badges',
      'Carte numérique',
      'Cotisation',
      'Publier un article',
      'Proposer un événement',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/espace-membre/profil',
      '/espace-membre/cv',
      '/espace-membre/badges',
      '/espace-membre/carte',
      '/espace-membre/cotisation',
      '/espace-membre/publier',
      '/espace-membre/proposer-evenement',
    ]);
  });

  it('whenRendered_thenHasARouterOutletForTheActiveSubPage', () => {
    configure();
    const fixture = TestBed.createComponent(EspaceMembreLayout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
