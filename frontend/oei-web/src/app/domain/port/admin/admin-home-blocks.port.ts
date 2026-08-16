import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeBlockConfig } from '../../model/admin/admin-home-block';

export interface HomeBlockUpdateInput {
  readonly label: string;
  readonly active: boolean;
}

/**
 * Admin-only view/edit of the home page's block ordering, activation and label (task brief §CMS
 * "blocs-home"). Deliberately separate from `HomeSectionsApplicationService`/`Home` — this port
 * never affects the actual rendering of `/` (see `AdminHomeBlocksMockAdapter`'s doc comment for
 * why wiring the two together is explicitly out of scope here).
 */
export interface AdminHomeBlocksPort {
  list(): Observable<HomeBlockConfig[]>;
  update(id: string, input: HomeBlockUpdateInput): Observable<HomeBlockConfig>;
  reorder(id: string, newOrder: number): Observable<HomeBlockConfig[]>;
}

export const ADMIN_HOME_BLOCKS_PORT = new InjectionToken<AdminHomeBlocksPort>('AdminHomeBlocksPort');
