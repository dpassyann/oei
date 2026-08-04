import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  INSTITUTION_BADGE_PROPOSALS_PORT,
  InstitutionBadgeProposalCreation,
} from '../../domain/port/institution/institution-badge-proposals.port';
import { InstitutionBadgeProposal } from '../../domain/model/institution/institution-badge-proposal';

@Service()
export class InstitutionBadgeProposalsApplicationService {
  private readonly port = inject(INSTITUTION_BADGE_PROPOSALS_PORT);

  listBadgeProposals(): Observable<InstitutionBadgeProposal[]> {
    return this.port.listBadgeProposals();
  }

  createBadgeProposal(creation: InstitutionBadgeProposalCreation): Observable<InstitutionBadgeProposal> {
    return this.port.createBadgeProposal(creation);
  }
}
