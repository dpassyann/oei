import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DigitalBusinessCardPort } from '../../domain/port/wallet/digital-business-card.port';
import { createDigitalBusinessCard, DigitalBusinessCard } from '../../domain/model/wallet/digital-business-card';

// This port only returns metadata about the card (slug + placeholder asset paths); the
// presentation layer is responsible for actually rendering the QR code and generating the
// vCard content. No real image/vCard file needs to exist behind these mock paths.
//
// The public-display fields (`displayName`/`title`/`tier`/`socialLinks`/`certifications`/
// `badges`) mirror the same demo member used across the rest of the mocked member space
// (`DEMO_MEMBER` in `member-mock.adapter.ts`, `DEMO_BADGE_AWARDS` in `badge-mock.adapter.ts`,
// the single validated certification in `certification-mock.adapter.ts`) so the public card
// page (`/card/{slug}`), the private card management page, and the badges/certifications
// pages all tell a consistent demo story for `demo-jane-dupont`.
const DEMO_CARD: DigitalBusinessCard = createDigitalBusinessCard({
  memberId: 'demo-member-1',
  publicSlug: 'demo-jane-dupont',
  qrCodeUrl: '/assets/mock/demo-jane-dupont-qr.svg',
  vCardUrl: '/assets/mock/demo-jane-dupont.vcf',
  theme: 'default',
  displayName: 'Jane Dupont (Démonstration)',
  title: 'Experte en éthique de l’intelligence artificielle',
  tier: 'SILVER',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/demo-jane-dupont',
    website: 'https://demo-jane-dupont.example',
  },
  certifications: ['AWS Certified Solutions Architect'],
  badges: [
    { code: 'MEMBER', name: 'Membre' },
    { code: 'CHARTER_SIGNED', name: 'Charte signée' },
    { code: 'PROFILE_VERIFIED', name: 'Profil vérifié' },
  ],
});

@Service()
export class DigitalBusinessCardMockAdapter implements DigitalBusinessCardPort {
  generateCard(): Observable<DigitalBusinessCard> {
    return of(DEMO_CARD);
  }

  getPublicCard(publicSlug: string): Observable<DigitalBusinessCard | null> {
    return of(publicSlug === DEMO_CARD.publicSlug ? DEMO_CARD : null);
  }
}
