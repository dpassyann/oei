import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  it('givenNoRouter_whenConstructed_thenStillGeneratesACorrelationId', () => {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: undefined }] });
    const service = TestBed.inject(CorrelationService);

    expect(service.value()).toMatch(/.+/);
  });

  it('givenTwoInstancesResolvedIndependently_whenComparingIds_thenEachHasItsOwnId', () => {
    TestBed.configureTestingModule({});
    const first = TestBed.inject(CorrelationService).value();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const second = TestBed.inject(CorrelationService).value();

    expect(first).not.toBe(second);
  });

  it('givenNavigationStartEvent_whenEmitted_thenMintsANewCorrelationId', () => {
    const events = new Subject<unknown>();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { events } }],
    });
    const service = TestBed.inject(CorrelationService);
    const initial = service.value();

    events.next(new NavigationStart(1, '/next-page'));

    expect(service.current()).not.toBe(initial);
  });

  it('givenNonNavigationRouterEvent_whenEmitted_thenKeepsTheSameCorrelationId', () => {
    const events = new Subject<unknown>();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { events } }],
    });
    const service = TestBed.inject(CorrelationService);
    const initial = service.value();

    events.next({ type: 'not-a-navigation-start' });

    expect(service.value()).toBe(initial);
  });

  it('givenRenewCalled_whenInvoked_thenReturnsAndStoresANewId', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(CorrelationService);
    const initial = service.value();

    const renewed = service.renew();

    expect(renewed).not.toBe(initial);
    expect(service.value()).toBe(renewed);
  });
});
