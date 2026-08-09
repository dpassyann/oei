import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EventProposalApplicationService } from './event-proposal-application.service';
import { EventProposalPort, EVENT_PROPOSAL_PORT } from '../../domain/port/event/event-proposal.port';

describe('EventProposalApplicationService', () => {
  function createService(port: Partial<EventProposalPort>): EventProposalApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: EVENT_PROPOSAL_PORT, useValue: port }] });
    return TestBed.inject(EventProposalApplicationService);
  }

  it('givenDraft_whenSubmit_thenDelegatesToPort', async () => {
    const submit = vi.fn().mockReturnValue(of({ id: 'proposal-1' }));
    const service = createService({ submit });
    const draft = {
      title: 'Titre',
      description: 'Description',
      type: 'meetup' as const,
      startAt: '2026-09-01T10:00:00.000Z',
      endAt: '2026-09-01T12:00:00.000Z',
      timezone: 'Europe/Paris',
      country: 'FR',
    };

    await firstValueFrom(service.submit(draft));

    expect(submit).toHaveBeenCalledWith(draft);
  });

  it('whenListMine_thenDelegatesToPort', async () => {
    const listMine = vi.fn().mockReturnValue(of([]));
    const service = createService({ listMine });

    await firstValueFrom(service.listMine());

    expect(listMine).toHaveBeenCalled();
  });
});
