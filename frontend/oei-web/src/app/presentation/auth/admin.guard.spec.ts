import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { adminGuard } from './admin.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

describe('adminGuard', () => {
  function setUp(hasAnyRole: boolean): { router: Router; hasAnyRoleSpy: ReturnType<typeof vi.fn> } {
    const hasAnyRoleSpy = vi.fn().mockReturnValue(hasAnyRole);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: KeycloakAuthService, useValue: { hasAnyRole: hasAnyRoleSpy } }],
    });
    return { router: TestBed.inject(Router), hasAnyRoleSpy };
  }

  it('givenAnyAdminRole_whenGuardEvaluated_thenAllowsActivation', () => {
    const { hasAnyRoleSpy } = setUp(true);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, { url: '/admin' } as never));

    expect(result).toBe(true);
    expect(hasAnyRoleSpy).toHaveBeenCalledWith([
      'SUPER_ADMIN',
      'FOUNDATION_ADMIN',
      'CONTENT_ADMIN',
      'INSTITUTION_ADMIN_OEI',
      'EVENT_ADMIN',
      'MEMBERSHIP_SUPPORT',
      'REVIEWER',
      'AUDITOR_READONLY',
    ]);
  });

  it('givenNoAdminRole_whenGuardEvaluated_thenRedirectsToHome', () => {
    const { router } = setUp(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, { url: '/admin' } as never));

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as never)).toBe('/');
  });
});
