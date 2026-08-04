import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsletterSubscriptionPort } from '../../domain/port/newsletter-subscription.port';
import { NewsletterSubscriptionRequest, NewsletterSubscriptionResult } from '../../domain/model/newsletter-subscription';

@Service()
export class NewsletterSubscriptionMockAdapter implements NewsletterSubscriptionPort {
  subscribe(request: NewsletterSubscriptionRequest): Observable<NewsletterSubscriptionResult> {
    // Pas de backend réel pour l'instant : on simule l'entrée dans le journal RGPD
    // (traçabilité du consentement, requise par le doc de vision) en journalisant la requête,
    // puis on renvoie un statut "en attente de confirmation" pour matérialiser le double opt-in
    // (l'abonnement ne devient actif qu'après clic sur le lien de confirmation envoyé par email).
    console.info(
      `[mock][RGPD] Consentement newsletter enregistré : ${request.email} (langue: ${request.lang}, ` +
        `centres d'intérêt: ${request.interests.join(', ') || 'aucun'}, consentement: ${request.consent})`,
    );
    return of({ status: 'pendingConfirmation' });
  }
}
