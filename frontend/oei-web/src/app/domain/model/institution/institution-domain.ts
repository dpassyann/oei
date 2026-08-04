// Un domaine email rattaché à une institution (ex. "@oei-demo.org"), utilisé pour la
// vérification automatique d'affiliation (voir MemberInstitutionAffiliation) : un membre
// dont l'email professionnel se termine par un domaine `verified: true` peut demander un
// rattachement accéléré, mais la validation manuelle par un `institution-affiliation-validator`
// reste toujours requise (voir doc 03, §Sécurité — "validation manuelle").
export interface InstitutionDomain {
  readonly id: string;
  readonly domain: string;
  readonly verified: boolean;
  readonly verifiedAt: string | null;
}

export function createInstitutionDomain(fields: InstitutionDomain): InstitutionDomain {
  return Object.freeze({ ...fields });
}
