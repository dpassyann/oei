import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BadgeAward } from '../../model/badge/badge';

export interface BadgePort {
  listMyBadgeAwards(): Observable<BadgeAward[]>;
}

export const BADGE_PORT = new InjectionToken<BadgePort>('BadgePort');
