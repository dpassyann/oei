import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventRegistrationPort } from '../../domain/port/event/event-registration.port';
import { createEventRegistration, EventRegistration } from '../../domain/model/event/event-registration';

// Same demo member as `member-mock.adapter.ts`'s `DEMO_MEMBER`, so the whole mocked member space
// agrees on who "the current member" is (mirrors `ArticleSubmissionMockAdapter`).
const DEMO_MEMBER_ID = 'demo-member-1';

@Service()
export class EventRegistrationMockAdapter implements EventRegistrationPort {
  private readonly registrations: EventRegistration[] = [];
  private sequence = 0;

  register(eventId: string): Observable<EventRegistration> {
    const existing = this.registrations.find(
      (registration) => registration.eventId === eventId && registration.memberId === DEMO_MEMBER_ID,
    );
    if (existing) {
      return of(existing);
    }
    this.sequence += 1;
    const registration = createEventRegistration({
      id: `demo-event-registration-${this.sequence}`,
      eventId,
      memberId: DEMO_MEMBER_ID,
      status: 'GOING',
      registeredAt: new Date().toISOString(),
    });
    this.registrations.push(registration);
    return of(registration);
  }

  unregister(eventId: string): Observable<void> {
    const index = this.registrations.findIndex(
      (registration) => registration.eventId === eventId && registration.memberId === DEMO_MEMBER_ID,
    );
    if (index !== -1) {
      this.registrations.splice(index, 1);
    }
    return of(undefined);
  }

  getMyRegistration(eventId: string): Observable<EventRegistration | undefined> {
    return of(
      this.registrations.find(
        (registration) => registration.eventId === eventId && registration.memberId === DEMO_MEMBER_ID,
      ),
    );
  }
}
