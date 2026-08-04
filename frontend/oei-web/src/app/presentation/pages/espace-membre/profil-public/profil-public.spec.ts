import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProfilPublic } from './profil-public';
import { PublicProfileApplicationService } from '../../../../application/service/public-profile-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { createPublicProfile } from '../../../../domain/model/profile/public-profile';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.profilPublic.visibleFieldsIntro': 'Ce profil met en avant les champs suivants :',
  'espaceMembre.profilPublic.publishedAtLabel': 'Publié le',
  'espaceMembre.profilPublic.viewsCountLabel': 'Nombre de vues',
  'espaceMembre.profilPublic.privacyNote': 'Aucun suivi individuel des visiteurs n’est effectué.',
  'espaceMembre.profilPublic.viewQr': 'Voir le QR',
  'espaceMembre.profilPublic.downloadPdf': 'Télécharger le PDF',
  'espaceMembre.profilPublic.share': 'Partager',
  'espaceMembre.profilPublic.shareConfirmation': 'Lien copié dans le presse-papiers.',
  'espaceMembre.profilPublic.notFoundTitle': 'Profil introuvable',
  'espaceMembre.profilPublic.notFound': 'Ce profil public n’existe pas ou n’est plus publié.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithSlug(publicSlug: string) {
  return { paramMap: of(convertToParamMap({ publicSlug })) };
}

describe('ProfilPublic', () => {
  it('givenExistingSlug_whenCreated_thenRendersProfileDetails', async () => {
    const profile = createPublicProfile({
      memberId: 'member-1',
      publicSlug: 'jane-doe',
      visibleFields: ['title', 'summary'],
      seoDescription: 'Experte en cybersécurité.',
      publishedAt: '2026-01-01T00:00:00Z',
      viewsCount: 42,
    });
    TestBed.configureTestingModule({
      imports: [ProfilPublic],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('jane-doe') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: PublicProfileApplicationService, useValue: { getBySlug: () => of(profile) } },
      ],
    });
    const fixture = TestBed.createComponent(ProfilPublic);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('jane-doe');
    expect(compiled.textContent).toContain('title, summary');
    expect(compiled.textContent).toContain('Experte en cybersécurité.');
    expect(compiled.textContent).toContain('42');
    expect(compiled.querySelector('.oei-page__empty')).toBeNull();
  });

  it('givenUnknownSlug_whenCreated_thenRendersNotFoundState', async () => {
    TestBed.configureTestingModule({
      imports: [ProfilPublic],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithSlug('unknown') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: PublicProfileApplicationService, useValue: { getBySlug: () => of(null) } },
      ],
    });
    const fixture = TestBed.createComponent(ProfilPublic);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('n’existe pas');
  });
});
