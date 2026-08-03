import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MentionsLegales } from './mentions-legales';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'mentionsLegales.title': 'Mentions légales',
  'mentionsLegales.body':
    "L'Ordre des Experts Informaticiens est à ce stade un mouvement — une initiative collective sans personnalité juridique propre. ... en cours de finalisation.",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('MentionsLegales', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndDoesNotAssertConstitutedLegalEntity', () => {
    TestBed.configureTestingModule({
      imports: [MentionsLegales],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(MentionsLegales);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Mentions légales');
    expect(compiled.textContent).toContain('mouvement');
    expect(compiled.textContent).toContain('en cours de finalisation');
  });
});
