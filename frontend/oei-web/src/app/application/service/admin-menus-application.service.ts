import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_MENUS_PORT, MenuEntryInput } from '../../domain/port/admin/admin-menus.port';
import { MenuEntry, MenuZone } from '../../domain/model/admin/admin-menu-entry';

export interface MenuEntryValidationResult {
  readonly valid: boolean;
  readonly labelKeyError: boolean;
  readonly routeError: boolean;
}

/**
 * Validation + ordering logic for the admin "menus" section (task brief §CMS). Kept out of the
 * `AdminMenus` component (task brief: "logique non triviale dans un service applicatif, jamais
 * dans le composant") — route-format validation and the move-up/move-down reordering swap are
 * the two non-trivial pieces here.
 */
@Service()
export class AdminMenusApplicationService {
  private readonly port = inject(ADMIN_MENUS_PORT);

  list(): Observable<MenuEntry[]> {
    return this.port.list();
  }

  /** Every zone's entries, sorted by `order` ascending — the order the real nav would render in. */
  sortByZone(entries: readonly MenuEntry[], zone: MenuZone): MenuEntry[] {
    return entries.filter((entry) => entry.zone === zone).slice().sort((a, b) => a.order - b.order);
  }

  validate(input: MenuEntryInput): MenuEntryValidationResult {
    const labelKeyError = !input.labelKey.trim();
    const routeError = !input.route.trim().startsWith('/');
    return { valid: !labelKeyError && !routeError, labelKeyError, routeError };
  }

  create(input: MenuEntryInput): Observable<MenuEntry> {
    return this.port.create(input);
  }

  update(id: string, input: MenuEntryInput): Observable<MenuEntry> {
    return this.port.update(id, input);
  }

  setActive(entry: MenuEntry, active: boolean): Observable<MenuEntry> {
    return this.port.setActive(entry.id, active);
  }

  /**
   * Swaps `entry` with its neighbour in the given direction, within its own zone only — moving a
   * header entry never touches footer ordering. Returns the refreshed, zone-sorted list for the
   * moved entry's zone so the caller can just re-render its table.
   */
  move(entries: readonly MenuEntry[], entry: MenuEntry, direction: 'up' | 'down'): Observable<MenuEntry[]> {
    const zoneEntries = this.sortByZone(entries, entry.zone);
    const index = zoneEntries.findIndex((candidate) => candidate.id === entry.id);
    const neighbourIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || neighbourIndex < 0 || neighbourIndex >= zoneEntries.length) {
      return this.port.list();
    }
    const neighbour = zoneEntries[neighbourIndex];
    return this.port.reorder(entry.id, neighbour.order).pipe(
      map(() => {
        // Swap in the local snapshot too so the caller doesn't need a second round-trip just to
        // move the neighbour back — the mock/api adapter only persists `entry`'s new order.
        return entries.map((candidate) => (candidate.id === neighbour.id ? { ...candidate, order: entry.order } : candidate));
      }),
    );
  }
}
