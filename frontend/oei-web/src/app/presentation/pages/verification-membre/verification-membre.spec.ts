import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { VerificationMembre } from './verification-membre';
import { WalletApplicationService } from '../../../application/service/wallet-application.service';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'walletVerification.loading': 'Vérification en cours…',
  'walletVerification.verifiedTitle': '✓ Membre OEI vérifié',
  'walletVerification.invalidTitle': 'Vérification impossible',
  'walletVerification.invalidBody': 'Ce lien de vérification est invalide ou a expiré.',
  'walletVerification.memberLabel': 'Membre',
  'walletVerification.statusLabel': 'Statut du pass',
  'walletVerification.tierLabel': "Palier d'adhésion",
  'walletVerification.disclaimer': "L'OEI est un mouvement fondateur, non un ordre professionnel légal.",
  'walletVerification.backToHome': "Retour à l'accueil",
  'walletVerification.status.ISSUED': 'Émis',
  'walletVerification.tier.SILVER': 'Argent',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithToken(token: string) {
  return { paramMap: of(convertToParamMap({ token })) };
}

describe('VerificationMembre', () => {
  it('givenValidToken_whenCreated_thenRendersVerifiedStateWithMemberDetails', async () => {
    TestBed.configureTestingModule({
      imports: [VerificationMembre],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithToken('MOCK-DEMO-VERIFIED') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: WalletApplicationService,
          useValue: {
            verifyPass: () =>
              of({ valid: true, memberPublicSlug: 'demo-jane-dupont', status: 'ISSUED', tier: 'SILVER' }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(VerificationMembre);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Membre OEI vérifié');
    expect(compiled.textContent).toContain('demo-jane-dupont');
    expect(compiled.textContent).toContain('Émis');
    expect(compiled.textContent).toContain('Argent');
    expect(compiled.textContent).toContain('mouvement fondateur');
    expect(compiled.querySelector('.oei-verification-membre__result--invalid')).toBeNull();
  });

  it('givenUnknownToken_whenCreated_thenRendersInvalidStateWithoutCrashing', async () => {
    TestBed.configureTestingModule({
      imports: [VerificationMembre],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithToken('unknown-token') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: WalletApplicationService, useValue: { verifyPass: () => of(null) } },
      ],
    });
    const fixture = TestBed.createComponent(VerificationMembre);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-verification-membre__result--invalid')).not.toBeNull();
    expect(compiled.textContent).toContain('Vérification impossible');
    expect(compiled.querySelector('.oei-verification-membre__result--verified')).toBeNull();
  });

  it('givenRevokedPassToken_whenCreated_thenRendersInvalidStateNotFalsePositive', async () => {
    TestBed.configureTestingModule({
      imports: [VerificationMembre],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithToken('MOCK-APPLE-1') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: WalletApplicationService,
          useValue: {
            verifyPass: () => of({ valid: false, memberPublicSlug: 'demo-jane-dupont', status: 'REVOKED' }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(VerificationMembre);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-verification-membre__result--invalid')).not.toBeNull();
    expect(compiled.querySelector('.oei-verification-membre__result--verified')).toBeNull();
  });
});
