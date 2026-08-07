import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Ressources } from './ressources';
import { LEAD_CAPTURE_PORT, LeadCapturePort } from '../../../domain/port/lead-capture.port';
import { I18nService } from '../../i18n/i18n.service';

// Widened view of `Ressources` used only to drive its (intentionally protected,
// template-only) form state directly from tests without simulating real DOM input
// events, which are unreliable to await deterministically under zoneless change detection.
interface RessourcesTestHandle {
  readonly email: { set(value: string): void };
  submitDownloadForm(): void;
}

const INTERFACE_STRINGS: Record<string, string> = {
  'ressources.title': 'Ressources',
  'ressources.livreBlanc.title': 'Livre Blanc',
  'ressources.livreBlanc.frontCoverAlt': "Couverture du Livre Blanc de l'Ordre des Experts Informaticiens",
  'ressources.livreBlanc.backCoverAlt': "Quatrième de couverture du Livre Blanc de l'Ordre des Experts Informaticiens",
  'ressources.livreBlanc.successPrefix': 'Merci — voici votre exemplaire :',
  'ressources.livreBlanc.downloadLinkText': 'télécharger le Livre Blanc (PDF)',
  'ressources.livreBlanc.emailLabel': 'Adresse e-mail',
  'ressources.livreBlanc.emailPlaceholder': 'vous@exemple.com',
  'ressources.livreBlanc.submitButton': 'Recevoir le PDF gratuitement',
  'ressources.livreBlanc.errorMessage': 'Adresse e-mail invalide ou envoi impossible pour le moment — merci de réessayer.',
  'ressources.resourceList.title': 'Nos ressources',
  'ressources.resourceList.pendingBadge': 'à venir',
  'ressources.resourceList.items.deontologie.label': 'Code de déontologie',
  'ressources.resourceList.items.referentiel.label': 'Référentiel de compétences',
  'ressources.resourceList.items.livreBlanc.label': 'Livre Blanc',
  'ressources.resourceList.items.positions.label': 'Mentions & Positions',
  'ressources.resourceList.items.rapports.label': 'Rapports & Études',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Ressources', () => {
  function configureWithPort(port: LeadCapturePort): void {
    TestBed.configureTestingModule({
      imports: [Ressources],
      providers: [
        provideRouter([]),
        { provide: LEAD_CAPTURE_PORT, useValue: port },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      ],
    });
  }

  it('givenComponent_whenCreated_thenRendersBothCoverImagesWithSrcAndAlt', () => {
    configureWithPort({ submit: () => of(undefined) });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const images = compiled.querySelectorAll<HTMLImageElement>('.oei-livre-blanc__cover');
    expect(images.length).toBe(2);
    images.forEach((img) => {
      expect(img.getAttribute('src')).toMatch(/^\/assets\/livre-blanc\/.+\.svg$/);
      expect(img.getAttribute('alt')?.trim()).toBeTruthy();
    });
  });

  it('givenComponent_whenCreated_thenRendersResourceListWithFiveEntries', () => {
    configureWithPort({ submit: () => of(undefined) });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const items = compiled.querySelectorAll('.oei-resource-list__item');
    expect(items.length).toBe(5);
    expect(compiled.textContent).toContain('Code de déontologie');
    expect(compiled.textContent).toContain('à venir');
  });

  it('givenValidEmail_whenSubmitDownloadForm_thenShowsSuccessMessage', async () => {
    configureWithPort({ submit: () => of(undefined) });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as RessourcesTestHandle;

    component.email.set('jane.doe@example.com');
    component.submitDownloadForm();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Merci');
    const downloadLink = compiled.querySelector('.oei-download-form__link') as HTMLAnchorElement | null;
    expect(downloadLink?.getAttribute('href')).toBe('/assets/livre-blanc/livre-blanc-oei.pdf');
  });

  it('givenMalformedEmail_whenSubmitDownloadForm_thenShowsErrorMessage', async () => {
    const submit = vi.fn().mockReturnValue(of(undefined));
    configureWithPort({ submit });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as RessourcesTestHandle;

    component.email.set('not-an-email');
    component.submitDownloadForm();
    fixture.detectChanges();

    expect(submit).not.toHaveBeenCalled();
    expect(compiled.textContent).toContain('invalide');
  });
});
