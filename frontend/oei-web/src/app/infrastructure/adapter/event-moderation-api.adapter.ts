import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EventModerationPort } from '../../domain/port/event/event-moderation.port';
import { createEventProposal, EventProposal } from '../../domain/model/event/event-proposal';

const EVENT_ADMIN_API_BASE = '/api/admin/v1';

@Service()
export class EventModerationApiAdapter implements EventModerationPort {
  private readonly http = inject(HttpClient);

  listPending(): Observable<EventProposal[]> {
    return this.http
      .get<EventProposal[]>(`${EVENT_ADMIN_API_BASE}/events/moderation`)
      .pipe(map((proposals) => proposals.map((proposal) => createEventProposal(proposal))));
  }

  approve(id: string): Observable<void> {
    return this.http.post(`${EVENT_ADMIN_API_BASE}/events/${id}/approve`, {}).pipe(map(() => undefined));
  }

  reject(id: string, reason?: string): Observable<void> {
    return this.http.post(`${EVENT_ADMIN_API_BASE}/events/${id}/reject`, { reason }).pipe(map(() => undefined));
  }

  requestChanges(id: string, reason: string): Observable<void> {
    return this.http
      .post(`${EVENT_ADMIN_API_BASE}/events/${id}/request-changes`, { reason })
      .pipe(map(() => undefined));
  }

  hideComment(commentId: string): Observable<void> {
    return this.http.post(`${EVENT_ADMIN_API_BASE}/comments/${commentId}/hide`, {}).pipe(map(() => undefined));
  }
}
