import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EventProposal } from '../../model/event/event-proposal';
import { EventType } from '../../model/event/event';

// What a member fills in on the proposal form — never includes `id`/`authorId`/`status`/
// `submittedAt`/`aiPrecheck`, always server/adapter-assigned (same split as
// `ArticleSubmissionDraft` vs. `ArticleSubmission`).
export interface EventProposalDraft {
  readonly title: string;
  readonly description: string;
  readonly type: EventType;
  readonly startAt: string;
  readonly endAt: string;
  readonly timezone: string;
  readonly country: string;
  readonly city?: string;
  readonly venue?: string;
  readonly onlineUrl?: string;
  readonly imageUrl?: string;
}

// `POST /api/member/v1/events/proposals` (+ a `listMine()` read, same pattern as
// `ArticleSubmissionPort.listMine`, for the "mes propositions" history on the proposal form).
export interface EventProposalPort {
  submit(draft: EventProposalDraft): Observable<EventProposal>;
  listMine(): Observable<EventProposal[]>;
}

export const EVENT_PROPOSAL_PORT = new InjectionToken<EventProposalPort>('EventProposalPort');
