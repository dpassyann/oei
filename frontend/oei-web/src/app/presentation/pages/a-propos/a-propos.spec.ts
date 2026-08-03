import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APropos } from './a-propos';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'aPropos.title': 'À propos',
  'aPropos.vision.heading': 'Vision',
  'aPropos.vision.body': "Un monde où les professionnels qui conçoivent, développent et exploitent les systèmes numériques...",
  'aPropos.mission.heading': 'Mission',
  'aPropos.mission.body': "Défendre l'intérêt général en promouvant une informatique responsable...",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('APropos', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndVisionMissionCopy', () => {
    TestBed.configureTestingModule({
      imports: [APropos],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(APropos);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('À propos');
    expect(compiled.textContent).toContain('Vision');
    expect(compiled.textContent).toContain('Mission');
  });
});
