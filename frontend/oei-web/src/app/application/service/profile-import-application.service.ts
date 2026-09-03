import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileImportPort } from '../../domain/port/profile/profile-import.port';
import { ProfileImport } from '../../domain/model/profile/profile-import';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

/**
 * Application service for the Smart CV Import pipeline.
 *
 * Components interact with this service; they never know whether the adapter
 * behind is mock or HTTP (gateway pattern).
 */
@Injectable({ providedIn: 'root' })
export class ProfileImportApplicationService {
  private readonly port = inject(ProfileImportPort);

  initiateCvImport(file: File, consentVersion: string): Observable<ProfileImport> {
    return this.port.initiateCvImport(file, consentVersion);
  }

  getImport(importId: string): Observable<ProfileImport> {
    return this.port.getImport(importId);
  }

  getImportDraft(importId: string): Observable<ProfessionalProfile> {
    return this.port.getImportDraft(importId);
  }

  updateImportDraft(importId: string, draft: ProfessionalProfile): Observable<ProfessionalProfile> {
    return this.port.updateImportDraft(importId, draft);
  }

  confirmImport(importId: string): Observable<ProfessionalProfile> {
    return this.port.confirmImport(importId);
  }

  importLinkedinBasicFromAuthorizationCode(authorizationCode: string, redirectUri: string): Observable<ProfessionalProfile> {
    return this.port.importLinkedinBasicFromAuthorizationCode(authorizationCode, redirectUri);
  }
}

