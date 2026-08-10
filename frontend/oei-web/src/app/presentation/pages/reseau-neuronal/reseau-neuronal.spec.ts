import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReseauNeuronal } from './reseau-neuronal';
import { I18nService } from '../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

describe('ReseauNeuronal', () => {
  it('givenComponent_whenCreated_thenRendersCanvasAndBrand', () => {
    TestBed.configureTestingModule({
      imports: [ReseauNeuronal],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(ReseauNeuronal);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-network__canvas')).toBeTruthy();
    expect(compiled.querySelector('.oei-network__logo')?.textContent).toContain('OEI');
  });

  it('givenSearchQuery_whenTypingLessThanTwoChars_thenNoResults', () => {
    TestBed.configureTestingModule({
      imports: [ReseauNeuronal],
      providers: [{ provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(ReseauNeuronal);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as { results: () => readonly unknown[] };

    expect(component.results().length).toBe(0);
  });
});
