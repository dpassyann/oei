import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SalaryBenchmarkPort } from '../../domain/port/profile/salary-benchmark.port';
import { SalaryBenchmarkQuery, SalaryBenchmarkRange } from '../../domain/model/profile/salary-benchmark';
import { CompensationPeriod } from '../../domain/model/profile/professional-profile';
import { MIN_ANONYMIZED_SAMPLE_SIZE } from '../../domain/model/shared/anonymization';

// Demonstration-only anonymized sample, deliberately small and clearly fictional (no real
// member compensation data exists yet — see `CurrentCompensation`'s doc comment). Each entry
// pairs a domain label (matching the vocabulary already used in `domains-mock.adapter.ts`'s
// expertise areas) with an annual CHF figure. As real members start entering their own
// compensation, this mock is meant to be replaced by a real backend aggregation endpoint
// (`SalaryBenchmarkApiAdapter`) computing the same shape from actual, anonymized data — never
// individual figures, per `SalaryBenchmarkRange`'s doc comment.
const DEMO_SAMPLES: readonly { readonly domain: string; readonly annualChf: number }[] = [
  { domain: 'Cybersécurité', annualChf: 95000 },
  { domain: 'Cybersécurité', annualChf: 118000 },
  { domain: 'Cybersécurité', annualChf: 132000 },
  { domain: 'Intelligence Artificielle', annualChf: 105000 },
  { domain: 'Intelligence Artificielle', annualChf: 140000 },
  { domain: 'Intelligence Artificielle', annualChf: 155000 },
  { domain: 'Cloud', annualChf: 100000 },
  { domain: 'Cloud', annualChf: 125000 },
  { domain: 'Génie Logiciel', annualChf: 90000 },
  { domain: 'Génie Logiciel', annualChf: 115000 },
  { domain: 'Data', annualChf: 98000 },
  { domain: 'Data', annualChf: 128000 },
  { domain: 'Architecture', annualChf: 120000 },
  { domain: 'Architecture', annualChf: 145000 },
  { domain: 'Systèmes Critiques', annualChf: 110000 },
];

const MONTHS_PER_YEAR = 12;

function toPeriod(annualChf: number, period: CompensationPeriod): number {
  return period === 'MONTH' ? Math.round(annualChf / MONTHS_PER_YEAR) : annualChf;
}

@Service()
export class SalaryBenchmarkMockAdapter implements SalaryBenchmarkPort {
  getBenchmark(query: SalaryBenchmarkQuery): Observable<SalaryBenchmarkRange | undefined> {
    if (query.currency.toUpperCase() !== 'CHF') {
      // No fake currency conversion in this mock — only CHF queries resolve to a range.
      return of(undefined);
    }
    const matches = DEMO_SAMPLES.filter((sample) => query.expertiseAreas.includes(sample.domain));
    const pool = matches.length > 0 ? matches : DEMO_SAMPLES;
    // Anonymization gate — shared with `NetworkGraphPort.getSalaryInsight`'s mock, see
    // `MIN_ANONYMIZED_SAMPLE_SIZE`'s doc comment. A pool that ends up too small (e.g. a niche
    // domain with only a couple of matching demo samples) never becomes a range, however
    // tempting it would be to still show "something" — that's exactly the case this threshold
    // exists to catch.
    if (pool.length < MIN_ANONYMIZED_SAMPLE_SIZE) {
      return of(undefined);
    }
    const values = pool.map((sample) => toPeriod(sample.annualChf, query.period));
    return of({
      low: Math.min(...values),
      high: Math.max(...values),
      currency: 'CHF',
      period: query.period,
      sampleSize: pool.length,
    });
  }
}
