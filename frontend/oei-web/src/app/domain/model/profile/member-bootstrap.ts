import { ProfileImportStatus } from './profile-import';

/**
 * Statut du cycle de vie du profil professionnel, retourné par GET /api/member/v1/bootstrap.
 */
export type ProfileStatus =
  | 'ONBOARDING_REQUIRED'
  | 'ONBOARDING_IN_PROGRESS'
  | 'PROFILE_INCOMPLETE'
  | 'READY'
  | 'SUSPENDED';

/**
 * Source d'un profil professionnel (comment le contenu a été initialement obtenu).
 */
export type ProfileSource = 'MANUAL' | 'LINKEDIN_BASIC' | 'CV_IMPORTED' | 'LINKEDIN_AND_CV';

/**
 * Réponse de GET /api/member/v1/bootstrap — tout ce dont le frontend a besoin pour
 * décider de l'expérience d'atterrissage sans appels API supplémentaires.
 *
 * `membershipStatus` peut être null si le membre n'a pas d'adhésion OEI formelle
 * (profil professionnel libre sans membership — intentionnellement supporté).
 *
 * `cvStatus` est une projection du statut le plus récent du pipeline de Smart CV Import
 * (voir `ProfileImportStatus`) ; null si le membre n'a jamais démarré d'import. `profileStatus`
 * intègre déjà cette information dans `ONBOARDING_IN_PROGRESS`/`ONBOARDING_REQUIRED` — ce champ
 * reste informatif pour l'UI (ex. afficher l'étape courante du traitement).
 */
export interface MemberBootstrap {
  readonly memberId: string;
  readonly profileStatus: ProfileStatus;
  readonly membershipStatus: string | null;
  readonly profileId: string | null;
  readonly cvStatus: ProfileImportStatus | null;
}

