import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { SalaryBenchmarkMockAdapter } from './salary-benchmark-mock.adapter';

describe('SalaryBenchmarkMockAdapter', () => {
  it('givenNoMatchingDomain_whenGetBenchmark_thenFallsBackToFullPoolAboveThreshold', async () => {
    const adapter = new SalaryBenchmarkMockAdapter();

    // No demo sample matches this made-up domain, so the pool falls back to the full demo
    // dataset (well above `MIN_ANONYMIZED_SAMPLE_SIZE`) rather than resolving to `undefined`.
    const range = await firstValueFrom(
      adapter.getBenchmark({ expertiseAreas: ['Domaine Inconnu Sans Correspondance'], currency: 'CHF', period: 'YEAR' }),
    );

    expect(range).toBeDefined();
    expect(range!.sampleSize).toBeGreaterThanOrEqual(5);
  });

  it('givenPoolBelowAnonymizationThreshold_whenGetBenchmark_thenResolvesUndefined', async () => {
    const adapter = new SalaryBenchmarkMockAdapter();

    // "Cloud" only has 2 matching demo samples — strictly below `MIN_ANONYMIZED_SAMPLE_SIZE` (5),
    // so no range should ever be computed from it alone.
    const range = await firstValueFrom(adapter.getBenchmark({ expertiseAreas: ['Cloud'], currency: 'CHF', period: 'YEAR' }));

    expect(range).toBeUndefined();
  });

  it('givenNonChfCurrency_whenGetBenchmark_thenResolvesUndefined', async () => {
    const adapter = new SalaryBenchmarkMockAdapter();

    const range = await firstValueFrom(
      adapter.getBenchmark({ expertiseAreas: ['Intelligence Artificielle'], currency: 'EUR', period: 'YEAR' }),
    );

    expect(range).toBeUndefined();
  });
});
