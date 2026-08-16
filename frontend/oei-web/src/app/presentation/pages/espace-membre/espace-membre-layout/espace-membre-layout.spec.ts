import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { EspaceMembreLayout } from './espace-membre-layout';
import { I18nService } from '../../../i18n/i18n.service';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { Membership, MembershipStatus } from '../../../../domain/model/membership/membership';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.nav.title': 'Mon espace',
  'espaceMembre.nav.profil': 'Profil',
  'espaceMembre.nav.cv': 'CV',
  'espaceMembre.nav.badges': 'Badges',
  'espaceMembre.nav.carte': 'Carte numérique',
  'espaceMembre.nav.cotisation': 'Cotisation',
  'espaceMembre.nav.publier': 'Publier un article',
  'espaceMembre.nav.proposerEvenement': 'Proposer un événement',
  'espaceMembre.cotisationBanner.message': "Votre cotisation n'est pas à jour : certaines fonctionnalités sont limitées.",
  'espaceMembre.cotisationBanner.action': 'Régulariser ma cotisation',
};

function membershipFixture(status: MembershipStatus = 'ACTIVE'): Membership {
  return { memberId: 'demo-member-1', tier: 'SILVER', status, startedAt: '2026-01-01T00:00:00Z' };
}

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('EspaceMembreLayout', () => {
  function configure(membershipStatus: MembershipStatus = 'ACTIVE') {
    TestBed.configureTestingModule({
      imports: [EspaceMembreLayout],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        provideRouter([]),
        {
          provide: MemberApplicationService,
          useValue: { getCurrentMember: () => of({ displayName: 'Ada Lovelace' }) },
        },
        {
          provide: ProfessionalProfileApplicationService,
          useValue: { getProfile: () => of({ title: 'Platform Architect' }) },
        },
        {
          provide: MembershipApplicationService,
          useValue: { getMembership: () => of(membershipFixture(membershipStatus)) },
        },
      ],
    });
  }

  it('whenRendered_thenListsAllSubRoutesInTheMenu', () => {
    configure();
    const fixture = TestBed.createComponent(EspaceMembreLayout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.oei-espace-membre-nav__link'));

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Profil',
      'CV',
      'Badges',
      'Carte numérique',
      'Cotisation',
      'Publier un article',
      'Proposer un événement',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/espace-membre/profil',
      '/espace-membre/cv',
      '/espace-membre/badges',
      '/espace-membre/carte',
      '/espace-membre/cotisation',
      '/espace-membre/publier',
      '/espace-membre/proposer-evenement',
    ]);
  });

  it('whenRendered_thenHasARouterOutletForTheActiveSubPage', () => {
    configure();
    const fixture = TestBed.createComponent(EspaceMembreLayout);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('givenActiveMembership_whenRendered_thenHidesCotisationBanner', async () => {
    configure('ACTIVE');
    const fixture = TestBed.createComponent(EspaceMembreLayout);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-espace-membre-cotisation-banner')).toBeNull();
  });

  it.each(['PENDING', 'SUSPENDED', 'EXPIRED'] as const)(
    'given%sMembership_whenRendered_thenShowsCotisationBannerWithLinkToCotisation',
    async (status) => {
      configure(status);
      const fixture = TestBed.createComponent(EspaceMembreLayout);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const banner = compiled.querySelector('.oei-espace-membre-cotisation-banner');
      expect(banner).toBeTruthy();
      expect(banner?.querySelector('a')?.getAttribute('href')).toBe('/espace-membre/cotisation');
    },
  );
});
