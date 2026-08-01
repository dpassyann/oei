import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    });
  });

  it('givenComponent_whenCreated_thenRendersQuoteNewsletterSocialAndLegalLinks', () => {
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-footer__quote')?.textContent).toContain(
      'Le numérique est notre bien commun.',
    );
    expect(compiled.querySelector('.oei-footer__newsletter-input')).toBeTruthy();

    const socialLinks = compiled.querySelectorAll('.oei-footer__social-link');
    expect(socialLinks.length).toBe(4);

    const legalLinks = compiled.querySelectorAll<HTMLAnchorElement>('.oei-footer__legal-link');
    expect(legalLinks.length).toBe(2);
    legalLinks.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    });
  });

  it('givenComponent_whenCreated_thenRendersCopyrightWithCurrentYear', () => {
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-footer__copyright')?.textContent).toContain(
      String(new Date().getFullYear()),
    );
  });
});
