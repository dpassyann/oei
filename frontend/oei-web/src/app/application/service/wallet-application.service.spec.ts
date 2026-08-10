import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { WalletApplicationService } from './wallet-application.service';
import { WALLET_PORT, WalletPort } from '../../domain/port/wallet/wallet.port';
import { createWalletPass } from '../../domain/model/wallet/wallet-pass';

describe('WalletApplicationService', () => {
  function setup(fakePort: WalletPort) {
    TestBed.configureTestingModule({ providers: [{ provide: WALLET_PORT, useValue: fakePort }] });
    return TestBed.inject(WalletApplicationService);
  }

  const pass = createWalletPass({
    id: 'pass-1',
    memberId: 'member-1',
    provider: 'APPLE',
    status: 'MOCKED',
    serialNumber: 'SERIAL-1',
    issuedAt: '2026-01-01T00:00:00Z',
  });

  it('givenPortReturnsPasses_whenListPasses_thenForwardsThem', async () => {
    const service = setup({
      listPasses: () => of([pass]),
      issueApplePass: () => of(pass),
      issueGooglePass: () => of(pass),
      revokePass: () => of(pass),
      verifyPass: () => of(null),
    });
    const passes = await firstValueFrom(service.listPasses());
    expect(passes).toEqual([pass]);
  });

  it('givenPortReturnsPass_whenIssueApplePass_thenForwardsIt', async () => {
    const service = setup({
      listPasses: () => of([]),
      issueApplePass: () => of(pass),
      issueGooglePass: () => of(pass),
      revokePass: () => of(pass),
      verifyPass: () => of(null),
    });
    const result = await firstValueFrom(service.issueApplePass());
    expect(result).toEqual(pass);
  });

  it('givenPortReturnsPass_whenIssueGooglePass_thenForwardsIt', async () => {
    const service = setup({
      listPasses: () => of([]),
      issueApplePass: () => of(pass),
      issueGooglePass: () => of(pass),
      revokePass: () => of(pass),
      verifyPass: () => of(null),
    });
    const result = await firstValueFrom(service.issueGooglePass());
    expect(result).toEqual(pass);
  });

  it('givenPortRevokesPass_whenRevokePass_thenForwardsIdAndReturnsResult', async () => {
    let receivedId: string | undefined;
    const service = setup({
      listPasses: () => of([]),
      issueApplePass: () => of(pass),
      issueGooglePass: () => of(pass),
      revokePass: (id) => {
        receivedId = id;
        return of(pass);
      },
      verifyPass: () => of(null),
    });
    const result = await firstValueFrom(service.revokePass('pass-1'));
    expect(receivedId).toBe('pass-1');
    expect(result).toEqual(pass);
  });

  it('givenPortReturnsVerification_whenVerifyPass_thenForwardsSerialNumberAndResult', async () => {
    let receivedSerialNumber: string | undefined;
    const verification = { valid: true, memberPublicSlug: 'demo-jane-dupont', status: 'ISSUED' as const, tier: 'SILVER' };
    const service = setup({
      listPasses: () => of([]),
      issueApplePass: () => of(pass),
      issueGooglePass: () => of(pass),
      revokePass: () => of(pass),
      verifyPass: (serialNumber) => {
        receivedSerialNumber = serialNumber;
        return of(verification);
      },
    });
    const result = await firstValueFrom(service.verifyPass('SERIAL-1'));
    expect(receivedSerialNumber).toBe('SERIAL-1');
    expect(result).toEqual(verification);
  });
});
