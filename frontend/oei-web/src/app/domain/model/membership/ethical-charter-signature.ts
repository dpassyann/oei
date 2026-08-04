export interface EthicalCharterSignature {
  readonly id: string;
  readonly memberId: string;
  readonly version: string;
  readonly signedAt: string;
}

export function createEthicalCharterSignature(fields: EthicalCharterSignature): EthicalCharterSignature {
  return Object.freeze({ ...fields });
}
