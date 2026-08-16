import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminEmailTemplatesApplicationService } from '../../../../application/service/admin-email-templates-application.service';
import { I18nService } from '../../../i18n/i18n.service';

@Component({
  selector: 'oei-admin-email-templates-list',
  imports: [RouterLink],
  templateUrl: './admin-email-templates-list.html',
  styleUrl: './admin-email-templates-list.scss',
})
export class AdminEmailTemplatesList {
  private readonly templatesService = inject(AdminEmailTemplatesApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly templatesResource = rxResource({
    params: () => true,
    stream: () => this.templatesService.list(),
  });

  protected readonly templates = computed(() => this.templatesResource.value() ?? []);
}
