import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileImportPort } from '../../domain/port/profile/profile-import.port';
import { ProfileImport } from '../../domain/model/profile/profile-import';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (legacy `/api/v1` family only).
const PROFILE_IMPORT_API_BASE = '/api/member/v1/profile-import';

@Service()
export class ProfileImportApiAdapter extends ProfileImportPort {
  private readonly http = inject(HttpClient);

  override initiateCvImport(file: File, consentVersion: string): Observable<ProfileImport> {
    const payload = new FormData();
    payload.append('file', file);
    payload.append('consentVersion', consentVersion);

    return this.http.post<ProfileImport>(`${PROFILE_IMPORT_API_BASE}/cv`, payload);
  }

  override getImport(importId: string): Observable<ProfileImport> {
    return this.http.get<ProfileImport>(`${PROFILE_IMPORT_API_BASE}/${importId}`);
  }

  override getImportDraft(importId: string): Observable<ProfessionalProfile> {
    return this.http.get<ProfessionalProfile>(`${PROFILE_IMPORT_API_BASE}/${importId}/draft`);
  }

  override updateImportDraft(importId: string, draft: ProfessionalProfile): Observable<ProfessionalProfile> {
    return this.http.put<ProfessionalProfile>(`${PROFILE_IMPORT_API_BASE}/${importId}/draft`, draft);
  }

  override confirmImport(importId: string): Observable<ProfessionalProfile> {
    return this.http.post<ProfessionalProfile>(`${PROFILE_IMPORT_API_BASE}/${importId}/confirm`, {});
  }

  override importLinkedinBasic(accessToken: string): Observable<ProfessionalProfile> {
    return this.http.post<ProfessionalProfile>(`${PROFILE_IMPORT_API_BASE}/linkedin/basic`, { accessToken });
  }

  override importLinkedinBasicFromAuthorizationCode(
    authorizationCode: string,
    redirectUri: string,
  ): Observable<ProfessionalProfile> {
    return this.http.post<ProfessionalProfile>(`${PROFILE_IMPORT_API_BASE}/linkedin/basic/callback`, {
      authorizationCode,
      redirectUri,
    });
  }
}

