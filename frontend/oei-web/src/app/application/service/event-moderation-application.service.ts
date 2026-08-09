import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EVENT_MODERATION_PORT } from '../../domain/port/event/event-moderation.port';
import { EventProposal } from '../../domain/model/event/event-proposal';

@Service()
export class EventModerationApplicationService {
  private readonly port = inject(EVENT_MODERATION_PORT);

  listPending(): Observable<EventProposal[]> {
    return this.port.listPending();
  }

  approve(id: string): Observable<void> {
    return this.port.approve(id);
  }

  reject(id: string, reason?: string): Observable<void> {
    return this.port.reject(id, reason);
  }

  requestChanges(id: string, reason: string): Observable<void> {
    return this.port.requestChanges(id, reason);
  }

  hideComment(commentId: string): Observable<void> {
    return this.port.hideComment(commentId);
  }
}
