import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { institutionAccessGuard } from './institution-access.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

describe('institutionAccessGuard', () => {
  function run(keycloakAuth: Partial<KeycloakAuthService>): boolean {
    TestBed.configureTestingModule({ providers: [{ provide: KeycloakAuthService, useValue: keycloakAuth }] });
    const injector = TestBed.inject(Injector);
    return runInInjectionContext(injector, () => institutionAccessGuard({} as never, {} as never)) as boolean;
  }

  it('givenAuthenticated_whenGuardRuns_thenAllowsActivation', () => {
    const result = run({ isAuthenticated: () => true, login: () => undefined });
    expect(result).toBe(true);
  });

  it('givenNotAuthenticated_whenGuardRuns_thenRedirectsToLoginAndBlocksActivation', () => {
    let loginCalled = false;
    const result = run({ isAuthenticated: () => false, login: () => (loginCalled = true) });
    expect(result).toBe(false);
    expect(loginCalled).toBe(true);
  });
});
