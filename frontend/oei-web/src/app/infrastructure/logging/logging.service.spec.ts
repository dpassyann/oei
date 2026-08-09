import { TestBed } from '@angular/core/testing';
import { LoggingService } from './logging.service';
import { CorrelationService } from './correlation.service';
import { REDACTED } from './sensitive-data.filter';

describe('LoggingService', () => {
  function createService(): LoggingService {
    TestBed.configureTestingModule({});
    return TestBed.inject(LoggingService);
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('givenDebugCalled_whenLogged_thenWritesToConsoleDebugAsJson', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const service = createService();

    service.debug('hello');

    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0] as string) as Record<string, unknown>;
    expect(parsed['level']).toBe('debug');
    expect(parsed['message']).toBe('hello');
  });

  it('givenInfoCalled_whenLogged_thenUsesConsoleInfo', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    createService().info('a message');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('givenWarnCalled_whenLogged_thenUsesConsoleWarn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    createService().warn('a message');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('givenErrorCalled_whenLogged_thenUsesConsoleError', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createService().error('a message');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('givenEntry_whenBuilt_thenIncludesTheCurrentNavigationCorrelationId', () => {
    const service = createService();
    const correlationId = TestBed.inject(CorrelationService).value();

    const entry = service.buildEntry('info', 'hello');

    expect(entry.correlationId).toBe(correlationId);
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('givenContext_whenBuilt_thenIsCarriedOnTheEntry', () => {
    const service = createService();

    const entry = service.buildEntry('debug', 'hello', undefined, 'MyContext');

    expect(entry.context).toBe('MyContext');
  });

  it('givenMetaWithSensitiveField_whenLogged_thenRedactsItBeforeSerializing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = createService();

    service.error('auth failed', { password: 'p@ssw0rd', attempt: 3 });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string) as { meta: { password: string; attempt: number } };
    expect(parsed.meta.password).toBe(REDACTED);
    expect(parsed.meta.attempt).toBe(3);
  });

  it('givenNoMeta_whenLogged_thenEntryHasNoMetaField', () => {
    const service = createService();

    const entry = service.buildEntry('info', 'hello');

    expect(entry.meta).toBeUndefined();
  });
});
