import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminCertificationCatalogApplicationService } from '../../../../application/service/admin-certification-catalog-application.service';
import { I18nService } from '../../../i18n/i18n.service';

// Same shape (list page + `rxResource` + separate "new" route) as `AdminInstitutionsList` —
// see that component for the reasoning behind this pattern.
@Component({
  selector: 'oei-admin-certifications-catalog-list',
  imports: [RouterLink],
  templateUrl: './admin-certifications-catalog-list.html',
  styleUrl: './admin-certifications-catalog-list.scss',
})
export class AdminCertificationsCatalogList {
  private readonly catalogService = inject(AdminCertificationCatalogApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly catalogResource = rxResource({
    params: () => true,
    stream: () => this.catalogService.list(),
  });

  protected readonly certifications = computed(() => this.catalogResource.value() ?? []);
}
