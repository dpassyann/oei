import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfessionalProfilePort } from '../../domain/port/profile/professional-profile.port';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const PROFESSIONAL_PROFILE_API_BASE = '/api/member/v1';

@Service()
export class ProfessionalProfileApiAdapter implements ProfessionalProfilePort {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfessionalProfile> {
    return this.http.get<ProfessionalProfile>(`${PROFESSIONAL_PROFILE_API_BASE}/profile`);
  }

  updateProfile(profile: ProfessionalProfile): Observable<ProfessionalProfile> {
    return this.http.put<ProfessionalProfile>(`${PROFESSIONAL_PROFILE_API_BASE}/profile`, profile);
  }
}
