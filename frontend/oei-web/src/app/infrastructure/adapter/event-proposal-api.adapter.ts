import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EventProposalDraft, EventProposalPort } from '../../domain/port/event/event-proposal.port';
import { createEventProposal, EventProposal } from '../../domain/model/event/event-proposal';

// `POST /api/member/v1/events/proposals` per the task's literal contract; `GET` on the same
// collection for "mes propositions" (same convention as `ArticleSubmissionApiAdapter`).
const EVENT_PROPOSAL_API_BASE = '/api/member/v1';

@Service()
export class EventProposalApiAdapter implements EventProposalPort {
  private readonly http = inject(HttpClient);

  submit(draft: EventProposalDraft): Observable<EventProposal> {
    return this.http
      .post<EventProposal>(`${EVENT_PROPOSAL_API_BASE}/events/proposals`, draft)
      .pipe(map((proposal) => createEventProposal(proposal)));
  }

  listMine(): Observable<EventProposal[]> {
    return this.http
      .get<EventProposal[]>(`${EVENT_PROPOSAL_API_BASE}/events/proposals`)
      .pipe(map((proposals) => proposals.map((proposal) => createEventProposal(proposal))));
  }
}
