import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Deontologie } from './deontologie';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'deontologie.title': 'Déontologie',
  'deontologie.body1':
    "Notre code de déontologie — l'ensemble des règles de conduite professionnelle... Il se distingue de la charte, un engagement volontaire...",
  'deontologie.body2':
    'Ces deux textes seront publiés dès qu\'ils auront été validés par le conseil de gouvernance de l\'organisation.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Deontologie', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndCodeVsCharteDistinction', () => {
    TestBed.configureTestingModule({
      imports: [Deontologie],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(Deontologie);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Déontologie');
    expect(compiled.textContent).toContain('code de déontologie');
    expect(compiled.textContent).toContain('charte');
  });
});
