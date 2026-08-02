import { StatsMockAdapter } from './stats-mock.adapter';

describe('StatsMockAdapter', () => {
  it('givenNoRealDataYet_whenGetHomeStats_thenReturnsFourStatsAllAtZero', async () => {
    const adapter = new StatsMockAdapter();
    const stats = await adapter.getHomeStats();
    expect(stats.length).toBe(4);
    expect(stats.every((stat) => stat.value === 0)).toBe(true);
    expect(stats.map((stat) => stat.label)).toEqual([
      'Membres fondateurs',
      'Partenaires académiques',
      'Pays concernés',
      'Certifications en développement',
    ]);
  });
});
