import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GIT_SYNCHRONIZATION_PORT } from '../../domain/port/governance/git-synchronization.port';
import { GitSyncedFile, GitSynchronization } from '../../domain/model/governance/content-contribution.model';

@Service()
export class GitSynchronizationApplicationService {
  private readonly port = inject(GIT_SYNCHRONIZATION_PORT);

  trigger(): Observable<GitSynchronization> {
    return this.port.trigger();
  }

  list(): Observable<GitSynchronization[]> {
    return this.port.list();
  }

  getById(id: string): Observable<GitSynchronization> {
    return this.port.getById(id);
  }

  listSyncedFiles(): Observable<GitSyncedFile[]> {
    return this.port.listSyncedFiles();
  }
}
