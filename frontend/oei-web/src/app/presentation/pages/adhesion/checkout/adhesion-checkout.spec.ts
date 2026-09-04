import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdhesionCheckout } from './adhesion-checkout';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { I18nService } from '../../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'adhesion.checkout.title': 'Finaliser votre adhésion',
  'adhesion.checkout.summaryTitle': 'Récapitulatif',
  'adhesion.checkout.planLabel': 'Formule',
  'adhesion.checkout.methodLabel': 'Moyen de paiement',
  'adhesion.checkout.method.CARD': 'Carte bancaire',
  'adhesion.checkout.method.PAYPAL': 'PayPal',
  'adhesion.checkout.placeholderNotice': "Cette étape est un aperçu de l'interface de paiement.",
  'adhesion.checkout.deferredNotice': 'Le paiement réel sera intégré dans une prochaine étape.',
  'adhesion.checkout.createAccountCta': 'Créer mon compte',
  'adhesion.checkout.goToPaymentCta': 'Aller à ma page de cotisation',
  'adhesion.checkout.backToPlans': 'Retour aux formules',
  'adhesion.checkout.missingSelection': "Aucune formule ou moyen de paiement sélectionné.",
  'membresFondateurs.feeTiers.tiers.2.label': 'Membre fondateur',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithQueryParams(params: Record<string, string>) {
  const paramMap = convertToParamMap(params);
  return { queryParamMap: of(paramMap), snapshot: { queryParamMap: paramMap } };
}

describe('AdhesionCheckout', () => {
  let registerSpy: ReturnType<typeof vi.fn>;

  function configure(routeParams: Record<string, string>, isAuthenticated: boolean) {
    registerSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [AdhesionCheckout],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: ActivatedRoute, useValue: activatedRouteWithQueryParams(routeParams) },
        {
          provide: KeycloakAuthService,
          useValue: { isAuthenticated: () => isAuthenticated, register: registerSpy },
        },
      ],
    });
  }

  it('givenValidTierAndMethod_whenCreated_thenRendersSummaryAndDeferredNotice', () => {
    configure({ tier: 'FOUNDING', method: 'CARD' }, false);
    const fixture = TestBed.createComponent(AdhesionCheckout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Membre fondateur');
    expect(compiled.textContent).toContain('Carte bancaire');
    expect(compiled.textContent).toContain('Le paiement réel sera intégré dans une prochaine étape.');
  });

  it('givenMissingQueryParams_whenCreated_thenRendersMissingSelectionMessageInsteadOfSummary', () => {
    configure({}, false);
    const fixture = TestBed.createComponent(AdhesionCheckout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Aucune formule ou moyen de paiement sélectionné.');
    expect(compiled.querySelector('.oei-adhesion-checkout__summary')).toBeNull();
  });

  it('givenUnauthenticatedVisitor_whenCreated_thenShowsCreateAccountCtaWhichTriggersRegister', () => {
    configure({ tier: 'STUDENT', method: 'PAYPAL' }, false);
    const fixture = TestBed.createComponent(AdhesionCheckout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const createAccountButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Créer mon compte'),
    );
    expect(createAccountButton).toBeDefined();
    createAccountButton?.click();
    expect(registerSpy).toHaveBeenCalled();
  });

  it('givenAuthenticatedMember_whenCreated_thenShowsGoToPaymentPageLinkInsteadOfCreateAccount', () => {
    configure({ tier: 'MEMBER', method: 'CARD' }, true);
    const fixture = TestBed.createComponent(AdhesionCheckout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain('Créer mon compte');
    const link = compiled.querySelector<HTMLAnchorElement>('a[href="/espace-membre/cotisation"]');
    expect(link).not.toBeNull();
  });
});
