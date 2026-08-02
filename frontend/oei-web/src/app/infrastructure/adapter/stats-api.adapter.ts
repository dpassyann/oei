import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StatsPort } from '../../domain/port/stats.port';
import { createStat, Stat } from '../../domain/model/stat';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class StatsApiAdapter implements StatsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getHomeStats(): Promise<Stat[]> {
    const response = await firstValueFrom(this.http.get<Stat[]>(`${this.runtimeConfig.apiBaseUrl()}/stats`));
    return response.map((stat) => createStat(stat));
  }
}
