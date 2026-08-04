import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { cmsGuard } from './cms.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

describe('cmsGuard', () => {
  function setUp(hasAnyRole: boolean): { router: Router } {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: KeycloakAuthService, useValue: { hasAnyRole: vi.fn().mockReturnValue(hasAnyRole) } }],
    });
    return { router: TestBed.inject(Router) };
  }

  it('givenMemberOrAdminRole_whenGuardEvaluated_thenAllowsActivation', () => {
    setUp(true);

    const result = TestBed.runInInjectionContext(() => cmsGuard({} as never, { url: '/cms' } as never));

    expect(result).toBe(true);
  });

  it('givenNoRole_whenGuardEvaluated_thenRedirectsToHome', () => {
    const { router } = setUp(false);

    const result = TestBed.runInInjectionContext(() => cmsGuard({} as never, { url: '/cms' } as never));

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as never)).toBe('/');
  });
});
