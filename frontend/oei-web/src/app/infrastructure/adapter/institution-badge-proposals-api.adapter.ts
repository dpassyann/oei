import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InstitutionBadgeProposalCreation,
  InstitutionBadgeProposalsPort,
} from '../../domain/port/institution/institution-badge-proposals.port';
import { InstitutionBadgeProposal } from '../../domain/model/institution/institution-badge-proposal';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionBadgeProposalsApiAdapter implements InstitutionBadgeProposalsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listBadgeProposals(): Observable<InstitutionBadgeProposal[]> {
    return this.http.get<InstitutionBadgeProposal[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/badge-proposals`);
  }

  createBadgeProposal(creation: InstitutionBadgeProposalCreation): Observable<InstitutionBadgeProposal> {
    return this.http.post<InstitutionBadgeProposal>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/badge-proposals`, creation);
  }
}
