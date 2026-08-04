import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MembershipFeeApiAdapter } from './membership-fee-api.adapter';

describe('MembershipFeeApiAdapter', () => {
  function createAdapter(): { adapter: MembershipFeeApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MembershipFeeApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(MembershipFeeApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsAccount_whenGetAccount_thenCallsAccountEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getAccount());
    const req = httpMock.expectOne('/api/member/v1/membership-fee/account');
    expect(req.request.method).toBe('GET');
    req.flush({ memberId: 'member-1', tier: 'MEMBER', payments: [] });
    expect((await result).tier).toBe('MEMBER');
    httpMock.verify();
  });

  it('givenPaymentRequest_whenPayFee_thenPostsBodyToPaymentsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const request = { tier: 'MEMBER' as const, cycleYear: 2026, amount: 24.93 };
    const result = firstValueFrom(adapter.payFee(request));
    const req = httpMock.expectOne('/api/member/v1/membership-fee/payments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({
      id: 'payment-1',
      memberId: 'member-1',
      cycleYear: 2026,
      tier: 'MEMBER',
      amount: 24.93,
      status: 'PAID',
      paidAt: '2026-10-22T00:00:00Z',
    });
    expect((await result).status).toBe('PAID');
    httpMock.verify();
  });
});
