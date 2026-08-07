import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { SiteHeader } from './site-header';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { MemberApplicationService } from '../../../application/service/member-application.service';
import { createMember } from '../../../domain/model/identity/member';

describe('SiteHeader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [
        provideRouter([]),
        // Not connected in these base tests, so this fake is never actually called — but
        // `MemberApplicationService` is injected eagerly in `SiteHeader`'s field initializer
        // regardless of connection state, so it must still be constructible.
        { provide: MemberApplicationService, useValue: { getCurrentMember: () => of(null) } },
        // Real `KeycloakAuthService` needs `OAuthService` (angular-oauth2-oidc) injected — stand
        // in with a plain "not connected" fake, as the guard specs already do.
        {
          provide: KeycloakAuthService,
          useValue: { isAuthenticated: () => false, logout: () => undefined },
        },
      ],
    });
  });

  it('givenComponent_whenCreated_thenRendersTenNavLinksWithNonEmptyRouterLinks', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-nav__link');

    expect(links.length).toBe(10);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    });
  });

  it('givenComponent_whenCreated_thenRendersLanguageSwitcherAndMemberAreaButton', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('oei-language-switcher')).toBeTruthy();
    expect(compiled.querySelector('.oei-cta-member')).toBeTruthy();
  });

  it('givenMemberAreaButton_whenClicked_thenNavigatesToEspaceMembre', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('.oei-cta-member');
    button?.click();

    expect(navigateSpy).toHaveBeenCalledWith('/espace-membre');
  });

  describe('connected state', () => {
    function configureConnected(): void {
      TestBed.configureTestingModule({
        imports: [SiteHeader],
        providers: [
          provideRouter([]),
          {
            provide: KeycloakAuthService,
            useValue: { isAuthenticated: () => true, logout: () => undefined },
          },
          {
            provide: MemberApplicationService,
            useValue: {
              getCurrentMember: () =>
                of(
                  createMember({
                    id: 'm1',
                    publicSlug: 'jane',
                    displayName: 'Jane Dupont (Démonstration)',
                    locale: 'fr',
                    country: 'CH',
                    createdAt: '2026-01-01',
                  }),
                ),
            },
          },
        ],
      });
    }

    it('givenConnectedMember_whenCreated_thenRendersWelcomeDropdownInsteadOfMemberAreaButton', async () => {
      configureConnected();
      const fixture = TestBed.createComponent(SiteHeader);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.oei-cta-member')).toBeNull();
      expect(compiled.querySelector('.oei-member-menu__trigger')?.textContent).toContain(
        'Jane Dupont (Démonstration)',
      );
    });

    it('givenDropdownOpen_whenLogoutClicked_thenClearsSessionAndNavigatesHome', async () => {
      configureConnected();
      const fixture = TestBed.createComponent(SiteHeader);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      const keycloakAuth = TestBed.inject(KeycloakAuthService);
      const logoutSpy = vi.spyOn(keycloakAuth, 'logout');
      const compiled = fixture.nativeElement as HTMLElement;

      compiled.querySelector<HTMLButtonElement>('.oei-member-menu__trigger')?.click();
      fixture.detectChanges();
      compiled.querySelector<HTMLButtonElement>('.oei-member-menu__item--button')?.click();

      expect(logoutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
  });
});
