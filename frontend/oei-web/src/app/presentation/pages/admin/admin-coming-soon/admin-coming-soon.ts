import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { I18nService } from '../../../i18n/i18n.service';

/**
 * Shared placeholder for admin sections that don't have a real UI yet (task brief: "menus,
 * traductions, templates email, blocs home — each a small functional page that fetches a static
 * 'coming soon' list from i18n"). Which section it renders is driven by the route's `data.section`
 * (see `app.routes.ts`'s `/admin/menus|traductions|templates-email|blocs-home` entries), so one
 * component covers all four rather than four near-identical copies.
 */
@Component({
  selector: 'oei-admin-coming-soon',
  templateUrl: './admin-coming-soon.html',
  styleUrl: './admin-coming-soon.scss',
})
export class AdminComingSoon {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly section = toSignal(this.route.data.pipe(map((data) => (data['section'] as string) ?? 'menus')), {
    initialValue: 'menus',
  });

  protected readonly titleKey = computed(() => `admin.comingSoon.${this.section()}.title`);
  protected readonly introKey = computed(() => `admin.comingSoon.${this.section()}.intro`);
  protected readonly items = computed(() => this.i18n.translateList(`admin.comingSoon.${this.section()}.items`));
}
