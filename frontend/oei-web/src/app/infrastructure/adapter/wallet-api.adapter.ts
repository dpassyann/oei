import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { WalletPort } from '../../domain/port/wallet/wallet.port';
import { createWalletPass, WalletPass } from '../../domain/model/wallet/wallet-pass';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const WALLET_API_BASE = '/api/member/v1';

// V1 note (ADR 0002 — "Wallet activable après disponibilité des comptes et certificats
// éditeur"): real Apple/Google wallet issuance is out of scope for V1. Even this "api"
// adapter talks to a backend endpoint that itself returns mocked passes — we still force
// `mocked: true` here via `createWalletPass()` so the guarantee never depends on backend
// discipline alone.
@Service()
export class WalletApiAdapter implements WalletPort {
  private readonly http = inject(HttpClient);

  listPasses(): Observable<WalletPass[]> {
    return this.http
      .get<WalletPass[]>(`${WALLET_API_BASE}/wallet/passes`)
      .pipe(map((passes) => passes.map((pass) => createWalletPass(pass))));
  }

  issueApplePass(): Observable<WalletPass> {
    return this.http
      .post<WalletPass>(`${WALLET_API_BASE}/wallet/apple-pass`, {})
      .pipe(map((pass) => createWalletPass(pass)));
  }

  issueGooglePass(): Observable<WalletPass> {
    return this.http
      .post<WalletPass>(`${WALLET_API_BASE}/wallet/google-pass`, {})
      .pipe(map((pass) => createWalletPass(pass)));
  }

  revokePass(id: string): Observable<WalletPass> {
    return this.http
      .post<WalletPass>(`${WALLET_API_BASE}/wallet/passes/${id}/revoke`, {})
      .pipe(map((pass) => createWalletPass(pass)));
  }
}
