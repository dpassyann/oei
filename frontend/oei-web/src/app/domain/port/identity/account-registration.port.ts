import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountRegistration } from '../../model/identity/account-registration';
import { Member } from '../../model/identity/member';

export interface AccountRegistrationPort {
  /** Creates a free member account (see `AccountRegistration` doc comment) and returns the
   * newly created `Member` — mirrors `POST /api/public/v1/accounts` (tag `public-accounts`). */
  register(registration: AccountRegistration): Observable<Member>;
}

export const ACCOUNT_REGISTRATION_PORT = new InjectionToken<AccountRegistrationPort>('AccountRegistrationPort');
