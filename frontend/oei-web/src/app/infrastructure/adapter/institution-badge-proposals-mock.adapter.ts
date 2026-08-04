import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  InstitutionBadgeProposalCreation,
  InstitutionBadgeProposalsPort,
} from '../../domain/port/institution/institution-badge-proposals.port';
import { createInstitutionBadgeProposal, InstitutionBadgeProposal } from '../../domain/model/institution/institution-badge-proposal';
import { DEMO_BADGE_PROPOSALS, DEMO_INSTITUTION_ID } from './institution-demo-data';

let nextProposalSequence = 1;

@Service()
export class InstitutionBadgeProposalsMockAdapter implements InstitutionBadgeProposalsPort {
  private proposals: InstitutionBadgeProposal[] = [...DEMO_BADGE_PROPOSALS];

  listBadgeProposals(): Observable<InstitutionBadgeProposal[]> {
    return of(this.proposals);
  }

  createBadgeProposal(creation: InstitutionBadgeProposalCreation): Observable<InstitutionBadgeProposal> {
    // "L'OEI reste seul décideur pour un badge OEI officiel" (doc 03 §"Reconnaissance") : le
    // statut initial est toujours PENDING, jamais AWARDED directement.
    const proposal = createInstitutionBadgeProposal({
      id: `institution-badge-proposal-demo-new-${nextProposalSequence++}`,
      institutionId: DEMO_INSTITUTION_ID,
      memberId: creation.memberId,
      proposedBadgeCode: creation.proposedBadgeCode,
      justification: creation.justification,
      status: 'PENDING',
    });
    this.proposals = [...this.proposals, proposal];
    return of(proposal);
  }
}
