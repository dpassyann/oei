import { InjectionToken } from '@angular/core';

export interface LeadCapturePort {
  submit(email: string): Promise<void>;
}

export const LEAD_CAPTURE_PORT = new InjectionToken<LeadCapturePort>('LeadCapturePort');
