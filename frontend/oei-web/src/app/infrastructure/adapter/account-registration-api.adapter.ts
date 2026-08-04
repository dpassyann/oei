import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountRegistrationPort } from '../../domain/port/identity/account-registration.port';
import { AccountRegistration } from '../../domain/model/identity/account-registration';
import { Member } from '../../domain/model/identity/member';

const ACCOUNTS_API_BASE = '/api/public/v1/accounts';

@Service()
export class AccountRegistrationApiAdapter implements AccountRegistrationPort {
  private readonly http = inject(HttpClient);

  register(registration: AccountRegistration): Observable<Member> {
    return this.http.post<Member>(ACCOUNTS_API_BASE, registration);
  }
}
