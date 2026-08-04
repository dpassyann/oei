import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletPass } from '../../model/wallet/wallet-pass';

export interface WalletPort {
  listPasses(): Observable<WalletPass[]>;
  // Always resolves to a `WalletPass` with `mocked: true` (never a real signed
  // .pkpass/Google Wallet object) — see WalletPass doc comment and ADR 0002.
  issueApplePass(): Observable<WalletPass>;
  issueGooglePass(): Observable<WalletPass>;
  revokePass(id: string): Observable<WalletPass>;
}

export const WALLET_PORT = new InjectionToken<WalletPort>('WalletPort');
