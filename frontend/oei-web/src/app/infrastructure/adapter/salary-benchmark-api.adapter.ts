import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { SalaryBenchmarkPort } from '../../domain/port/profile/salary-benchmark.port';
import { SalaryBenchmarkQuery, SalaryBenchmarkRange } from '../../domain/model/profile/salary-benchmark';

const SALARY_BENCHMARK_MEMBER_API_BASE = '/api/member/v1';

@Service()
export class SalaryBenchmarkApiAdapter implements SalaryBenchmarkPort {
  private readonly http = inject(HttpClient);

  getBenchmark(query: SalaryBenchmarkQuery): Observable<SalaryBenchmarkRange | undefined> {
    return this.http
      .get<SalaryBenchmarkRange>(`${SALARY_BENCHMARK_MEMBER_API_BASE}/salary-benchmark`, {
        params: {
          expertiseAreas: query.expertiseAreas.join(','),
          currency: query.currency,
          period: query.period,
        },
      })
      .pipe(catchError(() => of(undefined)));
  }
}
