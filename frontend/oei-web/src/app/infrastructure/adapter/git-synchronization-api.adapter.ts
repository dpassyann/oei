import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GitSynchronizationPort } from '../../domain/port/governance/git-synchronization.port';
import { GitSyncedFile, GitSynchronization } from '../../domain/model/governance/content-contribution.model';
import { RuntimeConfig } from '../config/runtime-config';

// Matches `/api/admin/v1/git/synchronize(s)` in `openapi/oei-api.yaml`. `listSyncedFiles` has no
// dedicated OpenAPI operation (the contract only exposes synchronization *runs*, not raw file
// listings) — modeled here as a sub-resource of the synchronize endpoint, consistent with ADR
// 0002's "extend rather than invent a parallel convention" guidance.
@Service()
export class GitSynchronizationApiAdapter implements GitSynchronizationPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  private get baseUrl(): string {
    return `${this.runtimeConfig.apiBaseUrl()}/admin/v1/git`;
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
