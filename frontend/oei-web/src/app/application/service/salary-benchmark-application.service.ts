import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SALARY_BENCHMARK_PORT } from '../../domain/port/profile/salary-benchmark.port';
import { SalaryBenchmarkQuery, SalaryBenchmarkRange } from '../../domain/model/profile/salary-benchmark';

@Service()
export class SalaryBenchmarkApplicationService {
  private readonly port = inject(SALARY_BENCHMARK_PORT);

  getBenchmark(query: SalaryBenchmarkQuery): Observable<SalaryBenchmarkRange | undefined> {
    return this.port.getBenchmark(query);
  }
}
