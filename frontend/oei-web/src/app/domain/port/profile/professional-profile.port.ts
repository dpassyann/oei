import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfessionalProfile } from '../../model/profile/professional-profile';

export interface ProfessionalProfilePort {
  getProfile(): Observable<ProfessionalProfile>;
  // Contract-aligned: `PUT /api/member/v1/profile` replaces the whole profile
  // (ADR 0002 — no granular per-field CRUD), so callers must always send the
  // complete `ProfessionalProfile`, not a partial patch.
  updateProfile(profile: ProfessionalProfile): Observable<ProfessionalProfile>;
}

export const PROFESSIONAL_PROFILE_PORT = new InjectionToken<ProfessionalProfilePort>('ProfessionalProfilePort');
