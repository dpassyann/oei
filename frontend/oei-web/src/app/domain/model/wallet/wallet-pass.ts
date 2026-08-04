export type WalletPassProvider = 'APPLE' | 'GOOGLE';

export type WalletPassStatus = 'MOCKED' | 'ISSUED' | 'REVOKED' | 'RENEWED';

// `mocked` is always `true` in V1 (ADR 0002 / OpenAPI): this represents the pass
// structure without generating a real signed `.pkpass` (no Apple/Google publisher
// certificate available yet). MUST NEVER be presented as an official ID document —
// enforced in the presentation layer with an explicit "démonstration" notice.
export interface WalletPass {
  readonly id: string;
  readonly memberId: string;
  readonly provider: WalletPassProvider;
  readonly status: WalletPassStatus;
  readonly serialNumber: string;
  readonly verificationUrl?: string;
  readonly levelColor?: string;
  readonly issuedAt: string;
  readonly revokedAt?: string | null;
  readonly mocked: true;
}

export function createWalletPass(fields: Omit<WalletPass, 'mocked'>): WalletPass {
  return Object.freeze({ ...fields, mocked: true });
}

export interface WalletPassVerification {
  readonly valid: boolean;
  readonly memberPublicSlug?: string;
  readonly status: WalletPassStatus;
  readonly tier?: string;
}
