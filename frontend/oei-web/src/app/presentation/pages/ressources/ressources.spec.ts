import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Ressources } from './ressources';
import { LEAD_CAPTURE_PORT, LeadCapturePort } from '../../../domain/port/lead-capture.port';

// Widened view of `Ressources` used only to drive its (intentionally protected,
// template-only) form state directly from tests without simulating real DOM input
// events, which are unreliable to await deterministically under zoneless change detection.
interface RessourcesTestHandle {
  readonly email: { set(value: string): void };
  submitDownloadForm(): Promise<void>;
}

describe('Ressources', () => {
  function configureWithPort(port: LeadCapturePort): void {
    TestBed.configureTestingModule({
      imports: [Ressources],
      providers: [provideRouter([]), { provide: LEAD_CAPTURE_PORT, useValue: port }],
    });
  }

  it('givenComponent_whenCreated_thenRendersBothCoverImagesWithSrcAndAlt', () => {
    configureWithPort({ submit: () => Promise.resolve() });
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
    configureWithPort({ submit: () => Promise.resolve() });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const items = compiled.querySelectorAll('.oei-resource-list__item');
    expect(items.length).toBe(5);
    expect(compiled.textContent).toContain('Code de déontologie');
    expect(compiled.textContent).toContain('à venir');
  });

  it('givenValidEmail_whenSubmitDownloadForm_thenShowsSuccessMessage', async () => {
    configureWithPort({ submit: () => Promise.resolve() });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as RessourcesTestHandle;

    component.email.set('jane.doe@example.com');
    await component.submitDownloadForm();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Merci');
    const downloadLink = compiled.querySelector('.oei-download-form__link') as HTMLAnchorElement | null;
    expect(downloadLink?.getAttribute('href')).toBe('/assets/livre-blanc/livre-blanc-oei-v2.pdf');
  });

  it('givenMalformedEmail_whenSubmitDownloadForm_thenShowsErrorMessage', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    configureWithPort({ submit });
    const fixture = TestBed.createComponent(Ressources);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as RessourcesTestHandle;

    component.email.set('not-an-email');
    await component.submitDownloadForm();
    fixture.detectChanges();

    expect(submit).not.toHaveBeenCalled();
    expect(compiled.textContent).toContain('invalide');
  });
});
