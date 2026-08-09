// Explicit, per-event consent to publish a member's own photos on the event's live feed —
// distinct from (and never implied by) `EventRegistration`: signing up to attend an event never
// grants the right to publish that member's image (see the spec's "Consentement" section). Also
// distinct from third-party right-to-image, which stays the publishing member's own
// responsibility in V1 (no automated face-detection/consent-of-others check).
export interface EventPhotoConsent {
  readonly eventId: string;
  readonly memberId: string;
  readonly consentedAt: string;
}

export function createEventPhotoConsent(fields: EventPhotoConsent): EventPhotoConsent {
  return Object.freeze({ ...fields });
}
