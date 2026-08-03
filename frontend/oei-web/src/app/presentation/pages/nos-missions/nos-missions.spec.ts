import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NosMissions } from './nos-missions';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'nosMissions.title': 'Nos missions',
  'nosMissions.intro': 'Nous lançons ce mouvement pour :',
};

const LIST_STRINGS: Record<string, readonly string[]> = {
  'nosMissions.commitments': [
    "Définir ce qu'est un expert informaticien, par niveau de compétence et de responsabilité.",
    'Proposer un code de déontologie commun, inspiré des professions à haute responsabilité.',
    "Construire, avec des partenaires académiques, un cadre de certification indépendant des éditeurs commerciaux.",
    'Défendre une exigence de formation continue tout au long de la carrière.',
    "Documenter et publier l'état réel de la profession — rémunérations, tendances, ruptures technologiques.",
    'Devenir un interlocuteur crédible des universités, des entreprises et, à terme, des pouvoirs publics.',
  ],
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: (key: string) => LIST_STRINGS[key] ?? [],
};

describe('NosMissions', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndSixCommitments', () => {
    TestBed.configureTestingModule({
      imports: [NosMissions],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(NosMissions);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Nos missions');
    const items = compiled.querySelectorAll('.oei-page__list-item');
    expect(items.length).toBe(6);
  });
});
