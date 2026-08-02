import { InjectionToken } from '@angular/core';
import { DomainArea } from '../model/domain-area';

export interface DomainsPort {
  getDomainAreas(lang: string): Promise<DomainArea[]>;
}

export const DOMAINS_PORT = new InjectionToken<DomainsPort>('DomainsPort');
