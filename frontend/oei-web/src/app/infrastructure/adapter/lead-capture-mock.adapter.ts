import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LeadCapturePort } from '../../domain/port/lead-capture.port';

@Service()
export class LeadCaptureMockAdapter implements LeadCapturePort {
  submit(email: string): Observable<void> {
    // Pas de backend réel pour l'instant : on simule la capture du lead en journalisant l'email.
    console.info(`[mock] Lead capturé pour l'envoi du Livre Blanc : ${email}`);
    return of(undefined);
  }
}
