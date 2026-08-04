// Contribution institutionnelle (groupes de travail, consultations — voir doc 03
// §"Groupes de travail"). Modèle minimal aligné sur `InstitutionContribution` dans
// openapi/oei-api.yaml ; les droits de vote dépendent de la gouvernance (hors périmètre V1).
export interface InstitutionContribution {
  readonly id: string;
  readonly institutionId: string;
  readonly type: string;
  readonly description: string;
  readonly status: string;
}

export function createInstitutionContribution(fields: InstitutionContribution): InstitutionContribution {
  return Object.freeze({ ...fields });
}
