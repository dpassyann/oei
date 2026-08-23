import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MemberBootstrapPort } from '../../domain/port/profile/member-bootstrap.port';
import { MemberBootstrap } from '../../domain/model/profile/member-bootstrap';

/**
 * Active mock persona for bootstrap scenarios.
 *
 * To switch scenario during development:
 *   import { BOOTSTRAP_MOCK_PERSONA } from '...'
 *   and set it before the service is instantiated (or use a DI token override).
 */
export type BootstrapMockPersona =
  | 'NEW_ACCOUNT'             // profileStatus = ONBOARDING_REQUIRED, no membership
  | 'PROFILE_REQUIRED'        // same as NEW_ACCOUNT (alias)
  | 'FREE_PROFILE'            // profileStatus = READY, no membership
  | 'FREE_PROFILE_WITH_CV'    // profileStatus = READY, no membership, has CV
  | 'NON_MEMBER_REQUIRES_PAYMENT'  // PROFILE_INCOMPLETE, no membership (needs to pay for AI import)
  | 'ACTIVE_MEMBER'           // READY, ACTIVE membership
  | 'FOUNDING_MEMBER'         // READY, FOUNDING membership
  | 'MEMBERSHIP_PAYMENT_DUE'  // READY, EXPIRED status
  | 'MEMBERSHIP_GRACE_PERIOD' // READY, GRACE_PERIOD status
  | 'ONBOARDING_IN_PROGRESS'  // AI processing in progress
  | 'PROFILE_INCOMPLETE';     // Profile exists but incomplete

export const MOCK_BOOTSTRAPS: Record<BootstrapMockPersona, MemberBootstrap> = {
  NEW_ACCOUNT: {
    memberId: 'demo-member-1',
    profileStatus: 'ONBOARDING_REQUIRED',
    membershipStatus: null,
    profileId: null,
  },
  PROFILE_REQUIRED: {
    memberId: 'demo-member-1',
    profileStatus: 'ONBOARDING_REQUIRED',
    membershipStatus: null,
    profileId: null,
  },
  FREE_PROFILE: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: null,
    profileId: 'demo-member-1',
  },
  FREE_PROFILE_WITH_CV: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: null,
    profileId: 'demo-member-1',
  },
  NON_MEMBER_REQUIRES_PAYMENT: {
    memberId: 'demo-member-1',
    profileStatus: 'PROFILE_INCOMPLETE',
    membershipStatus: null,
    profileId: 'demo-member-1',
  },
  ACTIVE_MEMBER: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: 'ACTIVE',
    profileId: 'demo-member-1',
  },
  FOUNDING_MEMBER: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: 'FOUNDING',
    profileId: 'demo-member-1',
  },
  MEMBERSHIP_PAYMENT_DUE: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: 'EXPIRED',
    profileId: 'demo-member-1',
  },
  MEMBERSHIP_GRACE_PERIOD: {
    memberId: 'demo-member-1',
    profileStatus: 'READY',
    membershipStatus: 'GRACE_PERIOD',
    profileId: 'demo-member-1',
  },
  ONBOARDING_IN_PROGRESS: {
    memberId: 'demo-member-1',
    profileStatus: 'ONBOARDING_IN_PROGRESS',
    membershipStatus: null,
    profileId: null,
  },
  PROFILE_INCOMPLETE: {
    memberId: 'demo-member-1',
    profileStatus: 'PROFILE_INCOMPLETE',
    membershipStatus: 'PENDING',
    profileId: 'demo-member-1',
  },
};

// Change this constant to switch the active mock scenario during development.
export const ACTIVE_BOOTSTRAP_PERSONA: BootstrapMockPersona = 'ACTIVE_MEMBER';

@Service()
export class MemberBootstrapMockAdapter extends MemberBootstrapPort {
  override getBootstrap(): Observable<MemberBootstrap> {
    return of(MOCK_BOOTSTRAPS[ACTIVE_BOOTSTRAP_PERSONA]);
  }
}

