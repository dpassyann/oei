import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InstitutionBadgeProposalCreation,
  InstitutionBadgeProposalsPort,
} from '../../domain/port/institution/institution-badge-proposals.port';
import { InstitutionBadgeProposal } from '../../domain/model/institution/institution-badge-proposal';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionBadgeProposalsApiAdapter implements InstitutionBadgeProposalsPort {
  private readonly http = inject(HttpClient);

  listBadgeProposals(): Observable<InstitutionBadgeProposal[]> {
    return this.http.get<InstitutionBadgeProposal[]>(`${INSTITUTION_API_BASE}/badge-proposals`);
  }

  createBadgeProposal(creation: InstitutionBadgeProposalCreation): Observable<InstitutionBadgeProposal> {
    return this.http.post<InstitutionBadgeProposal>(`${INSTITUTION_API_BASE}/badge-proposals`, creation);
  }
}
