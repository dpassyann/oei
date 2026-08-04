import { firstValueFrom } from 'rxjs';
import { StatsMockAdapter } from './stats-mock.adapter';

describe('StatsMockAdapter', () => {
  it('givenFrenchLang_whenGetHomeStats_thenReturnsFourFrenchStatsAllAtZero', async () => {
    const adapter = new StatsMockAdapter();
    const stats = await firstValueFrom(adapter.getHomeStats('fr'));
    expect(stats.length).toBe(4);
    expect(stats.every((stat) => stat.value === 0)).toBe(true);
    expect(stats.map((stat) => stat.label)).toEqual([
      'Membres fondateurs',
      'Partenaires académiques',
      'Pays concernés',
      'Certifications en développement',
    ]);
  });

  it('givenEnglishLang_whenGetHomeStats_thenReturnsFourEnglishStats', async () => {
    const adapter = new StatsMockAdapter();
    const stats = await firstValueFrom(adapter.getHomeStats('en'));
    expect(stats.map((stat) => stat.label)).toEqual([
      'Founding members',
      'Academic partners',
      'Countries involved',
      'Certifications in development',
    ]);
  });

  it('givenUnsupportedLang_whenGetHomeStats_thenFallsBackToEnglish', async () => {
    const adapter = new StatsMockAdapter();
    const stats = await firstValueFrom(adapter.getHomeStats('xx'));
    expect(stats.map((stat) => stat.label)).toEqual([
      'Founding members',
      'Academic partners',
      'Countries involved',
      'Certifications in development',
    ]);
  });
});
