import { MembershipTier } from '../membership/membership';
import { SocialLinks } from '../profile/professional-profile';

// Minimal, purely-cosmetic reference to a badge on the public card — deliberately not the
// full `Badge` model (icon/category/description): the card only needs a short label, kept as
// plain display text like the rest of this mocked demo content (see `RecognizedCertification`'s
// doc comment on "honest demo data" for the same rule applied to certifications).
export interface DigitalBusinessCardBadge {
  readonly code: string;
  readonly name: string;
}

export interface DigitalBusinessCard {
  readonly memberId: string;
  readonly publicSlug: string;
  readonly qrCodeUrl?: string;
  readonly vCardUrl?: string;
  readonly theme?: string;
  // The fields below are additive (optional) and only populated for the *public* rendering
  // of the card (`/card/:slug`, `DigitalBusinessCardPort.getPublicCard`) — they let that page
  // render a self-contained, privacy-respecting payload without cross-referencing the
  // member's private profile. `generateCard()` (the member's own management view) may also
  // populate them since it is always allowed to see its own public data.
  readonly displayName?: string;
  readonly title?: string;
  readonly tier?: MembershipTier;
  readonly socialLinks?: SocialLinks;
  readonly certifications?: readonly string[];
  readonly badges?: readonly DigitalBusinessCardBadge[];
}

export function createDigitalBusinessCard(fields: DigitalBusinessCard): DigitalBusinessCard {
  return Object.freeze({ ...fields });
}
