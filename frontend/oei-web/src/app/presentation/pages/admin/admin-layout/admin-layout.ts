import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { AdminSection, visibleSections } from '../../../../domain/model/admin/admin-role';

interface AdminNavEntry {
  readonly section: AdminSection;
  readonly path: string;
  readonly labelKey: string;
}

// Fixed order matching `ADMIN_SECTIONS` — filtered per-request by `visibleSections()` so each
// role only sees the sections it has permission for (task brief §RBAC: "Principe du moindre
// privilège"). `articles`/`members`/`events`/`resources` link out to existing pages (CMS,
// espace-institution, etc.) rather than duplicating their UI — see each entry's `path`.
const NAV_ENTRIES: readonly AdminNavEntry[] = [
  { section: 'dashboard', path: '/admin', labelKey: 'admin.nav.dashboard' },
  { section: 'articles', path: '/cms', labelKey: 'admin.nav.articles' },
  { section: 'institutions', path: '/admin/institutions', labelKey: 'admin.nav.institutions' },
  { section: 'members', path: '/admin/members', labelKey: 'admin.nav.members' },
  { section: 'events', path: '/actualites', labelKey: 'admin.nav.events' },
  { section: 'resources', path: '/ressources', labelKey: 'admin.nav.resources' },
  { section: 'certifications', path: '/admin/certifications', labelKey: 'admin.nav.certifications' },
  { section: 'menus', path: '/admin/menus', labelKey: 'admin.nav.menus' },
  { section: 'translations', path: '/admin/traductions', labelKey: 'admin.nav.translations' },
  { section: 'email-templates', path: '/admin/templates-email', labelKey: 'admin.nav.emailTemplates' },
  { section: 'home-blocks', path: '/admin/blocs-home', labelKey: 'admin.nav.homeBlocks' },
  { section: 'audit-log', path: '/admin/audit-log', labelKey: 'admin.nav.auditLog' },
];

/**
 * Admin console shell: sidebar nav (filtered by role via `visibleSections`) + `<router-outlet>`
 * for the admin child routes. Sits inside the global `<oei-site-header>`/`<oei-site-footer>`
 * (see `app.html`) like every other page — it only owns the layout *within* the routed area.
 */
@Component({
  selector: 'oei-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly keycloakAuth = inject(KeycloakAuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly navEntries = computed(() => {
    const roles = this.keycloakAuth.getRoles();
    const allowed = new Set(visibleSections(roles));
    return NAV_ENTRIES.filter((entry) => allowed.has(entry.section));
  });
}
