import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { WalletPort } from '../../domain/port/wallet/wallet.port';
import { createWalletPass, WalletPass, WalletPassProvider } from '../../domain/model/wallet/wallet-pass';

// Level color matching the demo member's SILVER membership tier (see DEMO_MEMBER in
// member-mock.adapter.ts) — purely cosmetic for the mocked pass rendering.
const SILVER_LEVEL_COLOR = '#C0C0C0';

@Service()
export class WalletMockAdapter implements WalletPort {
  // Starts empty: no wallet pass has been issued yet for the demo member — this lets the
  // presentation layer demonstrate the "issue" call-to-action from a clean state.
  private readonly passes: WalletPass[] = [];

  listPasses(): Observable<WalletPass[]> {
    return of([...this.passes]);
  }

  issueApplePass(): Observable<WalletPass> {
    return of(this.issuePass('APPLE'));
  }

  issueGooglePass(): Observable<WalletPass> {
    return of(this.issuePass('GOOGLE'));
  }

  revokePass(id: string): Observable<WalletPass> {
    const index = this.passes.findIndex((pass) => pass.id === id);
    if (index === -1) {
      return throwError(() => new Error(`WalletPass not found: ${id}`));
    }
    const revoked = createWalletPass({
      ...this.passes[index],
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
    });
    this.passes[index] = revoked;
    return of(revoked);
  }

  private issuePass(provider: WalletPassProvider): WalletPass {
    const pass = createWalletPass({
      id: crypto.randomUUID(),
      memberId: 'demo-member-1',
      provider,
      status: 'MOCKED',
      serialNumber: `MOCK-${provider}-${crypto.randomUUID()}`,
      verificationUrl: '/membres/demo-jane-dupont/wallet-verify',
      levelColor: SILVER_LEVEL_COLOR,
      issuedAt: new Date().toISOString(),
    });
    this.passes.push(pass);
    return pass;
  }
}
