import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MembresFondateurs } from './membres-fondateurs';

describe('MembresFondateurs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MembresFondateurs],
      providers: [provideRouter([])],
    });
  });

  it('givenComponent_whenCreated_thenRendersHeadingAndAllFourFeeTiers', () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
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

  it('givenComponent_whenCreated_thenRendersContactCtaAndMailtoWithFormComingSoonNote', () => {
    const fixture = TestBed.createComponent(MembresFondateurs);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cta = compiled.querySelector<HTMLAnchorElement>('.oei-cta-join');
    expect(cta?.getAttribute('href')).toBe('/contact');

    const mailtoLink = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(mailtoLink?.getAttribute('href')).toMatch(/^mailto:/);

    expect(compiled.textContent).toContain("formulaire d'adhésion en ligne arrive bientôt");
  });
});
