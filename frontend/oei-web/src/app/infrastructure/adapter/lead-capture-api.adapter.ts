import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LeadCapturePort } from '../../domain/port/lead-capture.port';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class LeadCaptureApiAdapter implements LeadCapturePort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  async submit(email: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.runtimeConfig.apiBaseUrl()}/leads`, { email }));
  }
}
