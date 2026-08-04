import { firstValueFrom } from 'rxjs';
import { WalletMockAdapter } from './wallet-mock.adapter';

describe('WalletMockAdapter', () => {
  it('givenNoPassesYet_whenListPasses_thenReturnsEmptyArray', async () => {
    const adapter = new WalletMockAdapter();
    const passes = await firstValueFrom(adapter.listPasses());
    expect(passes).toEqual([]);
  });

  it('givenDemoMember_whenIssueApplePass_thenReturnsMockedApplePassAndStoresIt', async () => {
    const adapter = new WalletMockAdapter();
    const pass = await firstValueFrom(adapter.issueApplePass());
    expect(pass.provider).toBe('APPLE');
    expect(pass.status).toBe('MOCKED');
    expect(pass.mocked).toBe(true);
    expect(pass.memberId).toBe('demo-member-1');
    const passes = await firstValueFrom(adapter.listPasses());
    expect(passes).toEqual([pass]);
  });

  it('givenDemoMember_whenIssueGooglePass_thenReturnsMockedGooglePass', async () => {
    const adapter = new WalletMockAdapter();
    const pass = await firstValueFrom(adapter.issueGooglePass());
    expect(pass.provider).toBe('GOOGLE');
    expect(pass.mocked).toBe(true);
  });

  it('givenIssuedPass_whenRevokePass_thenReturnsRevokedCopyAndUpdatesStore', async () => {
    const adapter = new WalletMockAdapter();
    const issued = await firstValueFrom(adapter.issueApplePass());
    const revoked = await firstValueFrom(adapter.revokePass(issued.id));
    expect(revoked.status).toBe('REVOKED');
    expect(revoked.revokedAt).toBeDefined();
    const passes = await firstValueFrom(adapter.listPasses());
    expect(passes[0].status).toBe('REVOKED');
  });

  it('givenUnknownId_whenRevokePass_thenThrowsError', async () => {
    const adapter = new WalletMockAdapter();
    await expect(firstValueFrom(adapter.revokePass('unknown-id'))).rejects.toBeDefined();
  });
});
