import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ACCOUNT_REGISTRATION_PORT } from '../../domain/port/identity/account-registration.port';
import { AccountRegistration } from '../../domain/model/identity/account-registration';
import { Member } from '../../domain/model/identity/member';

@Service()
export class AccountRegistrationApplicationService {
  private readonly port = inject(ACCOUNT_REGISTRATION_PORT);

  register(registration: AccountRegistration): Observable<Member> {
    return this.port.register(registration);
  }
}
