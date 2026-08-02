import { Service, inject } from '@angular/core';
import { LeadCapturePort } from '../../domain/port/lead-capture.port';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class LeadCaptureApiAdapter implements LeadCapturePort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async submit(email: string): Promise<void> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(`submit failed with status ${response.status}`);
    }
  }
}
