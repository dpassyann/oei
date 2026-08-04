export interface DigitalBusinessCard {
  readonly memberId: string;
  readonly publicSlug: string;
  readonly qrCodeUrl?: string;
  readonly vCardUrl?: string;
  readonly theme?: string;
}

export function createDigitalBusinessCard(fields: DigitalBusinessCard): DigitalBusinessCard {
  return Object.freeze({ ...fields });
}
