import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AccountRegistrationApplicationService } from './account-registration-application.service';
import { ACCOUNT_REGISTRATION_PORT, AccountRegistrationPort } from '../../domain/port/identity/account-registration.port';
import { Member } from '../../domain/model/identity/member';

describe('AccountRegistrationApplicationService', () => {
  it('givenRegistration_whenRegister_thenDelegatesToPort', async () => {
    const member: Member = {
      id: 'member-1',
      publicSlug: 'demo',
      displayName: 'Demo',
      locale: 'fr',
      country: 'FR',
      createdAt: '2026-01-01T00:00:00Z',
    };
    const register = vi.fn().mockReturnValue(of(member));
    const port: AccountRegistrationPort = { register };
    TestBed.configureTestingModule({
      providers: [AccountRegistrationApplicationService, { provide: ACCOUNT_REGISTRATION_PORT, useValue: port }],
    });
    const service = TestBed.inject(AccountRegistrationApplicationService);

    const registration = { email: 'demo@example.com', locale: 'fr' as const, country: 'FR', consentAccepted: true };
    const result = await firstValueFrom(service.register(registration));

    expect(register).toHaveBeenCalledWith(registration);
    expect(result).toBe(member);
  });
});
