import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { InstitutionAccountApplicationService } from '../../../../application/service/institution-account-application.service';
import { InstitutionDashboardApplicationService } from '../../../../application/service/institution-dashboard-application.service';
import { I18nService } from '../../../i18n/i18n.service';

// Les 11 KPI du dashboard institutionnel (doc 03 §"Dashboard"), rendus par un `@for` plutôt que
// des champs répétés dans le template — chaque `key` résout `espaceInstitution.dashboard.kpis.<key>`.
const KPI_KEYS = [
  'affiliatedMembers',
  'activeMembers',
  'verifiedProfiles',
  'certifications',
  'badges',
  'signedCharters',
  'contributions',
  'trainings',
  'opportunities',
  'publications',
  'invitations',
] as const;

@Component({
  selector: 'oei-institution-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class InstitutionDashboard {
  private readonly accountService = inject(InstitutionAccountApplicationService);
  private readonly dashboardService = inject(InstitutionDashboardApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly kpiKeys = KPI_KEYS;

  private readonly institutionResource = rxResource({
    params: () => true,
    stream: () => this.accountService.getMyInstitution(),
  });

  private readonly partnershipResource = rxResource({
    params: () => true,
    stream: () => this.accountService.getMyPartnership(),
  });

  private readonly dashboardResource = rxResource({
    params: () => true,
    stream: () => this.dashboardService.getDashboard(),
  });

  protected readonly institution = computed(() => this.institutionResource.value());
  protected readonly partnership = computed(() => this.partnershipResource.value());
  protected readonly dashboard = computed(() => this.dashboardResource.value());

  protected kpiValue(key: (typeof KPI_KEYS)[number]): number | undefined {
    return this.dashboard()?.[key];
  }
}
