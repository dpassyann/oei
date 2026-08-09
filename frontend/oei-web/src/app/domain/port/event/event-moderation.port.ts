import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EventProposal } from '../../model/event/event-proposal';

// Admin/CMS-moderator queue for member-submitted `EventProposal`s (`GET /api/admin/v1/events/
// moderation`, `POST /api/admin/v1/events/{id}/approve`) plus feed-comment moderation
// (`POST /api/admin/v1/comments/{id}/hide`) — same guard as `/cms` (`cmsGuard`), see
// `presentation/pages/cms/cms-events-moderation/`. Distinct from `ArticleModerationPort`
// (articles) and `AdminContentPort` (editorial CMS content) — a separate, much simpler queue for
// this bounded context, per this task's brief ("garde tes mock adapters simples").
export interface EventModerationPort {
  listPending(): Observable<EventProposal[]>;
  approve(id: string): Observable<void>;
  reject(id: string, reason?: string): Observable<void>;
  requestChanges(id: string, reason: string): Observable<void>;
  hideComment(commentId: string): Observable<void>;
}

export const EVENT_MODERATION_PORT = new InjectionToken<EventModerationPort>('EventModerationPort');
