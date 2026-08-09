import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { I18nService } from '../../../i18n/i18n.service';

@Component({
  selector: 'oei-admin-institutions-list',
  imports: [RouterLink],
  templateUrl: './admin-institutions-list.html',
  styleUrl: './admin-institutions-list.scss',
})
export class AdminInstitutionsList {
  private readonly institutionsService = inject(AdminInstitutionsApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly institutionsResource = rxResource({
    params: () => true,
    stream: () => this.institutionsService.list(),
  });

  protected readonly institutions = computed(() => this.institutionsResource.value() ?? []);
}
