import { Observable } from 'rxjs';
import { ProfileImport } from '../../model/profile/profile-import';
import { ProfessionalProfile } from '../../model/profile/professional-profile';

/**
 * Port for the profile import pipeline (Smart CV Import).
 *
 * Supports both the initial onboarding import and later CV replacements.
 */
export abstract class ProfileImportPort {
  /**
   * Initiate a CV import. The file is uploaded and AI processing starts asynchronously.
   * Returns the import session immediately (status = DOCUMENT_UPLOADED or EXTRACTING).
   * Requires entitlement AI_CV_IMPORT.
   */
  abstract initiateCvImport(file: File, consentVersion: string): Observable<ProfileImport>;

  /** Poll the current status of an import session. */
  abstract getImport(importId: string): Observable<ProfileImport>;

  /** Get the AI-extracted draft profile (available when status = REVIEW_REQUIRED). */
  abstract getImportDraft(importId: string): Observable<ProfessionalProfile>;

  /** Update the draft before confirming (member corrections). */
  abstract updateImportDraft(importId: string, draft: ProfessionalProfile): Observable<ProfessionalProfile>;

  /** Confirm the draft — creates/updates the profile. */
  abstract confirmImport(importId: string): Observable<ProfessionalProfile>;

  /** Import LinkedIn basic identity and bootstrap profile source. */
  abstract importLinkedinBasic(accessToken: string): Observable<ProfessionalProfile>;

  /** Finalize LinkedIn OAuth callback (authorization-code exchange server-side + import). */
  abstract importLinkedinBasicFromAuthorizationCode(
    authorizationCode: string,
    redirectUri: string,
  ): Observable<ProfessionalProfile>;
}

