import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AccountRegistrationApiAdapter } from './account-registration-api.adapter';

describe('AccountRegistrationApiAdapter', () => {
  function createAdapter(): { adapter: AccountRegistrationApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [AccountRegistrationApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(AccountRegistrationApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenRegistration_whenRegister_thenPostsBodyToAccountsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const registration = { email: 'jane@example.com', locale: 'fr' as const, country: 'FR', consentAccepted: true };
    const result = firstValueFrom(adapter.register(registration));
    const req = httpMock.expectOne('/api/public/v1/accounts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registration);
    req.flush({
      id: 'member-1',
      publicSlug: 'jane-example',
      displayName: 'Jane',
      locale: 'fr',
      country: 'FR',
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).id).toBe('member-1');
    httpMock.verify();
  });
});
