import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actualites } from './actualites';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'actualites.title': 'Actualités',
  'actualites.empty': "Aucune actualité n'a été publiée pour le moment. Revenez bientôt.",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Actualites', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndEmptyStateMessage', () => {
    TestBed.configureTestingModule({
      imports: [Actualites],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(Actualites);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Actualités');
    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune actualité');
  });
});
