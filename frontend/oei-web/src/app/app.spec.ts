import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { NEWSLETTER_SUBSCRIPTION_PORT } from './domain/port/newsletter-subscription.port';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        // `SiteFooter` (always-rendered chrome, not behind the router-outlet) injects
        // `NewsletterApplicationService`, which requires this token — unlike the routed page
        // ports (e.g. `CONTENT_REPOSITORY_PORT`), it must be available as soon as `App` itself
        // is created.
        { provide: NEWSLETTER_SUBSCRIPTION_PORT, useValue: { subscribe: () => of({ status: 'pendingConfirmation' }) } },
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
