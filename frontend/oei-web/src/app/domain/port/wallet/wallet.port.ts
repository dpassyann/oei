import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletPass, WalletPassVerification } from '../../model/wallet/wallet-pass';

export interface WalletPort {
  listPasses(): Observable<WalletPass[]>;
  // Always resolves to a `WalletPass` with `mocked: true` (never a real signed
  // .pkpass/Google Wallet object) — see WalletPass doc comment and ADR 0002.
  issueApplePass(): Observable<WalletPass>;
  issueGooglePass(): Observable<WalletPass>;
  revokePass(id: string): Observable<WalletPass>;
  // Public, unauthenticated verification lookup by pass serial number (the `token` in the
  // `/verify/member/{token}` route) — matches the OpenAPI `GET
  // /api/public/v1/wallet/passes/{serialNumber}/verify` endpoint. Returns `null` (not an
  // error) for an unknown/invalid/expired token, so the presentation layer can render a
  // clear "invalid" state rather than crash or silently show a false-positive validation.
  verifyPass(serialNumber: string): Observable<WalletPassVerification | null>;
}

export const WALLET_PORT = new InjectionToken<WalletPort>('WalletPort');
