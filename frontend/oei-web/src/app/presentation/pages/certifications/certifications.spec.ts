import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Certifications } from './certifications';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'certifications.title': 'Certifications',
  'certifications.intro':
    "Nous construisons un cadre de certification indépendante des éditeurs commerciaux de logiciels...",
  'certifications.levels.0': 'Praticien',
  'certifications.levels.1': 'Ingénieur',
  'certifications.levels.2': 'Architecte',
  'certifications.levels.3': 'Expert',
  'certifications.levels.4': 'Expert senior',
  'certifications.levels.5': 'Fellow',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Certifications', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndSixExpertiseLevels', () => {
    TestBed.configureTestingModule({
      imports: [Certifications],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Certifications');
    const levels = compiled.querySelectorAll('.oei-page__level');
    expect(levels.length).toBe(6);
    expect(compiled.textContent).toContain('Fellow');
  });
});
