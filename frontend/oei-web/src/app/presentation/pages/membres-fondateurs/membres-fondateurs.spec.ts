import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MembresFondateurs } from './membres-fondateurs';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const FOUNDER_INTRO_MARKDOWN = [
  '## Rejoindre l\'OEI au moment où tout commence',
  '',
  'Un mouvement se juge à qui le rejoint avant qu\'il n\'ait fait la preuve de son succès.',
].join('\n');

function fakeMarkdownDocuments() {
  return {
    getMarkdownDocument: () =>
      of(
        createDocument({
          slug: 'membres-fondateurs-intro',
          lang: 'fr',
          title: '',
          body: FOUNDER_INTRO_MARKDOWN,
          isFallback: false,
        }),
      ),
  };
}

const INTERFACE_STRINGS: Record<string, string> = {
  'membresFondateurs.title': 'Membres fondateurs',
  'membresFondateurs.intro':
    "L'Ordre International des Experts de l'Informatique n'est pas un livre à acheter — c'est un mouvement à soutenir.",
  'membresFondateurs.feeTiers.title': 'Cotisations',
  'membresFondateurs.feeTiers.categoryHeader': 'Catégorie',
  'membresFondateurs.feeTiers.annualFeeHeader': 'Cotisation annuelle',
  'membresFondateurs.feeTiers.tiers.0.label': 'Étudiant',
  'membresFondateurs.feeTiers.tiers.0.amount': '20 €',
  'membresFondateurs.feeTiers.tiers.1.label': 'Membre',
  'membresFondateurs.feeTiers.tiers.1.amount': '50 €',
  'membresFondateurs.feeTiers.tiers.2.label': 'Membre fondateur',
  'membresFondateurs.feeTiers.tiers.2.amount': '100 €',
  'membresFondateurs.feeTiers.tiers.3.label': 'Membre soutien',
  'membresFondateurs.feeTiers.tiers.3.amount': '250 €',
  'membresFondateurs.foundingStatus.message':
    'Mouvement en cours de constitution — soyez parmi les premiers membres fondateurs.',
  'membresFondateurs.foundingStatus.note':
    "Découvrez nos formules d'adhésion ci-dessous et choisissez celle qui vous convient. Le paiement en ligne complet arrive bientôt ; en attendant, contactez-nous pour manifester votre intérêt à soutenir le mouvement.",
  'membresFondateurs.foundingStatus.cta': 'Soutenir le mouvement',
  'membresFondateurs.foundingStatus.contactPrefix': 'Ou écrivez-nous directement à',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('MembresFondateurs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MembresFondateurs],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
      ],
    });
  });

  it('givenFounderIntroDocumentLoads_whenCreated_thenRendersItAboveTheFeeTiers', async () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-founder-intro')?.textContent).toContain(
      "Un mouvement se juge à qui le rejoint",
    );
  });

  it('givenComponent_whenCreated_thenRendersHeadingAndAllFourFeeTiers', async () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Membres fondateurs');

    const rows = compiled.querySelectorAll('.oei-fee-tiers__row');
    expect(rows.length).toBe(4);

    const rowText = compiled.querySelector('.oei-fee-tiers__table')?.textContent ?? '';
    expect(rowText).toContain('Étudiant');
    expect(rowText).toContain('20 €');
    expect(rowText).toContain('Membre fondateur');
    expect(rowText).toContain('100 €');
    expect(rowText).toContain('Membre soutien');
    expect(rowText).toContain('250 €');
  });

  it('givenComponent_whenCreated_thenRendersHonestZeroStateAndNoFabricatedMemberCount', () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('Mouvement en cours de constitution');
    expect(text).toContain('soyez parmi les premiers membres fondateurs');

    // Guards against reintroducing a fabricated headline number (e.g. "47 membres
    // fondateurs" from external advice, never real data): no digit-led member-count
    // phrase should ever render on this page, since there is no backend to source one.
    expect(text).not.toMatch(/\d+\s*(membres?|adhérents?)\b/i);
  });

  it('givenComponent_whenCreated_thenFramesCopyAsSupportingAMovementNotBuyingABook', () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text.toLowerCase()).toContain('mouvement');
    expect(text.toLowerCase()).not.toContain('achetez');
    expect(text.toLowerCase()).not.toContain('acheter le livre');
  });

  it('givenComponent_whenCreated_thenRendersAdhesionCtaAndMailtoWithPaymentComingSoonNote', () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cta = compiled.querySelector<HTMLAnchorElement>('.oei-cta-join');
    expect(cta?.getAttribute('href')).toBe('/adhesion');

    const mailtoLink = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(mailtoLink?.getAttribute('href')).toMatch(/^mailto:/);

    expect(compiled.textContent).toContain('Le paiement en ligne complet arrive bientôt');
  });
});
