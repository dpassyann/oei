import { Injectable } from '@angular/core';
import { LeadCapturePort } from '../../domain/port/lead-capture.port';

@Injectable({ providedIn: 'root' })
export class LeadCaptureMockAdapter implements LeadCapturePort {
  async submit(email: string): Promise<void> {
    // Pas de backend réel pour l'instant : on simule la capture du lead en journalisant l'email.
    console.info(`[mock] Lead capturé pour l'envoi du Livre Blanc : ${email}`);
  }
}
