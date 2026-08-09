import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminAuditService } from '../../../../application/service/admin-audit.service';
import { I18nService } from '../../../i18n/i18n.service';

@Component({
  selector: 'oei-admin-audit-log',
  templateUrl: './admin-audit-log.html',
  styleUrl: './admin-audit-log.scss',
})
export class AdminAuditLogPage {
  private readonly auditService = inject(AdminAuditService);
  protected readonly i18n = inject(I18nService);

  private readonly entriesResource = rxResource({
    params: () => true,
    stream: () => this.auditService.list(),
  });

  protected readonly entries = computed(() => this.entriesResource.value() ?? []);
}
