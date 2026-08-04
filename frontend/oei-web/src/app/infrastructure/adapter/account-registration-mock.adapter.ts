import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccountRegistrationPort } from '../../domain/port/identity/account-registration.port';
import { AccountRegistration } from '../../domain/model/identity/account-registration';
import { createMember, Member } from '../../domain/model/identity/member';

@Service()
export class AccountRegistrationMockAdapter implements AccountRegistrationPort {
  register(registration: AccountRegistration): Observable<Member> {
    // Mocked, honest demo behaviour: a brand-new account has no membership yet (it is
    // created free of charge — see `AccountRegistration` doc comment) and no legal name
    // beyond what was captured at this step.
    const member = createMember({
      id: crypto.randomUUID(),
      publicSlug: `nouveau-membre-${Date.now()}`,
      displayName: registration.email.split('@')[0] || 'Nouveau membre',
      locale: registration.locale,
      country: registration.country,
      createdAt: new Date().toISOString(),
    });
    return of(member);
  }
}
