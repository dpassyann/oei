import { firstValueFrom } from 'rxjs';
import { InstitutionOpportunitiesMockAdapter } from './institution-opportunities-mock.adapter';

describe('InstitutionOpportunitiesMockAdapter', () => {
  it('whenListOpportunities_thenReturnsDemoOpportunities', async () => {
    const adapter = new InstitutionOpportunitiesMockAdapter();
    const opportunities = await firstValueFrom(adapter.listOpportunities());
    expect(opportunities.length).toBeGreaterThan(0);
  });

  it('whenCreateOpportunity_thenAppearsInSubsequentList', async () => {
    const adapter = new InstitutionOpportunitiesMockAdapter();
    const created = await firstValueFrom(
      adapter.createOpportunity({ type: 'JOB', title: 'Offre démonstration', description: 'Description', expiresAt: null }),
    );
    const opportunities = await firstValueFrom(adapter.listOpportunities());
    expect(opportunities.some((opportunity) => opportunity.id === created.id)).toBe(true);
  });

  it('givenExistingOpportunity_whenCloseOpportunity_thenStatusBecomesClosed', async () => {
    const adapter = new InstitutionOpportunitiesMockAdapter();
    const closed = await firstValueFrom(adapter.closeOpportunity('institution-opportunity-demo-1'));
    expect(closed.status).toBe('CLOSED');
  });

  it('givenUnknownOpportunity_whenCloseOpportunity_thenThrows', async () => {
    const adapter = new InstitutionOpportunitiesMockAdapter();
    await expect(firstValueFrom(adapter.closeOpportunity('unknown'))).rejects.toThrow();
  });
});
