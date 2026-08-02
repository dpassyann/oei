import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteFooter } from './site-footer';
import { I18nService } from '../../i18n/i18n.service';

// Real dictionary lookups go through `fetch`, which the unit test environment doesn't
// provide — this fake mirrors the handful of keys the template reads, so tests can assert
// on the rendered wording without depending on network I/O (same pattern as `home.spec.ts`).
const INTERFACE_STRINGS: Record<string, string> = {
  'footer.quote': '« Le numérique est notre bien commun. Les experts informaticiens en sont les gardiens. »',
  'footer.quoteAuthor': '— Ordre des Experts Informaticiens',
  'footer.newsletterHeading': 'Restez informé',
  'footer.newsletterCopy': 'Inscrivez-vous à notre newsletter pour recevoir nos actualités.',
  'footer.emailPlaceholder': 'Votre email',
  'footer.subscribe': "S'inscrire",
  'footer.followUs': 'Suivez-nous',
  'footer.becomeFoundingMember': 'Devenir membre fondateur',
  'footer.orgName': 'Ordre des Experts Informaticiens',
  'nav.legalNotices': 'Mentions légales',
  'nav.sitemap': 'Plan du site',
};

const FAKE_I18N_SERVICE = {
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
};

describe('SiteFooter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([]), { provide: I18nService, useValue: FAKE_I18N_SERVICE }],
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

  it('givenComponent_whenCreated_thenRendersFoundingMembersLink', () => {
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const membershipLink = compiled.querySelector<HTMLAnchorElement>('.oei-footer__membership-link');
    expect(membershipLink?.getAttribute('href')).toBe('/membres-fondateurs');
    expect(membershipLink?.textContent).toContain('Devenir membre fondateur');
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
