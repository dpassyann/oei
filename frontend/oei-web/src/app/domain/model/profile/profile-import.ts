/**
 * Statut du cycle de vie d'une session d'import de profil professionnel.
 */
export type ProfileImportStatus =
  | 'CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'EXTRACTING'
  | 'AI_PROCESSING'
  | 'REVIEW_REQUIRED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED';

/**
 * Source d'un import de profil (format du document ou service externe).
 */
export type ProfileImportSource = 'CV_PDF' | 'CV_DOCX' | 'LINKEDIN_BASIC';

/**
 * Session d'import de profil professionnel.
 */
export interface ProfileImport {
  readonly id: string;
  readonly memberId: string;
  readonly source: ProfileImportSource;
  readonly status: ProfileImportStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  /** Code d'erreur technique si status = FAILED. */
  readonly errorCode?: string | null;
  /** Libellé de l'étape en cours pour affichage UX. */
  readonly processingStepLabel?: string | null;
}

/**
 * Labels d'étapes de traitement pour l'affichage UX asynchrone.
 */
export const PROCESSING_STEP_LABELS: Record<ProfileImportStatus, string> = {
  CREATED: 'Initialisation…',
  DOCUMENT_UPLOADED: 'Document reçu…',
  EXTRACTING: 'Lecture de votre CV…',
  AI_PROCESSING: `Structuration de votre parcours par l'IA…`,
  REVIEW_REQUIRED: 'Votre profil est prêt à être validé',
  CONFIRMED: 'Profil confirmé',
  COMPLETED: 'Import terminé',
  FAILED: `Échec de l'import`,
  EXPIRED: 'Session expirée',
};

