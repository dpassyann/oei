import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DigitalBusinessCard } from '../../model/wallet/digital-business-card';

export interface DigitalBusinessCardPort {
  generateCard(): Observable<DigitalBusinessCard>;
}

export const DIGITAL_BUSINESS_CARD_PORT = new InjectionToken<DigitalBusinessCardPort>('DigitalBusinessCardPort');
