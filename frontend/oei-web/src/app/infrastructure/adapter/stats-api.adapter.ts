import { Service, inject } from '@angular/core';
import { StatsPort } from '../../domain/port/stats.port';
import { createStat, Stat } from '../../domain/model/stat';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class StatsApiAdapter implements StatsPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getHomeStats(): Promise<Stat[]> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/stats`);
    if (!response.ok) {
      throw new Error(`getHomeStats failed with status ${response.status}`);
    }
    const data = (await response.json()) as Stat[];
    return data.map((stat) => createStat(stat));
  }
}
