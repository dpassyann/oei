import { Component, computed, ElementRef, HostListener, inject, PendingTasks, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { MemberApplicationService } from '../../../application/service/member-application.service';

interface NavLink {
  readonly path: string;
  readonly labelKey: string;
}

@Component({
  selector: 'oei-site-header',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcher],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly i18n = inject(I18nService);
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly keycloakAuth = inject(KeycloakAuthService);
  private readonly memberService = inject(MemberApplicationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Reactive, not a one-off check: `KeycloakAuthService.isAuthenticated()` is signal-backed
  // internally, so this `computed` re-evaluates the moment any part of the app calls
  // `setMockSessionRoles`/`clearMockSession` (e.g. after the mocked login/account-creation flow),
  // without requiring a navigation for the header to pick up the change.
  protected readonly isConnected = computed(() => this.keycloakAuth.isAuthenticated());

  protected readonly isDropdownOpen = signal(false);

  private readonly memberResource = rxResource({
    params: () => (this.isConnected() ? {} : undefined),
    stream: () => this.memberService.getCurrentMember(),
  });

  protected readonly memberDisplayName = computed(() =>
    this.memberResource.hasValue() ? this.memberResource.value().displayName : '',
  );

  protected readonly navLinks: readonly NavLink[] = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/a-propos', labelKey: 'nav.about' },
    { path: '/nos-missions', labelKey: 'nav.missions' },
    { path: '/deontologie', labelKey: 'nav.ethics' },
    { path: '/certifications', labelKey: 'nav.certifications' },
    { path: '/ressources', labelKey: 'nav.resources' },
    { path: '/actualites', labelKey: 'nav.news' },
    { path: '/partenaires', labelKey: 'nav.partners' },
    { path: '/contact', labelKey: 'nav.contact' },
  ];

  constructor() {
    // The header/footer render on every route (outside <router-outlet>), so
    // this is the one place guaranteed to run once per app load regardless
    // of which page is opened first — priming the interface strings here
    // (rather than only in the Home page) ensures nav/footer labels never
    // show raw translation keys when a user lands directly on any route.
    void this.pendingTasks.run(async () => {
      try {
        await this.i18n.setLang(this.i18n.currentLang());
      } catch {
        // No i18n server / offline: labels fall back to their raw translation keys.
      }
    });
  }

  // The espace-membre routes are behind `memberSpaceGuard`, which itself calls
  // `keycloakAuth.login()` when the mocked "connected" state is false — so this
  // handler always just navigates and lets the guard decide, rather than
  // duplicating the login-or-not branching here.
  protected goToMemberSpace(): void {
    this.isDropdownOpen.set(false);
    void this.router.navigateByUrl('/espace-membre');
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((open) => !open);
  }

  protected closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  protected onDocumentClick(target: EventTarget | null): void {
    if (this.isDropdownOpen() && target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.isDropdownOpen.set(false);
    }
  }

  protected logout(): void {
    this.keycloakAuth.clearMockSession();
    this.isDropdownOpen.set(false);
    void this.router.navigateByUrl('/');
  }
}
