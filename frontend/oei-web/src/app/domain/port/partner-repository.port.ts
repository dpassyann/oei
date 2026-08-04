import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Partner } from '../model/partner';

export interface PartnerRepositoryPort {
  getPartners(lang: string): Observable<Partner[]>;
  getPartner(id: string, lang: string): Observable<Partner>;
}

export const PARTNER_REPOSITORY_PORT = new InjectionToken<PartnerRepositoryPort>('PartnerRepositoryPort');
