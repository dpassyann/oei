import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface LeadCapturePort {
  submit(email: string): Observable<void>;
}

export const LEAD_CAPTURE_PORT = new InjectionToken<LeadCapturePort>('LeadCapturePort');
