import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';
import { RuntimeConfig } from '../config/runtime-config';

@Injectable({ providedIn: 'root' })
export class DomainsApiAdapter implements DomainsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getDomainAreas(): Promise<DomainArea[]> {
    const response = await firstValueFrom(this.http.get<DomainArea[]>(`${this.runtimeConfig.apiBaseUrl()}/domains`));
    return response.map((domain) => createDomainArea(domain));
  }
}
