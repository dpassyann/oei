import { InjectionToken } from '@angular/core';
import { Partner } from '../model/partner';

export interface PartnerRepositoryPort {
  getPartners(lang: string): Promise<Partner[]>;
  getPartner(id: string, lang: string): Promise<Partner>;
}

export const PARTNER_REPOSITORY_PORT = new InjectionToken<PartnerRepositoryPort>('PartnerRepositoryPort');
