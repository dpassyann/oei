import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactMessage } from '../model/contact/contact-message';

export interface ContactPort {
  submit(message: ContactMessage): Observable<void>;
}

export const CONTACT_PORT = new InjectionToken<ContactPort>('ContactPort');
