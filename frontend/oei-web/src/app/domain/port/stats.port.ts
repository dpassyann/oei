import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Stat } from '../model/stat';

export interface StatsPort {
  getHomeStats(lang: string): Observable<Stat[]>;
}

export const STATS_PORT = new InjectionToken<StatsPort>('StatsPort');
