import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DIGITAL_BUSINESS_CARD_PORT } from '../../domain/port/wallet/digital-business-card.port';
import { DigitalBusinessCard } from '../../domain/model/wallet/digital-business-card';

@Service()
export class DigitalBusinessCardApplicationService {
  private readonly port = inject(DIGITAL_BUSINESS_CARD_PORT);

  generateCard(): Observable<DigitalBusinessCard> {
    return this.port.generateCard();
  }

  getPublicCard(publicSlug: string): Observable<DigitalBusinessCard | null> {
    return this.port.getPublicCard(publicSlug);
  }
}
