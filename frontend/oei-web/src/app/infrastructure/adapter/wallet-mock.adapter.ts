import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { WalletPort } from '../../domain/port/wallet/wallet.port';
import { createWalletPass, WalletPass, WalletPassProvider, WalletPassVerification } from '../../domain/model/wallet/wallet-pass';

// Level color matching the demo member's SILVER membership tier (see DEMO_MEMBER in
// member-mock.adapter.ts) — purely cosmetic for the mocked pass rendering.
const SILVER_LEVEL_COLOR = '#C0C0C0';

// A fixed, well-known serial number that always resolves to a "valid" demo verification,
// independent of whatever the current instance's `passes` array holds (which starts empty —
// see below). Lets the public `/verify/member/{token}` page demonstrate its "verified" state
// on a fresh page load, without requiring a pass to have been issued first in the same
// session — while any *other* unrecognized token still correctly resolves to "invalid".
const DEMO_VERIFIED_SERIAL = 'MOCK-DEMO-VERIFIED';
const DEMO_MEMBER_PUBLIC_SLUG = 'demo-jane-dupont';

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

  verifyPass(serialNumber: string): Observable<WalletPassVerification | null> {
    const issued = this.passes.find((pass) => pass.serialNumber === serialNumber);
    if (issued) {
      return of({
        valid: issued.status !== 'REVOKED',
        memberPublicSlug: DEMO_MEMBER_PUBLIC_SLUG,
        status: issued.status,
        tier: 'SILVER',
      });
    }
    if (serialNumber === DEMO_VERIFIED_SERIAL) {
      return of({
        valid: true,
        memberPublicSlug: DEMO_MEMBER_PUBLIC_SLUG,
        status: 'ISSUED',
        tier: 'SILVER',
      });
    }
    return of(null);
  }

  private issuePass(provider: WalletPassProvider): WalletPass {
    const serialNumber = `MOCK-${provider}-${crypto.randomUUID()}`;
    const pass = createWalletPass({
      id: crypto.randomUUID(),
      memberId: 'demo-member-1',
      provider,
      status: 'MOCKED',
      serialNumber,
      verificationUrl: `/verify/member/${serialNumber}`,
      levelColor: SILVER_LEVEL_COLOR,
      issuedAt: new Date().toISOString(),
    });
    this.passes.push(pass);
    return pass;
  }
}
