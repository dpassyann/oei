// KPI du dashboard institutionnel (doc 03 §"Dashboard"). Règle d'honnêteté des données
// (voir 00-CONTEXTE-GLOBAL-OEI.md) : tant qu'aucune vraie donnée n'existe, chaque compteur
// est à 0 — jamais de chiffre inventé — et `dataMaturity` indique explicitement l'état
// ("en cours de constitution") pour que la page dashboard puisse l'afficher au lieu de
// laisser un simple zéro silencieux.
export type InstitutionDashboardMaturity = 'ESTABLISHED' | 'IN_PROGRESS';

export interface InstitutionDashboard {
  readonly institutionId: string;
  readonly affiliatedMembers: number;
  readonly activeMembers: number;
  readonly verifiedProfiles: number;
  readonly certifications: number;
  readonly badges: number;
  readonly signedCharters: number;
  readonly contributions: number;
  readonly trainings: number;
  readonly opportunities: number;
  readonly publications: number;
  readonly invitations: number;
  readonly dataMaturity: InstitutionDashboardMaturity;
}

export function createInstitutionDashboard(fields: InstitutionDashboard): InstitutionDashboard {
  return Object.freeze({ ...fields });
}
