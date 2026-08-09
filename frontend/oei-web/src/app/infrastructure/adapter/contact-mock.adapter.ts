import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContactPort } from '../../domain/port/contact.port';
import { ContactMessage } from '../../domain/model/contact/contact-message';

@Service()
export class ContactMockAdapter implements ContactPort {
  submit(message: ContactMessage): Observable<void> {
    // No real backend yet: simulate the contact form submission by logging it.
    console.info(`[mock] Contact message received from ${message.email}: ${message.subject ?? '(no subject)'}`);
    return of(undefined);
  }
}
