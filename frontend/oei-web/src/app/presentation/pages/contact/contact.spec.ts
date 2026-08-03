import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Contact } from './contact';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'contact.title': 'Contact',
  'contact.bodyPrefix': 'Pour toute question, écrivez-nous à',
  'contact.note': 'Un formulaire de contact dédié est prévu dans une prochaine version du site.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Contact', () => {
  it('givenComponent_whenCreated_thenRendersHeadingMailtoLinkAndFormPlannedNote', () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Contact');
    const link = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(link?.getAttribute('href')).toMatch(/^mailto:/);
    expect(compiled.querySelector('.oei-page__note')?.textContent).toContain('formulaire de contact');
  });
});
