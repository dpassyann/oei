// A member's registration to a published `Event` (see `event.ts`). V1 only ever produces
// `GOING` — there is no waitlist/declined state yet (per the spec's "registration GOING").
export type EventRegistrationStatus = 'GOING';

export interface EventRegistration {
  readonly id: string;
  readonly eventId: string;
  readonly memberId: string;
  readonly status: EventRegistrationStatus;
  readonly registeredAt: string;
}

export function createEventRegistration(fields: EventRegistration): EventRegistration {
  return Object.freeze({ ...fields });
}
