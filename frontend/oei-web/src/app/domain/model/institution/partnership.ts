// Niveau de partenariat institutionnel — voir doc 03 §"Compte institutionnel" et
// §"Avantages collaborateurs" (le niveau GOLD conditionne, entre autres, l'upgrade
// `member-gold` d'un employé affilié vérifié — voir docs/architecture/keycloak-roles.md).
export type PartnershipLevel = 'PROSPECT' | 'STANDARD' | 'SILVER' | 'GOLD' | 'STRATEGIC';

export interface Partnership {
  readonly institutionId: string;
  readonly level: PartnershipLevel;
  readonly verified: boolean;
  readonly startedAt: string;
  readonly endsAt: string | null;
  readonly agreementDocumentUrl: string | null;
}

export function createPartnership(fields: Partnership): Partnership {
  return Object.freeze({ ...fields });
}
