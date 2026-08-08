import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ArticleModerationApplicationService } from '../../../../application/service/article-moderation-application.service';
import { ArticleSubmission } from '../../../../domain/model/article/article-submission';
import { I18nService } from '../../../i18n/i18n.service';

/** CMS moderation queue for member-submitted articles (`ArticleSubmission`): lists submissions
 * pending review and lets an admin/member-with-CMS-access approve or reject each one. Approving
 * makes the article appear in `/actualites` (see `NewsMockAdapter.getLatestNews`, which merges
 * `getApprovedArticleSubmissions()` into the same feed as editorial news — no parallel
 * publication list). Route: `/cms/moderation`, sibling of `/cms/contributions`, guarded by the
 * same `cmsGuard` as the rest of `/cms`. */
@Component({
  selector: 'oei-cms-moderation',
  imports: [RouterLink],
  templateUrl: './cms-moderation.html',
  styleUrl: './cms-moderation.scss',
})
export class CmsModeration {
  private readonly moderationService = inject(ArticleModerationApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly pendingResource = rxResource({
    params: () => true,
    stream: () => this.moderationService.listPending(),
  });
  protected readonly pending = computed(() => this.pendingResource.value() ?? []);

  protected readonly processingId = signal<string | null>(null);
  protected readonly rejectingId = signal<string | null>(null);
  protected readonly rejectReason = signal('');

  onRejectReasonChange(value: string): void {
    this.rejectReason.set(value);
  }

  startReject(submission: ArticleSubmission): void {
    this.rejectingId.set(submission.id);
    this.rejectReason.set('');
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  approve(submission: ArticleSubmission): void {
    this.processingId.set(submission.id);
    this.moderationService.approve(submission.id).subscribe({
      next: () => {
        this.processingId.set(null);
        this.pendingResource.reload();
      },
      error: () => this.processingId.set(null),
    });
  }

  reject(submission: ArticleSubmission): void {
    this.processingId.set(submission.id);
    this.moderationService.reject(submission.id, this.rejectReason() || undefined).subscribe({
      next: () => {
        this.processingId.set(null);
        this.rejectingId.set(null);
        this.rejectReason.set('');
        this.pendingResource.reload();
      },
      error: () => this.processingId.set(null),
    });
  }
}
