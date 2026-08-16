import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuEntry, MenuZone } from '../../model/admin/admin-menu-entry';

export interface MenuEntryInput {
  readonly labelKey: string;
  readonly route: string;
  readonly zone: MenuZone;
}

/**
 * Admin CRUD for site navigation entries (task brief §CMS "menus"). No hard delete: `setActive`
 * is the only "removal" operation, matching the soft-delete convention already used by
 * `AdminInstitutionsPort` (suspend/revoke rather than a physical delete). There is no
 * corresponding real backend endpoint yet (see `AdminMenusApiAdapter`'s doc comment) — this port
 * only documents the shape a future `/api/admin/v1/menu-entries` contract would need.
 */
export interface AdminMenusPort {
  list(): Observable<MenuEntry[]>;
  create(input: MenuEntryInput): Observable<MenuEntry>;
  update(id: string, input: MenuEntryInput): Observable<MenuEntry>;
  setActive(id: string, active: boolean): Observable<MenuEntry>;
  reorder(id: string, newOrder: number): Observable<MenuEntry[]>;
}

export const ADMIN_MENUS_PORT = new InjectionToken<AdminMenusPort>('AdminMenusPort');
