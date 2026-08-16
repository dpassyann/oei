import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMenusPort, MenuEntryInput } from '../../domain/port/admin/admin-menus.port';
import { MenuEntry } from '../../domain/model/admin/admin-menu-entry';

// Speculative contract only: `/api/admin/v1/menu-entries` does not exist yet in
// `openapi/oei-api.yaml` — the site nav is still fully static (`SiteHeader`/`SiteFooter`). This
// adapter documents the shape a future backend-driven menu endpoint would need, following the
// same role-versioned `/api/admin/v1/**` prefix convention as `AdminInstitutionsApiAdapter`. It
// is wired in but never exercised outside of `RuntimeConfig.isMock() === false`, i.e. never in
// the demo/mock environment this project currently ships.
const ADMIN_MENUS_API_BASE = '/api/admin/v1/menu-entries';

@Service()
export class AdminMenusApiAdapter implements AdminMenusPort {
  private readonly http = inject(HttpClient);

  list(): Observable<MenuEntry[]> {
    return this.http.get<MenuEntry[]>(ADMIN_MENUS_API_BASE);
  }

  create(input: MenuEntryInput): Observable<MenuEntry> {
    return this.http.post<MenuEntry>(ADMIN_MENUS_API_BASE, input);
  }

  update(id: string, input: MenuEntryInput): Observable<MenuEntry> {
    return this.http.put<MenuEntry>(`${ADMIN_MENUS_API_BASE}/${id}`, input);
  }

  setActive(id: string, active: boolean): Observable<MenuEntry> {
    return this.http.patch<MenuEntry>(`${ADMIN_MENUS_API_BASE}/${id}`, { active });
  }

  reorder(id: string, newOrder: number): Observable<MenuEntry[]> {
    return this.http.patch<MenuEntry[]>(`${ADMIN_MENUS_API_BASE}/${id}/order`, { order: newOrder });
  }
}
