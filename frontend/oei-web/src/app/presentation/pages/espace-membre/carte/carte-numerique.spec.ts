import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { CarteNumerique } from './carte-numerique';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { DigitalBusinessCardApplicationService } from '../../../../application/service/digital-business-card-application.service';
import { WalletApplicationService } from '../../../../application/service/wallet-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { createMember, Member } from '../../../../domain/model/identity/member';
import { createMembership, Membership } from '../../../../domain/model/membership/membership';
import { createDigitalBusinessCard, DigitalBusinessCard } from '../../../../domain/model/wallet/digital-business-card';
import { createWalletPass, WalletPass } from '../../../../domain/model/wallet/wallet-pass';
import { createProfessionalProfile, ProfessionalProfile } from '../../../../domain/model/profile/professional-profile';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.carte.title': 'Carte professionnelle numérique',
  'espaceMembre.carte.intro': 'Votre carte de membre numérique, à partager ou ajouter à votre wallet mobile.',
  'espaceMembre.carte.loading': 'Chargement de votre carte…',
  'espaceMembre.carte.qrAlt': 'QR code menant à votre profil public',
  'espaceMembre.carte.downloadVcard': 'Télécharger la vCard',
  'espaceMembre.carte.fullscreen.enter': 'Plein écran',
  'espaceMembre.carte.fullscreen.exit': 'Quitter le plein écran',
  'espaceMembre.carte.share.action': 'Partager',
  'espaceMembre.carte.share.title': 'Ma carte professionnelle OEI',
  'espaceMembre.carte.share.shared': 'Carte partagée.',
  'espaceMembre.carte.share.copied': 'Lien copié dans le presse-papiers.',
  'espaceMembre.carte.share.failed': 'Le partage a échoué.',
  'espaceMembre.carte.tier.STANDARD': 'Standard',
  'espaceMembre.carte.tier.SILVER': 'Argent',
  'espaceMembre.carte.tier.GOLD': 'Or',
  'espaceMembre.carte.tier.FOUNDING': 'Membre fondateur',
  'espaceMembre.carte.tier.HONORARY': 'Honoraire',
  'espaceMembre.carte.tier.INSTITUTIONAL_AFFILIATE': 'Affilié institutionnel',
  'espaceMembre.carte.wallet.title': 'Apple Wallet / Google Wallet',
  'espaceMembre.carte.wallet.disclaimerIntro':
    "Cette fonctionnalité génère un pass de démonstration, sans certificat d'éditeur réel.",
  'espaceMembre.carte.wallet.addApple': 'Ajouter à Apple Wallet',
  'espaceMembre.carte.wallet.addGoogle': 'Ajouter à Google Wallet',
  'espaceMembre.carte.wallet.issueError': "L'ajout au wallet a échoué.",
  'espaceMembre.carte.wallet.mockNotice':
    "Pass de démonstration ajouté (simulation) — ceci n'est pas une pièce d'identité officielle.",
  'espaceMembre.carte.wallet.emptyPasses': "Vous n'avez encore ajouté aucun pass.",
  'espaceMembre.carte.wallet.revoke': 'Révoquer',
  'espaceMembre.carte.wallet.provider.APPLE': 'Apple Wallet',
  'espaceMembre.carte.wallet.provider.GOOGLE': 'Google Wallet',
  'espaceMembre.carte.wallet.passStatus.MOCKED': 'Simulé',
  'espaceMembre.carte.wallet.passStatus.ISSUED': 'Émis',
  'espaceMembre.carte.wallet.passStatus.REVOKED': 'Révoqué',
  'espaceMembre.carte.wallet.passStatus.RENEWED': 'Renouvelé',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

const DEMO_MEMBER: Member = createMember({
  id: 'member-1',
  publicSlug: 'demo-jane-dupont',
  displayName: 'Jane Dupont',
  locale: 'fr',
  country: 'CH',
  createdAt: '2026-01-01T00:00:00.000Z',
});

const DEMO_MEMBERSHIP: Membership = createMembership({
  memberId: 'member-1',
  tier: 'SILVER',
  status: 'ACTIVE',
  startedAt: '2026-01-01T00:00:00.000Z',
});

const DEMO_PROFILE: ProfessionalProfile = createProfessionalProfile({
  memberId: 'member-1',
  title: 'Experte en cybersécurité',
  expertiseAreas: [],
  technologies: [],
  sectors: [],
  languages: [],
  experiences: [],
  educations: [],
  skills: [],
  completenessScore: 40,
});

const DEMO_CARD: DigitalBusinessCard = createDigitalBusinessCard({
  memberId: 'member-1',
  publicSlug: 'demo-jane-dupont',
  qrCodeUrl: '/assets/mock/demo-jane-dupont-qr.svg',
  vCardUrl: '/assets/mock/demo-jane-dupont.vcf',
  theme: 'default',
});

