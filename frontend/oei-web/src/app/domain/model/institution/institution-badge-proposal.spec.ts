import { createInstitutionBadgeProposal } from './institution-badge-proposal';

describe('InstitutionBadgeProposal', () => {
  it('givenValidFields_whenCreateInstitutionBadgeProposal_thenReturnsFrozenValue', () => {
    const proposal = createInstitutionBadgeProposal({
      id: 'proposal-1',
      institutionId: 'inst-demo',
      memberId: 'member-1',
      proposedBadgeCode: 'internal-training-2026',
      justification: 'A suivi la formation interne 2026.',
      status: 'PENDING',
    });
    expect(proposal.status).toBe('PENDING');
    expect(Object.isFrozen(proposal)).toBe(true);
  });
});
