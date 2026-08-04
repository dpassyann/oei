import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PUBLIC_PROFILE_PORT } from '../../domain/port/profile/public-profile.port';
import { PublicProfile, PublicProfilePublication } from '../../domain/model/profile/public-profile';

@Service()
export class PublicProfileApplicationService {
  private readonly port = inject(PUBLIC_PROFILE_PORT);

  getMyPublicProfile(): Observable<PublicProfile> {
    return this.port.getMyPublicProfile();
  }

  publish(publication: PublicProfilePublication): Observable<PublicProfile> {
    return this.port.publish(publication);
  }

  getBySlug(publicSlug: string): Observable<PublicProfile | null> {
    return this.port.getBySlug(publicSlug);
  }
}
