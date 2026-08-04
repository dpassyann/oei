import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionBadgeProposal } from '../../model/institution/institution-badge-proposal';

export interface InstitutionBadgeProposalCreation {
  readonly memberId: string;
  readonly proposedBadgeCode: string;
  readonly justification: string;
}

// `GET/POST /api/institution/v1/badge-proposals`.
export interface InstitutionBadgeProposalsPort {
  listBadgeProposals(): Observable<InstitutionBadgeProposal[]>;
  createBadgeProposal(creation: InstitutionBadgeProposalCreation): Observable<InstitutionBadgeProposal>;
}

export const INSTITUTION_BADGE_PROPOSALS_PORT = new InjectionToken<InstitutionBadgeProposalsPort>('InstitutionBadgeProposalsPort');
