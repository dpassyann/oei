import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WALLET_PORT } from '../../domain/port/wallet/wallet.port';
import { WalletPass, WalletPassVerification } from '../../domain/model/wallet/wallet-pass';

@Service()
export class WalletApplicationService {
  private readonly port = inject(WALLET_PORT);

  listPasses(): Observable<WalletPass[]> {
    return this.port.listPasses();
  }

  issueApplePass(): Observable<WalletPass> {
    return this.port.issueApplePass();
  }

  issueGooglePass(): Observable<WalletPass> {
    return this.port.issueGooglePass();
  }

  revokePass(id: string): Observable<WalletPass> {
    return this.port.revokePass(id);
  }

  verifyPass(serialNumber: string): Observable<WalletPassVerification | null> {
    return this.port.verifyPass(serialNumber);
  }
}
