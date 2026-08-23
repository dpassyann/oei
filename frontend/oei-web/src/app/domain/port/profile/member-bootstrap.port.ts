import { Observable } from 'rxjs';
import { MemberBootstrap } from '../../model/profile/member-bootstrap';

/**
 * Port for GET /api/member/v1/bootstrap.
 *
 * Called once after authentication to determine the landing experience.
 * Never returns an error for a missing profile — instead returns
 * profileStatus = ONBOARDING_REQUIRED.
 */
export abstract class MemberBootstrapPort {
  abstract getBootstrap(): Observable<MemberBootstrap>;
}

