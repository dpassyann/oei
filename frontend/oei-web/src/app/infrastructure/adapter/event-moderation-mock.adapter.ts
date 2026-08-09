import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EventModerationPort } from '../../domain/port/event/event-moderation.port';
import { EventProposal } from '../../domain/model/event/event-proposal';
import { getEventProposals, setEventProposalStatus } from './event-proposal-mock.adapter';

// Shares its in-memory "table" with `EventProposalMockAdapter` (see that file's
// `getEventProposals`/`setEventProposalStatus`), same relationship as
// `ArticleModerationMockAdapter` reading/writing `ArticleSubmissionMockAdapter`'s submissions —
// there is exactly one demo dataset for event proposals, not two parallel ones.
@Service()
export class EventModerationMockAdapter implements EventModerationPort {
  listPending(): Observable<EventProposal[]> {
    return of(getEventProposals().filter((proposal) => proposal.status === 'MODERATOR_REVIEW'));
  }

  approve(id: string): Observable<void> {
    const updated = setEventProposalStatus(id, 'APPROVED');
    if (!updated) {
      return throwError(() => new Error(`Event proposal "${id}" not found.`));
    }
    return of(undefined);
  }

  reject(id: string, reason?: string): Observable<void> {
    const updated = setEventProposalStatus(id, 'REJECTED', reason);
    if (!updated) {
      return throwError(() => new Error(`Event proposal "${id}" not found.`));
    }
    return of(undefined);
  }

  requestChanges(id: string, reason: string): Observable<void> {
    const updated = setEventProposalStatus(id, 'CHANGES_REQUESTED', reason);
    if (!updated) {
      return throwError(() => new Error(`Event proposal "${id}" not found.`));
    }
    return of(undefined);
  }

  hideComment(_commentId: string): Observable<void> {
    // Minimal mock: the feed's comment list is a separate in-memory store
    // (`event-feed-mock.adapter.ts`) not wired for cross-adapter mutation in V1 — a future,
    // properly-layered mock backend can share state directly. Kept as a no-op-but-successful
    // call so the moderation UI's "hide" action has somewhere real to call.
    return of(undefined);
  }
}
