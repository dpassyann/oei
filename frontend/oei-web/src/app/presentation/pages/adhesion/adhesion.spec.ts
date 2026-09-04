import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Adhesion } from './adhesion';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'adhesion.title': "Choisissez votre formule d'adhésion",
  'adhesion.intro': 'Chaque formule donne accès au même espace membre.',
  'adhesion.honestNote': "Aujourd'hui, l'accès à l'espace membre est identique quel que soit le palier choisi.",
  'adhesion.chooseCta': 'Choisir cette formule',
  'adhesion.modal.title': 'Choisissez votre moyen de paiement',
  'adhesion.modal.selectedPlanPrefix': 'Formule sélectionnée :',
  'adhesion.modal.card': 'Carte bancaire',
  'adhesion.modal.paypal': 'PayPal',
  'adhesion.modal.cancel': 'Annuler',
  'adhesion.modal.closeAria': 'Fermer la fenêtre',
  'membresFondateurs.feeTiers.tiers.0.label': 'Étudiant',
  'membresFondateurs.feeTiers.tiers.0.amount': '20 €',
  'membresFondateurs.feeTiers.tiers.1.label': 'Membre',
  'membresFondateurs.feeTiers.tiers.1.amount': '50 €',
  'membresFondateurs.feeTiers.tiers.2.label': 'Membre fondateur',
  'membresFondateurs.feeTiers.tiers.2.amount': '100 €',
  'membresFondateurs.feeTiers.tiers.3.label': 'Membre soutien',
  'membresFondateurs.feeTiers.tiers.3.amount': '250 €',
};

const ADVANTAGE_LISTS: Record<string, readonly string[]> = {
  'adhesion.plans.STUDENT.advantages': ['Tarif réduit étudiant', "Accès complet à l'espace membre"],
  'adhesion.plans.MEMBER.advantages': ['Statut de membre professionnel', "Accès complet à l'espace membre"],
  'adhesion.plans.FOUNDING.advantages': ['Reconnaissance de membre fondateur', "Accès complet à l'espace membre"],
  'adhesion.plans.SUPPORTER.advantages': ['Niveau de contribution le plus élevé', "Accès complet à l'espace membre"],
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: (key: string) => ADVANTAGE_LISTS[key] ?? [],
};

describe('Adhesion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Adhesion],
      providers: [provideRouter([]), { provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
  });

  it('givenComponent_whenCreated_thenRendersAllFourPlanCardsWithLabelAmountAndAdvantages', () => {
    const fixture = TestBed.createComponent(Adhesion);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.oei-adhesion__plan-card');
    expect(cards.length).toBe(4);

    const text = compiled.textContent ?? '';
    expect(text).toContain('Étudiant');
    expect(text).toContain('20 €');
    expect(text).toContain('Membre fondateur');
    expect(text).toContain('100 €');
    expect(text).toContain('Reconnaissance de membre fondateur');
  });

  it('givenComponent_whenCreated_thenRendersHonestNoteAboutIdenticalTechnicalAccess', () => {
    const fixture = TestBed.createComponent(Adhesion);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain("l'accès à l'espace membre est identique");
  });

  it('givenNoTierChosen_whenCreated_thenModalIsNotRendered', () => {
    const fixture = TestBed.createComponent(Adhesion);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-adhesion-modal')).toBeNull();
  });

  it('givenChooseThisPlanClicked_whenClicked_thenOpensPaymentMethodModalForThatTier', () => {
    const fixture = TestBed.createComponent(Adhesion);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const chooseButtons = compiled.querySelectorAll<HTMLButtonElement>('.oei-adhesion__choose-btn');
    chooseButtons[2].click();
    fixture.detectChanges();

    const modal = compiled.querySelector('.oei-adhesion-modal');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Membre fondateur');
  });

  it('givenModalOpen_whenPaymentMethodConfirmed_thenNavigatesToCheckoutWithTierAndMethod', () => {
    const fixture = TestBed.createComponent(Adhesion);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelectorAll<HTMLButtonElement>('.oei-adhesion__choose-btn')[0].click();
    fixture.detectChanges();

    const cardButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.oei-adhesion-modal__methods button')).find(
      (button) => button.textContent?.includes('Carte bancaire'),
    );
    cardButton?.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/adhesion/finaliser'], {
      queryParams: { tier: 'STUDENT', method: 'CARD' },
    });
  });

  it('givenModalOpen_whenCancelClicked_thenModalCloses', () => {
    const fixture = TestBed.createComponent(Adhesion);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelectorAll<HTMLButtonElement>('.oei-adhesion__choose-btn')[0].click();
    fixture.detectChanges();
    expect(compiled.querySelector('.oei-adhesion-modal')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.oei-adhesion-modal__cancel')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.oei-adhesion-modal')).toBeNull();
  });
});
