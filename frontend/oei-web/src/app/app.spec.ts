import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { NEWSLETTER_SUBSCRIPTION_PORT } from './domain/port/newsletter-subscription.port';
import { MEMBER_PORT } from './domain/port/identity/member.port';
import { KeycloakAuthService } from './presentation/auth/keycloak-auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        // `SiteFooter`/`SiteHeader` (always-rendered chrome, not behind the router-outlet) inject
        // `NewsletterApplicationService`/`MemberApplicationService`, which require these tokens —
        // unlike the routed page ports (e.g. `CONTENT_REPOSITORY_PORT`), they must be available
        // as soon as `App` itself is created.
        { provide: NEWSLETTER_SUBSCRIPTION_PORT, useValue: { subscribe: () => of({ status: 'pendingConfirmation' }) } },
        { provide: MEMBER_PORT, useValue: { getCurrentMember: () => of(null) } },
        // Real `KeycloakAuthService` needs `OAuthService` (angular-oauth2-oidc), which in turn
        // needs a bootstrap-time `configure()`/`loadDiscoveryDocumentAndTryLogin()` call this
        // test doesn't perform — stand in with a plain "not connected" fake instead.
        { provide: KeycloakAuthService, useValue: { isAuthenticated: () => false } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the home page through the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
