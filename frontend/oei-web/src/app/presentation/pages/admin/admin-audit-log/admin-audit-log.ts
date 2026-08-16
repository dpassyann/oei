import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AdminAuditService } from '../../../../application/service/admin-audit.service';
import { I18nService } from '../../../i18n/i18n.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'oei-admin-audit-log',
  imports: [DatePipe],
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

  // Client-side pagination: the mock fixture grows with session activity (every mutating admin
  // action appends an audit entry, see `AdminAuditLogMockAdapter`) and a real backend's audit log
  // can grow unbounded, so the table is paged rather than rendering every row at once.
  protected readonly page = signal(0);

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.entries().length / PAGE_SIZE)));

  protected readonly pagedEntries = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.entries().slice(start, start + PAGE_SIZE);
  });

  protected previousPage(): void {
    this.page.update((current) => Math.max(0, current - 1));
  }

  protected nextPage(): void {
    this.page.update((current) => Math.min(this.pageCount() - 1, current + 1));
  }
}
