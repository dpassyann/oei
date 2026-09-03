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

  /**
   * Finalize LinkedIn OAuth callback (authorization-code exchange server-side + import).
   *
   * This is the only LinkedIn-import entry point: the server exchanges the authorization
   * code for a token itself, so the frontend never has to hold or forward a raw LinkedIn
   * access token. A prior "basic" variant accepting a client-supplied access token directly
   * was removed as dead code (no caller, and no planned native/mobile client needing it —
   * see .prompt/plan/integration/*.md); re-add only alongside a concrete client that performs
   * its own OAuth handshake.
   */
  abstract importLinkedinBasicFromAuthorizationCode(
    authorizationCode: string,
    redirectUri: string,
  ): Observable<ProfessionalProfile>;
}

