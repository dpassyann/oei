import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DomainArea } from '../model/domain-area';

export interface DomainsPort {
  getDomainAreas(lang: string): Observable<DomainArea[]>;
}

export const DOMAINS_PORT = new InjectionToken<DomainsPort>('DomainsPort');
