import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { GitSyncedFile, GitSynchronization } from '../../model/governance/content-contribution.model';

/**
 * Read-only Git synchronization port (mocked end-to-end: no real webhook/CI, no network call —
 * fixtures simulate commits/files from the normative repository). Matches
 * `/api/admin/v1/git/synchronize` and `/api/admin/v1/git/synchronizations`.
 */
export interface GitSynchronizationPort {
  trigger(): Observable<GitSynchronization>;
  list(): Observable<GitSynchronization[]>;
  getById(id: string): Observable<GitSynchronization>;
  /** Files pulled by the last (mocked) synchronization — front-matter + Markdown body, as a real
   * `git show`/webhook payload would surface them. */
  listSyncedFiles(): Observable<GitSyncedFile[]>;
}

export const GIT_SYNCHRONIZATION_PORT = new InjectionToken<GitSynchronizationPort>('GitSynchronizationPort');
