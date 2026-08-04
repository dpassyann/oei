import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DigitalBusinessCardPort } from '../../domain/port/wallet/digital-business-card.port';
import { createDigitalBusinessCard, DigitalBusinessCard } from '../../domain/model/wallet/digital-business-card';

// This port only returns metadata about the card (slug + placeholder asset paths); the
// presentation layer is responsible for actually rendering the QR code and generating the
// vCard content. No real image/vCard file needs to exist behind these mock paths.
const DEMO_CARD: DigitalBusinessCard = createDigitalBusinessCard({
  memberId: 'demo-member-1',
  publicSlug: 'demo-jane-dupont',
  qrCodeUrl: '/assets/mock/demo-jane-dupont-qr.svg',
  vCardUrl: '/assets/mock/demo-jane-dupont.vcf',
  theme: 'default',
});

@Service()
export class DigitalBusinessCardMockAdapter implements DigitalBusinessCardPort {
  generateCard(): Observable<DigitalBusinessCard> {
    return of(DEMO_CARD);
  }
}
