import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EventModerationApplicationService } from '../../../../application/service/event-moderation-application.service';
import { EventProposal } from '../../../../domain/model/event/event-proposal';
import { I18nService } from '../../../i18n/i18n.service';

type PendingAction = 'reject' | 'requestChanges';

// CMS moderation queue for member-submitted `EventProposal`s — mirrors `CmsModeration`'s
// (articles) pattern exactly, per this task's brief. Route: `/cms/events-moderation`, guarded by
// the same `cmsGuard` as the rest of `/cms`. Approving here is what would turn a proposal into a
// published `Event` on a real backend (out of scope for this mock, see `EventModerationPort`'s
// doc comment).
@Component({
  selector: 'oei-cms-events-moderation',
  imports: [RouterLink],
  templateUrl: './cms-events-moderation.html',
  styleUrl: './cms-events-moderation.scss',
})
export class CmsEventsModeration {
  private readonly moderationService = inject(EventModerationApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly pendingResource = rxResource({
    params: () => true,
    stream: () => this.moderationService.listPending(),
  });
  protected readonly pending = computed(() => this.pendingResource.value() ?? []);

  protected readonly processingId = signal<string | null>(null);
  protected readonly actionTargetId = signal<string | null>(null);
  protected readonly actionKind = signal<PendingAction | null>(null);
  protected readonly actionReason = signal('');

  onReasonChange(value: string): void {
    this.actionReason.set(value);
  }

  startReject(proposal: EventProposal): void {
    this.actionTargetId.set(proposal.id);
    this.actionKind.set('reject');
    this.actionReason.set('');
  }

  startRequestChanges(proposal: EventProposal): void {
    this.actionTargetId.set(proposal.id);
    this.actionKind.set('requestChanges');
    this.actionReason.set('');
  }

  cancelAction(): void {
    this.actionTargetId.set(null);
    this.actionKind.set(null);
    this.actionReason.set('');
  }

  approve(proposal: EventProposal): void {
    this.processingId.set(proposal.id);
    this.moderationService.approve(proposal.id).subscribe({
      next: () => {
        this.processingId.set(null);
        this.pendingResource.reload();
      },
      error: () => this.processingId.set(null),
    });
  }

  confirmReject(proposal: EventProposal): void {
    this.processingId.set(proposal.id);
    this.moderationService.reject(proposal.id, this.actionReason() || undefined).subscribe({
      next: () => {
        this.processingId.set(null);
        this.cancelAction();
        this.pendingResource.reload();
      },
      error: () => this.processingId.set(null),
    });
  }

  confirmRequestChanges(proposal: EventProposal): void {
    if (!this.actionReason().trim()) {
      return;
    }
    this.processingId.set(proposal.id);
    this.moderationService.requestChanges(proposal.id, this.actionReason()).subscribe({
      next: () => {
        this.processingId.set(null);
        this.cancelAction();
        this.pendingResource.reload();
      },
      error: () => this.processingId.set(null),
    });
  }
}
