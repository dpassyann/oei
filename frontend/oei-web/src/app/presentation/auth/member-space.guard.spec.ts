import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { memberSpaceGuard } from './member-space.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

describe('memberSpaceGuard', () => {
  function setup(isAuthenticated: boolean) {
    const loginSpy = vi.fn();
    const fakeService = { isAuthenticated: () => isAuthenticated, login: loginSpy } as unknown as KeycloakAuthService;
    TestBed.configureTestingModule({ providers: [{ provide: KeycloakAuthService, useValue: fakeService }] });
    return { loginSpy };
  }

  it('givenAuthenticated_whenGuardRuns_thenAllowsActivation', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => memberSpaceGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('givenNotAuthenticated_whenGuardRuns_thenTriggersLoginAndBlocksActivation', () => {
    const { loginSpy } = setup(false);
    const result = TestBed.runInInjectionContext(() => memberSpaceGuard({} as never, {} as never));
    expect(result).toBe(false);
    expect(loginSpy).toHaveBeenCalledTimes(1);
  });
});
