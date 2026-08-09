import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  PendingTasks,
  signal,
} from '@angular/core';
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

  // `KeycloakAuthService.isAuthenticated()` reflects the real `OAuthService.hasValidAccessToken()`
  // (not a signal). Wrapping it in `computed` still lets the template re-render on the next
  // change-detection pass after the app-initializer's token exchange resolves or after `logout()`,
  // without this component needing to know about that timing itself.
  protected readonly isConnected = computed(() => this.keycloakAuth.isAuthenticated());

  // Mirrors exactly the role check `cms.guard.ts` enforces on `/cms` — shown only so a member/
  // admin actually has a way to reach the CMS at all (there was previously no link anywhere
  // in the UI to it, only the guarded route itself, reachable only by typing the URL).
  protected readonly canAccessCms = computed(() => this.keycloakAuth.hasAnyRole(['member', 'admin']));

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
    { path: '/actualites', labelKey: 'nav.news' },
    { path: '/partenaires', labelKey: 'nav.partners' },
    { path: '/contact', labelKey: 'nav.contact' },
    // Appended at the end rather than reordered in among the pre-existing links, per this
    // task's anti-conflict constraint (other agents also touch this array in parallel).
    { path: '/events', labelKey: 'nav.events' },
  ];

  // "Ressources" is a dropdown (not a flat nav link) precisely so that /livre-blanc — one of
  // several resources, not a standalone top-level destination — lives inside it rather than
  // crowding the top-level nav with its own entry.
  protected readonly resourceLinks: readonly NavLink[] = [
    { path: '/ressources', labelKey: 'nav.resources' },
    { path: '/livre-blanc', labelKey: 'nav.whitePaper' },
  ];

  protected readonly isResourcesMenuOpen = signal(false);

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

  protected toggleResourcesMenu(): void {
    this.isResourcesMenuOpen.update((open) => !open);
  }

  protected closeResourcesMenu(): void {
    this.isResourcesMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  protected onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof Node) || this.elementRef.nativeElement.contains(target)) {
      return;
    }
    if (this.isDropdownOpen()) {
      this.isDropdownOpen.set(false);
    }
    if (this.isResourcesMenuOpen()) {
      this.isResourcesMenuOpen.set(false);
    }
  }

  protected logout(): void {
    this.keycloakAuth.logout();
    this.isDropdownOpen.set(false);
    void this.router.navigateByUrl('/');
  }
}
