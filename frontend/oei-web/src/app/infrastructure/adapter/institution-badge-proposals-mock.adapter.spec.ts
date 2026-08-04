import { firstValueFrom } from 'rxjs';
import { InstitutionBadgeProposalsMockAdapter } from './institution-badge-proposals-mock.adapter';

describe('InstitutionBadgeProposalsMockAdapter', () => {
  it('whenListBadgeProposals_thenReturnsDemoProposals', async () => {
    const adapter = new InstitutionBadgeProposalsMockAdapter();
    const proposals = await firstValueFrom(adapter.listBadgeProposals());
    expect(proposals.length).toBeGreaterThan(0);
  });

  it('whenCreateBadgeProposal_thenStartsPendingNeverAwarded', async () => {
    const adapter = new InstitutionBadgeProposalsMockAdapter();
    const created = await firstValueFrom(
      adapter.createBadgeProposal({ memberId: 'member-demo-2', proposedBadgeCode: 'internal-training-2026', justification: 'Justification' }),
    );
    expect(created.status).toBe('PENDING');
  });
});
