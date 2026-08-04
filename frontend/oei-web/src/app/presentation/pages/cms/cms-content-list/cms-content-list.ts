import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { GitSynchronizationApplicationService } from '../../../../application/service/git-synchronization-application.service';
import { CONTENT_TYPES, ContentType } from '../../../../domain/model/cms/content-type';
import { CONTENT_WORKFLOW_STATUS_VALUES, ContentWorkflowStatus } from '../../../../domain/model/cms/content.model';
import { I18nService } from '../../../i18n/i18n.service';

/** Back-office content list: filters (type/status/language/free text), workflow status per row,
 * and a small read-only Git synchronization panel (task brief points 3/6). */
@Component({
  selector: 'oei-cms-content-list',
  imports: [RouterLink],
  templateUrl: './cms-content-list.html',
  styleUrl: './cms-content-list.scss',
})
export class CmsContentList {
  private readonly contentService = inject(AdminContentApplicationService);
  private readonly gitSyncService = inject(GitSynchronizationApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly contentTypes = CONTENT_TYPES;
  protected readonly workflowStatuses = CONTENT_WORKFLOW_STATUS_VALUES;

  protected readonly typeFilter = signal<ContentType | ''>('');
  protected readonly statusFilter = signal<ContentWorkflowStatus | ''>('');
  protected readonly languageFilter = signal('');
  protected readonly queryFilter = signal('');

  private readonly contentResource = rxResource({
    params: () => ({
      type: this.typeFilter() || undefined,
      status: this.statusFilter() || undefined,
      lang: this.languageFilter() || undefined,
      q: this.queryFilter() || undefined,
    }),
    stream: ({ params }) => this.contentService.list(params),
  });

  protected readonly contents = computed(() => this.contentResource.value() ?? []);

  private readonly gitSyncResource = rxResource({
    params: () => true,
    stream: () => this.gitSyncService.list(),
  });

  protected readonly synchronizations = computed(() => this.gitSyncResource.value() ?? []);
  protected readonly lastSynchronization = computed(() => this.synchronizations().at(-1));

  protected readonly synchronizing = signal(false);

  onTypeFilterChange(value: string): void {
    this.typeFilter.set(value as ContentType | '');
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as ContentWorkflowStatus | '');
  }

  onLanguageFilterChange(value: string): void {
    this.languageFilter.set(value);
  }

  onQueryFilterChange(value: string): void {
    this.queryFilter.set(value);
  }

  triggerSynchronization(): void {
    this.synchronizing.set(true);
    this.gitSyncService.trigger().subscribe({
      next: () => {
        this.synchronizing.set(false);
        this.gitSyncResource.reload();
      },
      error: () => this.synchronizing.set(false),
    });
  }
}