function configure(initialPasses: WalletPass[] = [], issuedPass: WalletPass | 'error' = initialPasses[0]) {
  const passes = [...initialPasses];
  TestBed.configureTestingModule({
    imports: [CarteNumerique],
    providers: [
      { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      { provide: MemberApplicationService, useValue: { getCurrentMember: () => of(DEMO_MEMBER) } },
      { provide: MembershipApplicationService, useValue: { getMembership: () => of(DEMO_MEMBERSHIP) } },
      {
        provide: ProfessionalProfileApplicationService,
        useValue: { getProfile: () => of(DEMO_PROFILE) },
      },
      {
        provide: DigitalBusinessCardApplicationService,
        useValue: { generateCard: () => of(DEMO_CARD) },
      },
      {
        provide: WalletApplicationService,
        useValue: {
          listPasses: () => of([...passes]),
          issueApplePass: () => {
            if (issuedPass === 'error') {
              return new Observable<WalletPass>((subscriber) => subscriber.error(new Error('issue failed')));
            }
            passes.push(issuedPass);
            return of(issuedPass);
          },
          issueGooglePass: () => {
            if (issuedPass === 'error') {
              return new Observable<WalletPass>((subscriber) => subscriber.error(new Error('issue failed')));
            }
            passes.push(issuedPass);
            return of(issuedPass);
          },
          revokePass: (id: string) => {
            const index = passes.findIndex((pass) => pass.id === id);
            const revoked = createWalletPass({ ...(passes[index] as WalletPass), status: 'REVOKED' });
            passes[index] = revoked;
            return of(revoked);
          },
        },
      },
    ],
  });
}

describe('CarteNumerique', () => {
  it('givenMemberAndCard_whenCreated_thenRendersNameTierAndQrImage', async () => {
    configure([]);
    const fixture = TestBed.createComponent(CarteNumerique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Jane Dupont');
    expect(compiled.textContent).toContain('Experte en cybersécurité');
    expect(compiled.textContent).toContain('Argent');
    // A real, scannable QR is now generated client-side by `StyledQr` (canvas-rendered) rather
    // than an `<img>` pointing at the mock's static SVG placeholder.
    const styledQrCanvas = compiled.querySelector('.oei-carte-numerique__qr-area oei-styled-qr canvas');
    expect(styledQrCanvas).not.toBeNull();
    const vcard = compiled.querySelector<HTMLAnchorElement>('.oei-carte-numerique__action[download]');
    expect(vcard?.getAttribute('href')).toBe('/assets/mock/demo-jane-dupont.vcf');
  });

  it('givenNoPassesYet_whenCreated_thenRendersHonestEmptyState', async () => {
    configure([]);
    const fixture = TestBed.createComponent(CarteNumerique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain(
      "Vous n'avez encore ajouté aucun pass",
    );
    expect(compiled.querySelector('.oei-carte-numerique__pass-list')).toBeNull();
  });

  it('givenSuccessfulApplePassIssue_whenClicked_thenShowsUnmistakableMockDisclaimer', async () => {
    const issued = createWalletPass({
      id: 'pass-1',
      memberId: 'member-1',
      provider: 'APPLE',
      status: 'MOCKED',
      serialNumber: 'MOCK-APPLE-1',
      issuedAt: '2026-03-01T00:00:00.000Z',
    });
    configure([], issued);
    const fixture = TestBed.createComponent(CarteNumerique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(compiled.querySelectorAll('.oei-carte-numerique__wallet-buttons button'));
    const appleButton = buttons.find((button) => button.textContent?.includes('Ajouter à Apple Wallet'));
    (appleButton as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    const notice = compiled.querySelector('.oei-carte-numerique__wallet-mock-notice');
    expect(notice?.textContent).toContain("ceci n'est pas une pièce d'identité officielle");
  });

  it('givenIssuedPass_whenRevokeClicked_thenCallsRevokeAndRefreshesList', async () => {
    const existingPass = createWalletPass({
      id: 'pass-2',
      memberId: 'member-1',
      provider: 'GOOGLE',
      status: 'MOCKED',
      serialNumber: 'MOCK-GOOGLE-1',
      issuedAt: '2026-03-01T00:00:00.000Z',
    });
    configure([existingPass]);
    const fixture = TestBed.createComponent(CarteNumerique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const revokeButton = compiled.querySelector<HTMLButtonElement>('.oei-carte-numerique__pass-revoke');
    expect(revokeButton).not.toBeNull();
    revokeButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusEl = compiled.querySelector('.oei-carte-numerique__pass-status');
    expect(statusEl?.textContent).toContain('Révoqué');
  });

  it('givenFullScreenToggle_whenClicked_thenTogglesFullScreenClass', async () => {
    configure([]);
    const fixture = TestBed.createComponent(CarteNumerique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(compiled.querySelectorAll('.oei-carte-numerique__actions button'));
    const fullscreenButton = buttons.find((button) => button.textContent?.includes('Plein écran'));
    expect(compiled.querySelector('.oei-carte-numerique__card--fullscreen')).toBeNull();

    (fullscreenButton as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelector('.oei-carte-numerique__card--fullscreen')).not.toBeNull();
  });
});
