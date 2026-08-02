import { InjectionToken } from '@angular/core';
import { Stat } from '../model/stat';

export interface StatsPort {
  getHomeStats(): Promise<Stat[]>;
}

export const STATS_PORT = new InjectionToken<StatsPort>('StatsPort');
