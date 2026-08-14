import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GitSynchronizationPort } from '../../domain/port/governance/git-synchronization.port';
import { GitSyncedFile, GitSynchronization } from '../../domain/model/governance/content-contribution.model';

// Matches `/api/admin/v1/git/synchronize(s)` and `GET .../synchronizations/latest/files`
// (`listLatestGitSyncedFiles`) in `openapi/oei-api.yaml` — all four operations are defined by the
// contract, including the synced-files listing.
//
// Endpoints under `/api/admin/v1/**` are role-versioned per ADR 0002 and use a literal prefix
// rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1` public-site
// base and is only overridable for that historical `home-legacy` family of endpoints).
const GIT_SYNCHRONIZATION_API_BASE = '/api/admin/v1/git';

@Service()
export class GitSynchronizationApiAdapter implements GitSynchronizationPort {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return GIT_SYNCHRONIZATION_API_BASE;
  }

  trigger(): Observable<GitSynchronization> {
    return this.http.post<GitSynchronization>(`${this.baseUrl}/synchronize`, {});
  }

  list(): Observable<GitSynchronization[]> {
    return this.http.get<GitSynchronization[]>(`${this.baseUrl}/synchronizations`);
  }

  getById(id: string): Observable<GitSynchronization> {
    return this.http.get<GitSynchronization>(`${this.baseUrl}/synchronizations/${id}`);
  }

  listSyncedFiles(): Observable<GitSyncedFile[]> {
    return this.http.get<GitSyncedFile[]>(`${this.baseUrl}/synchronizations/latest/files`);
  }
}
