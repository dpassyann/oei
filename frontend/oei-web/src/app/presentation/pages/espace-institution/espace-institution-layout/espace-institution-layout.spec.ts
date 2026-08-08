import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EspaceInstitutionLayout } from './espace-institution-layout';
import { I18nService } from '../../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceInstitution.dashboard.title': 'Espace institution',
  'espaceInstitution.nav.dashboard': 'Tableau de bord',
  'espaceInstitution.nav.membres': 'Membres affiliés',
  'espaceInstitution.nav.publications': 'Publications',
  'espaceInstitution.nav.opportunites': 'Opportunités',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

@Component({ selector: 'oei-stub-page', template: '<p>stub</p>' })
class StubPage {}

describe('EspaceInstitutionLayout', () => {
  function configure() {
    TestBed.configureTestingModule({
      imports: [EspaceInstitutionLayout],
      providers: [
        provideRouter([
          { path: 'espace-institution', component: EspaceInstitutionLayout, children: [{ path: '', component: StubPage }] },
        ]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      ],
    });
  }

  it('givenLayout_whenCreated_thenRendersAllFourSectionLinks', async () => {
    configure();
    const fixture = TestBed.createComponent(EspaceInstitutionLayout);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.oei-espace-institution-layout__link')).map(
      (el) => el.textContent?.trim(),
    );

    expect(links).toEqual(['Tableau de bord', 'Membres affiliés', 'Publications', 'Opportunités']);
  });

  it('givenLayout_whenCreated_thenRendersRouterOutletContent', async () => {
    configure();
    const fixture = TestBed.createComponent(EspaceInstitutionLayout);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-espace-institution-layout__content')).toBeTruthy();
  });
});
