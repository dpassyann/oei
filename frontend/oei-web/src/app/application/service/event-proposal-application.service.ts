import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EventProposalDraft, EVENT_PROPOSAL_PORT } from '../../domain/port/event/event-proposal.port';
import { EventProposal } from '../../domain/model/event/event-proposal';

@Service()
export class EventProposalApplicationService {
  private readonly port = inject(EVENT_PROPOSAL_PORT);

  submit(draft: EventProposalDraft): Observable<EventProposal> {
    return this.port.submit(draft);
  }

  listMine(): Observable<EventProposal[]> {
    return this.port.listMine();
  }
}
