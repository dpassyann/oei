import { InjectionToken } from '@angular/core';
import { Partner } from '../model/partner';

export interface PartnerRepositoryPort {
  getPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner>;
}

export const PARTNER_REPOSITORY_PORT = new InjectionToken<PartnerRepositoryPort>('PartnerRepositoryPort');
