import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from '../../../i18n/i18n.service';

interface CmsNavEntry {
  readonly path: string;
  readonly labelKey: string;
  readonly exact: boolean;
}

// Fixed nav — every `/cms/**` page (content list, contributions, article moderation, event
// moderation) is reachable from here. Unlike `AdminLayout`'s nav, this one isn't filtered by
// role: `cmsGuard` (see `app.routes.ts`) already only lets `member`/`admin` reach `/cms` at all,
// and there is no finer-grained CMS role to filter on (ADR 0002 §Décision 2).
const NAV_ENTRIES: readonly CmsNavEntry[] = [
  { path: '/cms', labelKey: 'cms.nav.contentList', exact: true },
  { path: '/cms/contributions', labelKey: 'cms.nav.contributions', exact: false },
  { path: '/cms/moderation', labelKey: 'cms.nav.moderation', exact: false },
  { path: '/cms/events-moderation', labelKey: 'cms.nav.eventsModeration', exact: false },
];

/**
 * CMS back-office shell: sidebar nav + `<router-outlet>` for the `/cms/**` child routes. Sits
 * inside the global `<oei-site-header>`/`<oei-site-footer>` (see `app.html`) like every other
 * page — it only owns the layout *within* the routed area, exactly like `AdminLayout` does for
 * `/admin`.
 */
@Component({
  selector: 'oei-cms-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cms-layout.html',
  styleUrl: './cms-layout.scss',
})
export class CmsLayout {
  protected readonly i18n = inject(I18nService);
  protected readonly navEntries = NAV_ENTRIES;
}
