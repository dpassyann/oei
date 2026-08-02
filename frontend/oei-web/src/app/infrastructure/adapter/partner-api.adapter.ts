import { Service, inject } from '@angular/core';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class PartnerApiAdapter implements PartnerRepositoryPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getPartners(lang: string): Promise<Partner[]> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/partners/${lang}`);
    if (!response.ok) {
      throw new Error(`getPartners failed with status ${response.status}`);
    }
    const data = (await response.json()) as Partner[];
    return data.map((partner) => createPartner(partner));
  }

  async getPartner(id: string, lang: string): Promise<Partner> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/partners/${lang}/${id}`);
    if (!response.ok) {
      throw new Error(`getPartner failed with status ${response.status}`);
    }
    const data = (await response.json()) as Partner;
    return createPartner(data);
  }
}
