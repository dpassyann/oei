import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CartePublique } from './carte-publique';
import { DigitalBusinessCardApplicationService } from '../../../application/service/digital-business-card-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDigitalBusinessCard } from '../../../domain/model/wallet/digital-business-card';

const INTERFACE_STRINGS: Record<string, string> = {
  'cardPublic.loading': 'Chargement de la carte…',
  'cardPublic.notFoundTitle': 'Carte introuvable',
  'cardPublic.notFound': "Cette carte professionnelle numérique n'existe pas ou n'est plus publiée.",
  'cardPublic.demoNotice': 'Carte de démonstration.',
  'cardPublic.viewProfile': 'Voir le profil OEI',
  'cardPublic.viewCv': 'Voir le CV',
  'cardPublic.downloadVcard': 'Télécharger la vCard',
  'cardPublic.qrAlt': 'QR code menant au profil public',
  'cardPublic.qrExpand': 'Agrandir le QR code',
  'cardPublic.qrModalClose': 'Fermer',
  'cardPublic.certificationsTitle': 'Certifications',
  'cardPublic.badgesTitle': 'Badges',
  'cardPublic.socialLinksTitle': 'Liens',
  'cardPublic.share.action': 'Partager cette carte',
  'cardPublic.share.title': 'Carte professionnelle OEI',
  'cardPublic.share.shared': 'Carte partagée.',
  'cardPublic.share.copied': 'Lien copié dans le presse-papiers.',
  'cardPublic.share.failed': 'Le partage a échoué.',
  'cardPublic.tier.SILVER': 'Argent',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithSlug(slug: string) {
  return { paramMap: of(convertToParamMap({ slug })) };
}

describe('CartePublique', () => {
  it('givenExistingSlug_whenCreated_thenRendersPublicDisplayFields', async () => {
    const card = createDigitalBusinessCard({
      memberId: 'member-1',
      publicSlug: 'jane-doe',
      qrCodeUrl: '/qr.svg',
      vCardUrl: '/card.vcf',
      displayName: 'Jane Doe',
      title: 'Experte en cybersécurité',
      tier: 'SILVER',
      certifications: ['AWS Certified Solutions Architect'],
      badges: [{ code: 'MEMBER', name: 'Membre' }],
      socialLinks: { linkedin: 'https://linkedin.com/in/jane-doe' },
    });
    TestBed.configureTestingModule({
      imports: [CartePublique],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('jane-doe') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: DigitalBusinessCardApplicationService, useValue: { getPublicCard: () => of(card) } },
      ],
    });
    const fixture = TestBed.createComponent(CartePublique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Jane Doe');
    expect(compiled.textContent).toContain('Experte en cybersécurité');
    expect(compiled.textContent).toContain('Argent');
    expect(compiled.textContent).toContain('AWS Certified Solutions Architect');
    expect(compiled.textContent).toContain('Membre');
    const linkedin = compiled.querySelector<HTMLAnchorElement>('.oei-carte-publique__social-link');
    expect(linkedin?.getAttribute('href')).toBe('https://linkedin.com/in/jane-doe');
    const profileLink = compiled.querySelector<HTMLAnchorElement>('a[href="/membres/jane-doe"]');
    expect(profileLink).not.toBeNull();
  });

  it('givenUnknownSlug_whenCreated_thenRendersNotFoundState', async () => {
    TestBed.configureTestingModule({
      imports: [CartePublique],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('unknown') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: DigitalBusinessCardApplicationService, useValue: { getPublicCard: () => of(null) } },
      ],
    });
    const fixture = TestBed.createComponent(CartePublique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain("n'existe pas");
  });

  it('givenQrTapped_whenClicked_thenOpensFullScreenModal', async () => {
    const card = createDigitalBusinessCard({
      memberId: 'member-1',
      publicSlug: 'jane-doe',
      qrCodeUrl: '/qr.svg',
      displayName: 'Jane Doe',
    });
    TestBed.configureTestingModule({
      imports: [CartePublique],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('jane-doe') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: DigitalBusinessCardApplicationService, useValue: { getPublicCard: () => of(card) } },
      ],
    });
    const fixture = TestBed.createComponent(CartePublique);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-carte-publique__qr-modal-backdrop')).toBeNull();
    compiled.querySelector<HTMLButtonElement>('.oei-carte-publique__qr-area')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.oei-carte-publique__qr-modal-backdrop')).not.toBeNull();
  });
});
