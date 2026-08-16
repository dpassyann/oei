import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AdminMenusPort, MenuEntryInput } from '../../domain/port/admin/admin-menus.port';
import { createMenuEntry, MenuEntry } from '../../domain/model/admin/admin-menu-entry';

// Seed data approximates the real, currently-static nav (see `SiteHeader.navLinks`/
// `resourceLinks` for `header`, `SiteFooter.legalLinks` for `footer`) so the admin table starts
// from something recognizable rather than an empty list. This mock never writes back to either
// component — there is no real menu-driven-by-backend nav yet (see `AdminMenusApiAdapter`'s doc
// comment); building that wiring is out of scope for this admin CRUD screen.
function buildSeedMenuEntries(): MenuEntry[] {
  return [
    createMenuEntry({ id: 'menu-home', labelKey: 'nav.home', route: '/', order: 1, zone: 'header' }),
    createMenuEntry({ id: 'menu-about', labelKey: 'nav.about', route: '/a-propos', order: 2, zone: 'header' }),
    createMenuEntry({ id: 'menu-missions', labelKey: 'nav.missions', route: '/nos-missions', order: 3, zone: 'header' }),
    createMenuEntry({ id: 'menu-ethics', labelKey: 'nav.ethics', route: '/deontologie', order: 4, zone: 'header' }),
    createMenuEntry({ id: 'menu-certifications', labelKey: 'nav.certifications', route: '/certifications', order: 5, zone: 'header' }),
    createMenuEntry({ id: 'menu-news', labelKey: 'nav.news', route: '/actualites', order: 6, zone: 'header' }),
    createMenuEntry({ id: 'menu-partners', labelKey: 'nav.partners', route: '/partenaires', order: 7, zone: 'header' }),
    createMenuEntry({ id: 'menu-contact', labelKey: 'nav.contact', route: '/contact', order: 8, zone: 'header' }),
    createMenuEntry({ id: 'menu-events', labelKey: 'nav.events', route: '/events', order: 9, zone: 'header' }),
    createMenuEntry({ id: 'menu-resources', labelKey: 'nav.resources', route: '/ressources', order: 10, zone: 'header' }),
    createMenuEntry({ id: 'menu-legal-notices', labelKey: 'nav.legalNotices', route: '/mentions-legales', order: 1, zone: 'footer' }),
    createMenuEntry({ id: 'menu-sitemap', labelKey: 'nav.sitemap', route: '/plan-du-site', order: 2, zone: 'footer' }),
  ];
}

let entries: MenuEntry[] = buildSeedMenuEntries();

export function resetAdminMenusFixtures(): void {
  entries = buildSeedMenuEntries();
}

function findOrThrow(id: string): MenuEntry {
  const found = entries.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`Menu entry "${id}" not found.`);
  }
  return found;
}

function replace(id: string, updated: MenuEntry): void {
  entries = entries.map((entry) => (entry.id === id ? updated : entry));
}

@Service()
export class AdminMenusMockAdapter implements AdminMenusPort {
  list(): Observable<MenuEntry[]> {
    return of([...entries]);
  }

  create(input: MenuEntryInput): Observable<MenuEntry> {
    const id = `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const zoneEntries = entries.filter((entry) => entry.zone === input.zone);
    const nextOrder = zoneEntries.length > 0 ? Math.max(...zoneEntries.map((entry) => entry.order)) + 1 : 1;
    const created = createMenuEntry({ id, labelKey: input.labelKey, route: input.route, zone: input.zone, order: nextOrder, active: true });
    entries = [...entries, created];
    return of(created);
  }

  update(id: string, input: MenuEntryInput): Observable<MenuEntry> {
    try {
      const existing = findOrThrow(id);
      const updated = createMenuEntry({ ...existing, labelKey: input.labelKey, route: input.route, zone: input.zone });
      replace(id, updated);
      return of(updated);
    } catch (error) {
      return throwError(() => error);
    }
  }

  setActive(id: string, active: boolean): Observable<MenuEntry> {
    try {
      const existing = findOrThrow(id);
      const updated = createMenuEntry({ ...existing, active });
      replace(id, updated);
      return of(updated);
    } catch (error) {
      return throwError(() => error);
    }
  }

  reorder(id: string, newOrder: number): Observable<MenuEntry[]> {
    try {
      const existing = findOrThrow(id);
      const updated = createMenuEntry({ ...existing, order: newOrder });
      replace(id, updated);
      return of([...entries]);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
