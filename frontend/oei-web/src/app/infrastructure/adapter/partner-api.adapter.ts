import { Service, inject } from '@angular/core';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class PartnerApiAdapter implements PartnerRepositoryPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getPartners(): Promise<Partner[]> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/partners`);
    if (!response.ok) {
      throw new Error(`getPartners failed with status ${response.status}`);
    }
    const data = (await response.json()) as Partner[];
    return data.map((partner) => createPartner(partner));
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/partners/${id}`);
    if (!response.ok) {
      throw new Error(`getPartner failed with status ${response.status}`);
    }
    const data = (await response.json()) as Partner;
    return createPartner(data);
  }
}
