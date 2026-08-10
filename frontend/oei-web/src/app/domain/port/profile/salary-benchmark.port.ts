import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SalaryBenchmarkQuery, SalaryBenchmarkRange } from '../../model/profile/salary-benchmark';

export interface SalaryBenchmarkPort {
  // Resolves to `undefined` when there isn't enough matching demo data to form a meaningful
  // range yet, or when the query's currency doesn't match any sample (no fake FX conversion) —
  // a value state, not an error, matching the `PublicProfilePort.getBySlug`-style convention.
  getBenchmark(query: SalaryBenchmarkQuery): Observable<SalaryBenchmarkRange | undefined>;
}

export const SALARY_BENCHMARK_PORT = new InjectionToken<SalaryBenchmarkPort>('SalaryBenchmarkPort');
