import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SiteFooter } from './site-footer';
import { I18nService } from '../../i18n/i18n.service';
import { NEWSLETTER_SUBSCRIPTION_PORT, NewsletterSubscriptionPort } from '../../../domain/port/newsletter-subscription.port';

// Real dictionary lookups go through `fetch`, which the unit test environment doesn't
// provide — this fake mirrors the handful of keys the template reads, so tests can assert
// on the rendered wording without depending on network I/O (same pattern as `home.spec.ts`).
const INTERFACE_STRINGS: Record<string, string> = {
  'footer.quote': '« Le numérique est notre bien commun. Les experts informaticiens en sont les gardiens. »',
  'footer.quoteAuthor': '— Ordre International des Experts de l'Informatique',
  'footer.newsletterHeading': 'Restez informé',
  'footer.newsletterCopy': 'Inscrivez-vous à notre newsletter pour recevoir nos actualités.',
  'footer.emailPlaceholder': 'Votre email',
  'footer.subscribe': "S'inscrire",
  'footer.followUs': 'Suivez-nous',
  'footer.becomeFoundingMember': 'Devenir membre fondateur',
  'footer.orgName': 'Ordre International des Experts de l'Informatique',
  'footer.newsletter.interestsLabel': "Centres d'intérêt",
  'footer.newsletter.interests.cybersecurity': 'Cybersécurité',
  'footer.newsletter.interests.ai': 'Intelligence artificielle',
  'footer.newsletter.interests.ethics': 'Éthique',
  'footer.newsletter.interests.certification': 'Certification',
  'footer.newsletter.interests.governance': 'Gouvernance',
  'footer.newsletter.interests.events': 'Événements',
  'footer.newsletter.consentLabel': "J'accepte de recevoir la newsletter de l'OEI et la politique de confidentialité.",
  'footer.newsletter.successMessage': 'Merci ! Un email de confirmation vous a été envoyé.',
  'footer.newsletter.errors.invalidEmail': 'Adresse email invalide.',
  'footer.newsletter.errors.consentRequired': 'Le consentement est requis pour vous inscrire.',
  'footer.newsletter.errors.submissionFailed': 'Une erreur est survenue, veuillez réessayer.',
  'nav.legalNotices': 'Mentions légales',
  'nav.sitemap': 'Plan du site',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

// Widened view of `SiteFooter` used only to drive its (intentionally protected,
// template-only) newsletter form state directly from tests, same pattern as
// `ressources.spec.ts`'s `RessourcesTestHandle`.
interface SiteFooterTestHandle {
  readonly email: { set(value: string): void };
  readonly consent: { set(value: boolean): void };
  submitNewsletter(): void;
}

describe('SiteFooter', () => {
  function configure(port: NewsletterSubscriptionPort = { subscribe: () => of({ status: 'pendingConfirmation' }) }): void {
    TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: NEWSLETTER_SUBSCRIPTION_PORT, useValue: port },
      ],
    });
  }

  it('givenComponent_whenCreated_thenRendersQuoteNewsletterSocialAndLegalLinks', () => {
    configure();
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
    configure();
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const membershipLink = compiled.querySelector<HTMLAnchorElement>('.oei-footer__membership-link');
    expect(membershipLink?.getAttribute('href')).toBe('/membres-fondateurs');
    expect(membershipLink?.textContent).toContain('Devenir membre fondateur');
  });

  it('givenComponent_whenCreated_thenRendersCopyrightWithCurrentYear', () => {
    configure();
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-footer__copyright')?.textContent).toContain(
      String(new Date().getFullYear()),
    );
  });

  it('givenComponent_whenCreated_thenRendersConsentFieldButNoInterestsPicker', () => {
    configure();
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // V1 keeps the newsletter form simple: email + consent only, no interests picker.
    expect(compiled.querySelector('#newsletter-interests')).toBeNull();
    expect(compiled.querySelector('.oei-footer__newsletter-consent input[type="checkbox"]')).toBeTruthy();
  });

  it('givenValidEmailAndConsent_whenSubmit_thenRendersDoubleOptInSuccessMessage', async () => {
    configure();
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as SiteFooterTestHandle;

    component.email.set('member@example.org');
    component.consent.set(true);
    component.submitNewsletter();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.oei-footer__newsletter-message--success')?.textContent).toContain('confirmation');
  });

  it('givenMissingConsent_whenSubmit_thenRendersConsentRequiredErrorWithoutCallingBackend', async () => {
    let called = false;
    configure({
      subscribe: () => {
        called = true;
        return of({ status: 'pendingConfirmation' });
      },
    });
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as SiteFooterTestHandle;

    component.email.set('member@example.org');
    component.consent.set(false);
    component.submitNewsletter();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.oei-footer__newsletter-message--error')?.textContent).toContain('consentement');
    expect(called).toBe(false);
  });
});
