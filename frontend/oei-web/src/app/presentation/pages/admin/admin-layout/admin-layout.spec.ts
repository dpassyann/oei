import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayout } from './admin-layout';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';

describe('AdminLayout', () => {
  function setUp(roles: readonly string[]): void {
    TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [provideRouter([]), { provide: KeycloakAuthService, useValue: { getRoles: () => roles } }],
    });
  }

  it('givenSuperAdmin_whenCreated_thenRendersAllNavEntries', () => {
    setUp(['SUPER_ADMIN']);
    const fixture = TestBed.createComponent(AdminLayout);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.oei-admin__nav-link');
    expect(links.length).toBe(12);
  });

  it('givenEventAdmin_whenCreated_thenOnlyRendersDashboardAndEventsLinks', () => {
    setUp(['EVENT_ADMIN']);
    const fixture = TestBed.createComponent(AdminLayout);
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.oei-admin__nav-link'));
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/admin');
    expect(hrefs).toContain('/actualites');
    expect(hrefs).not.toContain('/admin/institutions');
  });
});
