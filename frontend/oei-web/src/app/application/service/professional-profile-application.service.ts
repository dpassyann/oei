import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PROFESSIONAL_PROFILE_PORT } from '../../domain/port/profile/professional-profile.port';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';

@Service()
export class ProfessionalProfileApplicationService {
  private readonly port = inject(PROFESSIONAL_PROFILE_PORT);

  getProfile(): Observable<ProfessionalProfile> {
    return this.port.getProfile();
  }

  updateProfile(profile: ProfessionalProfile): Observable<ProfessionalProfile> {
    return this.port.updateProfile(profile);
  }
}
