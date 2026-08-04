import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { GitSynchronizationApplicationService } from './git-synchronization-application.service';
import { GIT_SYNCHRONIZATION_PORT, GitSynchronizationPort } from '../../domain/port/governance/git-synchronization.port';

describe('GitSynchronizationApplicationService', () => {
  function createService(port: Partial<GitSynchronizationPort>): GitSynchronizationApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: GIT_SYNCHRONIZATION_PORT, useValue: port }] });
    return TestBed.inject(GitSynchronizationApplicationService);
  }

  it('givenTrigger_whenCalled_thenDelegatesToPort', async () => {
    const trigger = vi.fn().mockReturnValue(of({ id: 'sync-1', status: 'SUCCESS' }));
    const service = createService({ trigger });

    await firstValueFrom(service.trigger());

    expect(trigger).toHaveBeenCalled();
  });

  it('givenListSyncedFiles_whenCalled_thenDelegatesToPort', async () => {
    const listSyncedFiles = vi.fn().mockReturnValue(of([]));
    const service = createService({ listSyncedFiles });

    await firstValueFrom(service.listSyncedFiles());

    expect(listSyncedFiles).toHaveBeenCalled();
  });
});
