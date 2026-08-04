import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MembershipFeePort, MembershipFeePaymentRequest } from '../../domain/port/membership-fee/membership-fee.port';
import { MembershipFeeAccount } from '../../domain/model/membership-fee/membership-fee-account';
import { MembershipFeePayment } from '../../domain/model/membership-fee/membership-fee-payment';

const MEMBERSHIP_FEE_API_BASE = '/api/member/v1/membership-fee';

@Service()
export class MembershipFeeApiAdapter implements MembershipFeePort {
  private readonly http = inject(HttpClient);

  getAccount(): Observable<MembershipFeeAccount> {
    return this.http.get<MembershipFeeAccount>(`${MEMBERSHIP_FEE_API_BASE}/account`);
  }

  payFee(request: MembershipFeePaymentRequest): Observable<MembershipFeePayment> {
    return this.http.post<MembershipFeePayment>(`${MEMBERSHIP_FEE_API_BASE}/payments`, request);
  }
}
