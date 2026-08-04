// Journal d'audit institutionnel (invitations, affiliations, publications...) — voir
// doc 03 §"Sécurité" ("audit"). `institutionId` est nullable pour rester fidèle au contrat
// OpenAPI (`InstitutionAuditLog`, champ optionnel), même si en pratique toute entrée générée
// par ce bounded context porte un `institutionId`.
export interface InstitutionAuditLog {
  readonly id: string;
  readonly institutionId: string | null;
  readonly actorId: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly occurredAt: string;
}

export function createInstitutionAuditLog(fields: InstitutionAuditLog): InstitutionAuditLog {
  return Object.freeze({ ...fields });
}
