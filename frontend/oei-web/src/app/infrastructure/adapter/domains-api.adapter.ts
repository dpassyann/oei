import { Service, inject } from '@angular/core';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class DomainsApiAdapter implements DomainsPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getDomainAreas(): Promise<DomainArea[]> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/domains`);
    if (!response.ok) {
      throw new Error(`getDomainAreas failed with status ${response.status}`);
    }
    const data = (await response.json()) as DomainArea[];
    return data.map((domain) => createDomainArea(domain));
  }
}
