import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminDashboardApplicationService } from '../../../../application/service/admin-dashboard-application.service';
import { I18nService } from '../../../i18n/i18n.service';

interface KpiTile {
  readonly labelKey: string;
  readonly value: number;
}

/**
 * Admin console landing page: static-but-credible KPI tiles (task brief §Dashboard) plus quick
 * links into the sections that already have a dedicated UI elsewhere (CMS, institutions,
 * partners, resources) rather than duplicating them here.
 */
@Component({
  selector: 'oei-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  private readonly dashboardService = inject(AdminDashboardApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly kpisResource = rxResource({
    params: () => true,
    stream: () => this.dashboardService.getKpis(),
  });

  protected readonly tiles = computed<readonly KpiTile[]>(() => {
    const kpis = this.kpisResource.value();
    if (!kpis) {
      return [];
    }
    return [
      { labelKey: 'admin.dashboard.kpis.activeMembers', value: kpis.activeMembers },
      { labelKey: 'admin.dashboard.kpis.expiredDues', value: kpis.expiredDues },
      { labelKey: 'admin.dashboard.kpis.institutions', value: kpis.institutions },
      { labelKey: 'admin.dashboard.kpis.pendingPublications', value: kpis.pendingPublications },
      { labelKey: 'admin.dashboard.kpis.events', value: kpis.events },
      { labelKey: 'admin.dashboard.kpis.reports', value: kpis.reports },
      { labelKey: 'admin.dashboard.kpis.emails', value: kpis.emails },
      { labelKey: 'admin.dashboard.kpis.errors', value: kpis.errors },
    ];
  });
}
