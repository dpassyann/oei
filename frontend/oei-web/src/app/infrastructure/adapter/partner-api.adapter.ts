import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';
import { RuntimeConfig } from '../config/runtime-config';

@Injectable({ providedIn: 'root' })
export class PartnerApiAdapter implements PartnerRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getPartners(): Promise<Partner[]> {
    const response = await firstValueFrom(this.http.get<Partner[]>(`${this.runtimeConfig.apiBaseUrl()}/partners`));
    return response.map((partner) => createPartner(partner));
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await firstValueFrom(
      this.http.get<Partner>(`${this.runtimeConfig.apiBaseUrl()}/partners/${id}`),
    );
    return createPartner(response);
  }
}
