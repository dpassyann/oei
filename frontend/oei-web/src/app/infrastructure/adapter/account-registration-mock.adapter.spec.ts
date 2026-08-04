import { firstValueFrom } from 'rxjs';
import { AccountRegistrationMockAdapter } from './account-registration-mock.adapter';

describe('AccountRegistrationMockAdapter', () => {
  it('givenRegistration_whenRegister_thenReturnsNewFreeMemberWithNoMembershipYet', async () => {
    const adapter = new AccountRegistrationMockAdapter();
    const member = await firstValueFrom(
      adapter.register({ email: 'jane.doe@example.com', locale: 'fr', country: 'FR', consentAccepted: true }),
    );
    expect(member.locale).toBe('fr');
    expect(member.country).toBe('FR');
    expect(member.membership).toBeUndefined();
    expect(member.id).toBeTruthy();
  });

  it('givenDifferentRegistrations_whenRegisterTwice_thenReturnsDistinctMemberIds', async () => {
    const adapter = new AccountRegistrationMockAdapter();
    const first = await firstValueFrom(
      adapter.register({ email: 'a@example.com', locale: 'en', country: 'US', consentAccepted: true }),
    );
    const second = await firstValueFrom(
      adapter.register({ email: 'b@example.com', locale: 'en', country: 'US', consentAccepted: true }),
    );
    expect(first.id).not.toBe(second.id);
  });
});
