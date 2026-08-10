import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EventDetail } from './event-detail';
import { EventApplicationService } from '../../../../application/service/event-application.service';
import { EventRegistrationApplicationService } from '../../../../application/service/event-registration-application.service';
import { EventFeedApplicationService } from '../../../../application/service/event-feed-application.service';
import { EventPhotoConsentApplicationService } from '../../../../application/service/event-photo-consent-application.service';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { createEvent } from '../../../../domain/model/event/event';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const DEMO_EVENT = createEvent({
  id: 'event-1',
  slug: 'event-1',
  title: 'Événement de test',
  type: 'meetup',
  description: 'Description',
  location: { country: 'FR', city: 'Paris' },
  startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
  timezone: 'Europe/Paris',
  visibility: 'public',
  organizers: [],
  languages: ['fr'],
  status: 'REGISTRATION_OPEN',
});

describe('EventDetail', () => {
  function configure(options: { connected: boolean; registered?: boolean }) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: KeycloakAuthService, useValue: { isAuthenticated: () => options.connected } },
        { provide: EventApplicationService, useValue: { getBySlug: vi.fn().mockReturnValue(of(DEMO_EVENT)) } },
        {
          provide: EventRegistrationApplicationService,
          useValue: {
            getMyRegistration: vi
              .fn()
              .mockReturnValue(of(options.registered ? { id: 'reg-1', eventId: 'event-1' } : undefined)),
            register: vi.fn().mockReturnValue(of({ id: 'reg-1', eventId: 'event-1' })),
            unregister: vi.fn().mockReturnValue(of(undefined)),
          },
        },
        {
          provide: EventFeedApplicationService,
          useValue: {
            listPosts: vi.fn().mockReturnValue(of([])),
            listComments: vi.fn().mockReturnValue(of([])),
            addComment: vi.fn(),
            isFeedOpen: () => false,
            isCommentsOpen: () => false,
            createPost: vi.fn(),
            likePost: vi.fn(),
          },
        },
        {
          provide: EventPhotoConsentApplicationService,
          useValue: { hasConsented: vi.fn().mockReturnValue(of(false)), giveConsent: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'event-1' }) } },
        },
      ],
    });
  }

  it('givenVisitorNotConnected_whenRendered_thenShowsDisabledLoginCta', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(EventDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.oei-event-participate-pill--disabled');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('events.detail.loginToParticipate');
  });

  it('givenConnectedNotRegistered_whenRendered_thenShowsParticipateButton', async () => {
    configure({ connected: true, registered: false });
    const fixture = TestBed.createComponent(EventDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('events.detail.participate');
  });

  it('givenConnectedAndRegistered_whenRendered_thenShowsUnregisterToggle', async () => {
    configure({ connected: true, registered: true });
    const fixture = TestBed.createComponent(EventDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.oei-event-participate-pill--active');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('events.detail.unregister');
  });
});
